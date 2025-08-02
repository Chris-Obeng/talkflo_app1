import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { X, Check, Crown } from "lucide-react";
import { toast } from "sonner";

// Declare the DodoPayments global object
declare global {
  interface Window {
    DodoPayments: any;
  }
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const createSubscription = useAction(api.dodoPayments.createSubscription);
  const [loading, setLoading] = useState<string | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    // Initialize Dodo Payments SDK when modal opens
    if (isOpen && !isSDKLoaded) {
      // Load the Dodo Payments SDK script
      const script = document.createElement('script');
      script.src = 'https://checkout.dodopayments.com/sdk.js';
      script.async = true;
      script.onload = () => {
        if (window.DodoPayments) {
          window.DodoPayments.Initialize({
            mode: "test", // Change to 'live' for production
            onEvent: (event: any) => {
              console.log("Checkout event:", event);
              
              switch (event.event_type) {
                case "checkout.opened":
                  setLoading(null);
                  break;
                case "checkout.error":
                  toast.error("Checkout error occurred");
                  setLoading(null);
                  break;
                case "checkout.completed":
                  toast.success("Payment completed successfully!");
                  onClose();
                  break;
              }
            },
            theme: "light",
            displayType: "overlay"
          });
          setIsSDKLoaded(true);
        }
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup script when component unmounts
        const existingScript = document.querySelector('script[src="https://checkout.dodopayments.com/sdk.js"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [isOpen, isSDKLoaded, onClose]);

  const handleSubscribe = async (plan: string, planName: string) => {
    setLoading(plan);
    try {
      console.log(`Starting subscription for plan: ${plan}`);
      // First, create the subscription on the backend
      const result = await createSubscription({ plan });
      
      if (!result || !result.paymentLink) {
        toast.error("Failed to create subscription link");
        setLoading(null);
        return;
      }

      console.log(`Payment link received: ${result.paymentLink}`);

      // Open the checkout using the SDK
      if (window.DodoPayments) {
        await window.DodoPayments.Checkout.open({
          paymentLink: result.paymentLink,
          redirectUrl: `${window.location.origin}/success`,
        });
      } else {
        // Fallback to direct redirect if SDK is not loaded
        console.log("SDK not loaded, redirecting directly");
        window.location.href = result.paymentLink;
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to create subscription. Please try again.");
      setLoading(null);
    }
  };

  const handleMonthlySubscribe = () => {
    void handleSubscribe(import.meta.env.VITE_DODO_MONTHLY_PRODUCT_ID, "monthly");
  };

  const handleAnnualSubscribe = () => {
    void handleSubscribe(import.meta.env.VITE_DODO_ANNUAL_PRODUCT_ID, "annual");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade to Premium</h2>
            <p className="text-gray-600 mt-1">Unlock unlimited voice recordings and AI-powered features</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Monthly</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">$9</span>
                  <span className="text-gray-600 ml-1">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited voice recordings</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">AI-powered note generation</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Organize with folders and tags</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Share and publish notes</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">7-day free trial</span>
                </li>
              </ul>

              <Button
                onClick={handleMonthlySubscribe}
                disabled={loading === import.meta.env.VITE_DODO_MONTHLY_PRODUCT_ID}
                className="w-full"
                variant="outline"
              >
                {loading === import.meta.env.VITE_DODO_MONTHLY_PRODUCT_ID ? "Loading..." : "Start Monthly Plan"}
              </Button>
            </div>

            {/* Annual Plan */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <Crown className="w-4 h-4 mr-1" />
                  Best Value
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Annual</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">$80</span>
                  <span className="text-gray-600 ml-1">/year</span>
                </div>
                <p className="text-green-600 text-sm mt-1">Save $28 compared to monthly</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Everything in Monthly</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Early access to new features</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">2 months free</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">7-day free trial</span>
                </li>
              </ul>

              <Button
                onClick={handleAnnualSubscribe}
                disabled={loading === import.meta.env.VITE_DODO_ANNUAL_PRODUCT_ID}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {loading === import.meta.env.VITE_DODO_ANNUAL_PRODUCT_ID ? "Loading..." : "Start Annual Plan"}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Secure payment processing by Dodo Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal; 