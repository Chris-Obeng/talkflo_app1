import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const SubscriptionDebug = () => {
    const subscription = useQuery(api.dodoPayments.getSubscription);
    const hasActive = useQuery(api.dodoPayments.hasActiveSubscription);
    const debugUser = useQuery(api.dodoPayments.debugUser);

    return (
        <div className="bg-gray-100 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Subscription Debug Info</h3>
            <div className="space-y-2 text-sm">
                <div>
                    <strong>User Debug:</strong>
                    <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
                        {JSON.stringify(debugUser, null, 2)}
                    </pre>
                </div>
                <div>
                    <strong>Has Active Subscription:</strong> {hasActive ? "Yes" : "No"}
                </div>
                <div>
                    <strong>Subscription Data:</strong>
                    <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
                        {JSON.stringify(subscription, null, 2)}
                    </pre>
                </div>
                <div>
                    <strong>Environment Variables:</strong>
                    <ul className="list-disc list-inside">
                        <li>Monthly Product ID: {import.meta.env.VITE_DODO_MONTHLY_PRODUCT_ID}</li>
                        <li>Annual Product ID: {import.meta.env.VITE_DODO_ANNUAL_PRODUCT_ID}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDebug;