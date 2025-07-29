"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";


export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F2F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-normal text-gray-800 mb-4 tracking-wide heading">
            Talkflo
            <span className="block w-12 h-1 bg-[#FF4500] rounded-full mt-3 mx-auto"></span>
          </h1>
          <p className="text-lg text-gray-600 ui-text">
            Transform your voice into organized notes with AI
          </p>
        </div>



        {/* Sign In Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-container p-8 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 heading mb-2">
              {flow === "signIn" ? "Welcome back" : "Get started"}
            </h2>
            <p className="text-gray-600 ui-text">
              {flow === "signIn"
                ? "Sign in to access your notes"
                : "Create your account to begin"
              }
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitting(true);
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData).catch((error) => {
                let toastTitle = "";
                if (error.message.includes("Invalid password")) {
                  toastTitle = "Invalid password. Please try again.";
                } else {
                  toastTitle =
                    flow === "signIn"
                      ? "Could not sign in, did you mean to sign up?"
                      : "Could not sign up, did you mean to sign in?";
                }
                toast.error(toastTitle);
                setSubmitting(false);
              });
            }}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 ui-text">
                Email address
              </label>
              <input
                id="email"
                className="auth-input-field"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 ui-text">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="auth-input-field pr-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              className="auth-button mt-2"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {flow === "signIn" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                flow === "signIn" ? "Sign in" : "Create account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600 ui-text">
              {flow === "signIn"
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-sm text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer ui-text transition-colors"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 ui-text">
            Start recording your thoughts and let AI organize them beautifully
          </p>
        </div>
      </div>
    </div>
  );
}
