import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import SubscriptionDebug from "./SubscriptionDebug";

const PricingPage = () => {
    const createSubscription = useAction(api.dodoPayments.createSubscription);
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (plan: string, planName: string) => {
        setLoading(plan);
        try {
            console.log(`Starting subscription for plan: ${plan}`);
            const result = await createSubscription({ plan });
            
            if (result && result.paymentLink) {
                console.log(`Redirecting to payment link: ${result.paymentLink}`);
                window.location.href = result.paymentLink;
            } else {
                console.error("No payment link received:", result);
                toast.error("Failed to create subscription link");
            }
        } catch (error: any) {
            console.error("Subscription error:", error);
            toast.error(error.message || "Failed to create subscription. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    const handleMonthlySubscribe = () => {
        void handleSubscribe(import.meta.env.VITE_DODO_MONTHLY_PRODUCT_ID, "monthly");
    };

    const handleAnnualSubscribe = () => {
        void handleSubscribe(import.meta.env.VITE_DODO_ANNUAL_PRODUCT_ID, "annual");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl mx-auto text-center">
                <SubscriptionDebug />
                <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Start recording your thoughts and let AI transform them into organized notes
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-4">Monthly</h2>
                        <p className="text-4xl font-bold mb-2">$9</p>
                        <p className="text-gray-600 mb-6">per month</p>
                        <ul className="text-left mb-6 space-y-2">
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Unlimited voice recordings
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                AI-powered note generation
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Organize with folders and tags
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Share and publish notes
                            </li>
                        </ul>
                        <Button
                            onClick={handleMonthlySubscribe}
                            disabled={loading === import.meta.env.VITE_DODO_MONTHLY_PRODUCT_ID}
                            className="w-full"
                        >
                            {loading === import.meta.env.VITE_DODO_MONTHLY_PRODUCT_ID ? "Loading..." : "Subscribe Monthly"}
                        </Button>
                    </div>
                    
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                Best Value
                            </span>
                        </div>
                        <h2 className="text-2xl font-semibold mb-4">Annual</h2>
                        <p className="text-4xl font-bold mb-2">$80</p>
                        <p className="text-gray-600 mb-6">per year</p>
                        <p className="text-green-600 text-sm mb-6">Save $28 compared to monthly</p>
                        <ul className="text-left mb-6 space-y-2">
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Everything in Monthly
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Priority support
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Early access to new features
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                2 months free
                            </li>
                        </ul>
                        <Button
                            onClick={handleAnnualSubscribe}
                            disabled={loading === import.meta.env.VITE_DODO_ANNUAL_PRODUCT_ID}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                            {loading === import.meta.env.VITE_DODO_ANNUAL_PRODUCT_ID ? "Loading..." : "Subscribe Annual"}
                        </Button>
                    </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-8">
                    All plans include a 7-day free trial. Cancel anytime.
                </p>
            </div>
        </div>
    );
};

export default PricingPage;