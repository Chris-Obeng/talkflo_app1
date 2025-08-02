import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

const CancelPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
                <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Subscription Cancelled</h1>
                <p className="text-gray-600 mb-6">
                    Your subscription process was cancelled. You can still use Talkflo with limited features.
                </p>
                <div className="space-y-4">
                    <Link
                        to="/pricing"
                        className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Try Again
                    </Link>
                    <Link
                        to="/"
                        className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Continue with Free Plan
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CancelPage; 