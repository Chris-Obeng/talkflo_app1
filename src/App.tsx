import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { TalkfloApp } from "./components/TalkfloApp";
import { Toaster } from "sonner";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PublishedNotePage } from "./components/PublishedNotePage";
import { Spinner } from "./components/ui/ios-spinner";
import SettingsPage from "./components/SettingsPage";
import LandingPage from "./components/LandingPage";
import { Analytics } from "@vercel/analytics/react";
import PricingPage from "./components/PricingPage";
import SuccessPage from "./components/SuccessPage";
import CancelPage from "./components/CancelPage";

export default function App() {
  const user = useQuery(api.auth.loggedInUser);

  return (
    <main>
      <Analytics />
      <Toaster position="top-center" />
      <Router>
        <Routes>
          <Route path="/p/:token" element={<PublishedNotePage />} />
          <Route path="/signin" element={<SignInForm />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/settings" element={
            user === undefined ? (
              <div className="min-h-screen flex items-center justify-center bg-[#F5F2F0]">
                <Spinner size="lg" className="text-[#FF4500] w-16 h-16" />
              </div>
            ) : user === null ? (
              <SignInForm />
            ) : (
              <SettingsPage />
            )
          } />
          <Route path="/app" element={
            user === undefined ? (
              <div className="min-h-screen flex items-center justify-center bg-[#F5F2F0]">
                <Spinner size="lg" className="text-[#FF4500] w-16 h-16" />
              </div>
            ) : user === null ? (
              <SignInForm />
            ) : (
              <TalkfloApp />
            )
          } />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </main>
  );
}
