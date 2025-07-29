import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Mic, Square, Play, Pause, X, RotateCcw, Loader, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Id, Doc } from "../../convex/_generated/dataModel";
import { Spinner } from "./ui/ios-spinner";

interface RecordingWidgetProps {
  onClose: () => void;
  folderId?: Id<"folders">;
  noteToAppendTo?: Doc<"notes">;
}

export function RecordingWidget({ onClose, folderId, noteToAppendTo }: RecordingWidgetProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingId, setRecordingId] = useState<Id<"recordings"> | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(32).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const shouldAnimateRef = useRef<boolean>(false);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createRecording = useMutation(api.storage.createRecording);
  const recordingStatus = useQuery(
    api.storage.getRecordingStatus,
    recordingId ? { recordingId } : "skip"
  );

  useEffect(() => {
    if (recordingStatus?.status === "completed" || recordingStatus?.status === "failed") {
      toast.success("Processing complete!");
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [recordingStatus, onClose]);

  // Auto-start recording when component mounts
  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      shouldAnimateRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    shouldAnimateRef.current = true;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current || !shouldAnimateRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);

      // Update frequency data for wave visualizer
      const sampledData = [];
      const step = Math.max(1, Math.floor(dataArray.length / 32));
      
      for (let i = 0; i < 32; i++) {
        const index = Math.min(i * step, dataArray.length - 1);
        const value = dataArray[index] / 255;
        sampledData.push(value);
      }
      setFrequencyData(sampledData);

      // Continue animation while shouldAnimate is true
      if (shouldAnimateRef.current) {
        animationRef.current = requestAnimationFrame(updateLevel);
      }
    };
    updateLevel();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Configure analyser for better frequency visualization
      analyser.fftSize = 512; // Increased for better frequency resolution
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      analyserRef.current = analyser;
      console.log('Audio analyser setup complete, frequency bins:', analyser.frequencyBinCount);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setIsInitializing(false);

      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      monitorAudioLevel();
      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording. Please check microphone permissions.");
      setIsInitializing(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Don't cancel animation frame - keep visualizer running
      toast.info("Recording paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
      // Don't call monitorAudioLevel again - it should already be running
      toast.success("Recording resumed");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    setIsProcessing(true);

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);

    // Stop animation and clear intervals
    shouldAnimateRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    mediaRecorderRef.current.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const uploadUrl = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": audioBlob.type },
          body: audioBlob,
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload audio");

        const { storageId } = await uploadResponse.json();
        const newRecordingId = await createRecording({
          audioData: storageId,
          duration,
          folderId: noteToAppendTo ? noteToAppendTo.folderId : folderId,
          noteIdToAppend: noteToAppendTo ? noteToAppendTo._id : undefined,
        });
        setRecordingId(newRecordingId);
        toast.success("Recording saved! Processing...");
      } catch (error) {
        console.error("Error saving recording:", error);
        toast.error("Failed to save recording");
        setIsProcessing(false);
      } finally {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    };
  };

  const resetRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioLevel(0);
    setFrequencyData(new Array(32).fill(0));
    audioChunksRef.current = [];
    
    // Stop animation and clear intervals
    shouldAnimateRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    toast.info("Recording reset");
  };

  const handleCancelClick = () => {
    // Show confirmation dialog only if recording is active or paused
    if (isRecording || isPaused || duration > 0) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    // Stop recording and clean up
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioLevel(0);
    setFrequencyData(new Array(32).fill(0));
    audioChunksRef.current = [];
    
    // Stop animation and clear intervals
    shouldAnimateRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCancelConfirmation(false);
    onClose();
  };

  const handleContinueRecording = () => {
    setShowCancelConfirmation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const WaveVisualizer = () => {
    return (
      <div className="flex items-end justify-center space-x-1 h-16 mb-6">
        {frequencyData.map((amplitude, index) => {
          const height = Math.max(4, amplitude * 60); // Min height 4px, max 60px
          const opacity = isPaused ? 0.3 : Math.max(0.3, amplitude);

          return (
            <div
              key={index}
              className="bg-[#FF4500] rounded-full transition-all duration-75 ease-out"
              style={{
                width: '3px',
                height: `${height}px`,
                opacity: opacity,
                transform: `scaleY(${isPaused ? 0.5 : 1})`,
              }}
            />
          );
        })}
      </div>
    );
  };

  const getStatusContent = () => {
    if (isProcessing) {
      return (
        <div>
          <p className="text-lg font-semibold text-gray-800 mb-2">
            {recordingStatus?.status === 'failed' ? 'Processing Failed' : 'Processing...'}
          </p>
          <p className="text-sm text-gray-600">
            {recordingStatus?.status === 'processing' && 'Transcribing and enhancing your note'}
            {recordingStatus?.status === 'completed' && 'Note created successfully!'}
            {recordingStatus?.status === 'failed' && 'Something went wrong. Please try again.'}
          </p>
        </div>
      );
    }
    if (isRecording) {
      return (
        <div>
          <p className="text-2xl font-bold text-[#FF4500] mb-2">{formatTime(duration)}</p>
          <p className="text-sm text-gray-600">{isPaused ? "Recording paused" : "Recording in progress"}</p>
        </div>
      );
    }
    if (isInitializing) {
      return (
        <div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Starting recording...</p>
          <p className="text-sm text-gray-600">Please allow microphone access</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Confirmation Dialog */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-700 text-white rounded-2xl p-6 max-w-sm mx-4 text-center">
            <h3 className="text-lg font-medium mb-6">Cancel this recording?</h3>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleConfirmCancel}
                className="bg-[#FF4500] hover:bg-orange-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                yes, cancel
              </button>
              <button
                onClick={handleContinueRecording}
                className="bg-transparent border border-gray-400 text-white hover:bg-gray-600 px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                no, continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
        <div className="flex justify-end mb-4">
          <button onClick={handleCancelClick} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          {isProcessing && (
            <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              {recordingStatus?.status === 'completed' ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <Spinner size="lg" className="text-[#FF4500] w-16 h-16" />
              )}
            </div>
          )}
        </div>

        <div className="mb-8">{getStatusContent()}</div>

        {/* Wave Visualizer - only show when recording or paused */}
        {(isRecording || isPaused) && !isProcessing && (
          <WaveVisualizer />
        )}

        <div className="flex justify-center space-x-4">
          {isRecording && !isPaused && (
            <>
              <button onClick={pauseRecording} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-full transition-colors">
                <Pause className="w-5 h-5" />
              </button>
              <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-full transition-colors">
                <Square className="w-5 h-5" />
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button onClick={resumeRecording} className="bg-[#FF4500] hover:bg-orange-600 text-white px-4 py-3 rounded-full transition-colors">
                <Play className="w-5 h-5" />
              </button>
              <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-full transition-colors">
                <Square className="w-5 h-5" />
              </button>
            </>
          )}
          {(isRecording || isPaused) && !isProcessing && (
            <button onClick={resetRecording} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-3 rounded-full transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
