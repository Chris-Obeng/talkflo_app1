import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const SuccessPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Welcome to Talkflo!</h1>
                <p className="text-gray-600 mb-6">
                    Your subscription has been activated successfully. You now have access to all premium features.
                </p>
                <div className="space-y-4">
                    <Link
                        to="/app"
                        className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Start Recording
                    </Link>
                    <p className="text-sm text-gray-500">
                        You'll receive a confirmation email shortly with your subscription details.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage; 