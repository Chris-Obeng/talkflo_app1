"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const user = useQuery(api.auth.loggedInUser);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to app if user is already signed in
  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  // Reset submitting state if user query changes
  useEffect(() => {
    if (user !== undefined) {
      setSubmitting(false);
    }
  }, [user]);

  // Show loading if user query is still loading
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/3 to-orange-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* Back to Home Link */}
      <motion.a
        href="/"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back to Home</span>
      </motion.a>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
        </motion.div>

        {/* Sign In Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 heading mb-2">
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
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);

              try {
                const formData = new FormData(e.target as HTMLFormElement);
                formData.set("flow", flow);

                await signIn("password", formData);
                // Success - the useEffect will handle the redirect
                toast.success(flow === "signIn" ? "Welcome back!" : "Account created successfully!");
                // Don't reset submitting here - let the redirect happen
              } catch (error: any) {
                console.error("Sign in error:", error);
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
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3 ui-text">
                Email address
              </label>
              <input
                id="email"
                className="w-full px-4 py-4 rounded-2xl bg-gray-50/50 border border-gray-200/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 backdrop-blur-sm"
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-3 ui-text">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="w-full px-4 py-4 pr-12 rounded-2xl bg-gray-50/50 border border-gray-200/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 backdrop-blur-sm"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{flow === "signIn" ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                <>
                  <span>{flow === "signIn" ? "Sign in" : "Create account"}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <span className="text-sm text-gray-600 ui-text">
              {flow === "signIn"
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-sm text-primary hover:text-primary-hover font-semibold cursor-pointer ui-text transition-colors duration-200 hover:underline"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </motion.div>
        </motion.div>


      </div>
    </div>
  );
}
