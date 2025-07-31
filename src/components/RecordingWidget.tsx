import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Square, Play, Pause, X, RotateCcw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Id, Doc } from "../../convex/_generated/dataModel";
import { Spinner } from "./ui/ios-spinner";

// Custom hook for responsive design
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

interface RecordingWidgetProps {
  onClose: () => void;
  folderId?: Id<"folders">;
  noteToAppendTo?: Doc<"notes">;
}

export function RecordingWidget({ onClose, folderId, noteToAppendTo }: RecordingWidgetProps) {
  const isMobile = useIsMobile();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "failed">("idle");
  const [recordingId, setRecordingId] = useState<Id<"recordings"> | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(150).fill(0));

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
      const overallVolume = dataArray.reduce((a, b) => a + b) / dataArray.length / 255;

      setFrequencyData(prevFrequencyData => {
        const newFrequencyData = [];
        const numBars = 150;
        const step = Math.floor(dataArray.length / numBars);

        for (let i = 0; i < numBars; i++) {
          const index = i * step;
          const value = dataArray[index] / 255;

          // Smoothed base value
          const smoothedValue = (prevFrequencyData[i] || 0) * 0.7 + value * 0.3;

          // Create a complex, traveling wave effect
          const time = Date.now() * 0.006;
          const wave1 = Math.sin(i * 0.1 - time) * 0.1;
          const wave2 = Math.sin(i * 0.05 + time * 0.5) * 0.05;

          // Make wave intensity dependent on overall volume
          const waveIntensity = Math.pow(overallVolume, 1.5);

          const finalValue = smoothedValue + (wave1 + wave2) * waveIntensity;
          newFrequencyData.push(Math.min(1, Math.max(0.02, finalValue)));
        }
        return newFrequencyData;
      });

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
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      monitorAudioLevel();
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Don't cancel animation frame - keep visualizer running
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
      // Don't call monitorAudioLevel again - it should already be running
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    setIsProcessing(true);
    setUploadStatus("uploading");

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

        setUploadStatus("processing");
        const { storageId } = await uploadResponse.json();
        const newRecordingId = await createRecording({
          audioData: storageId,
          duration,
          folderId: noteToAppendTo ? noteToAppendTo.folderId : folderId,
          noteIdToAppend: noteToAppendTo ? noteToAppendTo._id : undefined,
        });
        setRecordingId(newRecordingId);
      } catch (error) {
        console.error("Error saving recording:", error);
        toast.error("Failed to save recording");
        setUploadStatus("failed");
        setIsProcessing(false);
      } finally {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    };
  };

  const resetRecording = async () => {
    // Stop current recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    // Stop animation and clear intervals
    shouldAnimateRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Reset state
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setFrequencyData(new Array(150).fill(0));
    audioChunksRef.current = [];

    // Restart recording
    await startRecording();
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
    setFrequencyData(new Array(150).fill(0));
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

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Confirmation Dialog */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-700 text-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-medium mb-6">Cancel this recording?</h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleConfirmCancel}
                className="bg-primary hover:bg-primary-hover active:bg-primary-hover text-white px-6 py-3 sm:py-2 rounded-full text-sm font-medium transition-colors touch-manipulation"
              >
                yes, cancel
              </button>
              <button
                onClick={handleContinueRecording}
                className="bg-transparent border border-gray-400 text-white hover:bg-gray-600 active:bg-gray-600 px-6 py-3 sm:py-2 rounded-full text-sm font-medium transition-colors touch-manipulation"
              >
                no, continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md sm:max-w-lg">
        {/* Main Recording Card */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-600 rounded-2xl sm:rounded-[32px] shadow-2xl px-4 sm:px-8 pt-2 sm:pt-4 pb-4 sm:pb-6 w-full min-h-[200px] sm:min-h-[260px] relative">

          {/* Timer Display */}
          <div className="text-center mb-1 sm:mb-2">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  {uploadStatus === 'processing' && recordingStatus?.status === 'completed' ? (
                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  ) : (
                    <Spinner size="lg" className="text-white w-8 h-8 sm:w-12 sm:h-12" />
                  )}
                </div>
                <p className="text-base sm:text-lg font-semibold text-white mb-1">
                  {uploadStatus === 'uploading' && 'Uploading...'}
                  {uploadStatus === 'processing' && (recordingStatus?.status === 'failed' ? 'Processing Failed' : 'Processing...')}
                  {uploadStatus === 'failed' && 'Upload Failed'}
                </p>
                <p className="text-xs sm:text-sm text-white/80 px-2">
                  {uploadStatus === 'uploading' && 'Please wait...'}
                  {uploadStatus === 'processing' && recordingStatus?.status === 'processing' && 'Transcribing and enhancing your note'}
                  {uploadStatus === 'processing' && recordingStatus?.status === 'completed' && 'Note created successfully!'}
                  {uploadStatus === 'processing' && recordingStatus?.status === 'failed' && 'Something went wrong. Please try again.'}
                  {uploadStatus === 'failed' && 'Your recording could not be uploaded.'}
                </p>
              </div>
            ) : (
              <div className="text-4xl font-bold text-white tracking-wider">
                {formatTime(duration)}
              </div>
            )}
          </div>

          {/* Wave Visualizer */}
          {(isRecording || isPaused) && !isProcessing && (
            <div className="flex items-end justify-center space-x-[0.5px] sm:space-x-[1px] h-12 sm:h-20 sm:mb-3">
              {frequencyData.slice(0, isMobile ? 120 : 150).map((amplitude, index) => {
                // Responsive height scaling
                const baseHeight = 4;
                const maxHeight = isMobile ? 40 : 65;
                const height = baseHeight + (amplitude * (maxHeight - baseHeight));
                const opacity = isPaused ? 0.5 : Math.max(0.7, amplitude + 0.2);

                return (
                  <div
                    key={index}
                    className="bg-white transition-all duration-100 ease-out"
                    style={{
                      width: isMobile ? '1px' : '1.5px',
                      height: `${height}px`,
                      opacity: opacity,
                      transform: `scaleY(${isPaused ? 0.8 : 1})`,
                      borderRadius: '1px',
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-3 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex justify-between items-center">
            {/* Left Item: Pause/Resume */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
              {(isRecording || isPaused) && !isProcessing && (
                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="w-full h-full flex items-center justify-center text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors touch-manipulation"
                >
                  {isPaused ? (
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                  ) : (
                    <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                  )}
                </button>
              )}
            </div>

            {/* Center Item: Stop */}
            <div>
              {(isRecording || isPaused) && !isProcessing && (
                <button
                  onClick={stopRecording}
                  className="bg-white hover:bg-gray-200 text-orange-600 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg transition-colors touch-manipulation"
                >
                  <Square className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                </button>
              )}
            </div>

            {/* Right Item: Close */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
              <button onClick={handleCancelClick} className="w-full h-full flex items-center justify-center text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors touch-manipulation">
                <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
