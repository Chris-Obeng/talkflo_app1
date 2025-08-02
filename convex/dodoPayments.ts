import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { action, internalAction, internalMutation, mutation, query, httpAction } from "./_generated/server";
import { Webhook } from "standardwebhooks";
import DodoPayments from "dodopayments";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }

        const user = await ctx.db.get(userId);
        return user;
    },
});

export const debugUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return { authenticated: false, userId: null, user: null };
        }

        const user = await ctx.db.get(userId);
        return {
            authenticated: true,
            userId: userId,
            user: user,
            userKeys: user ? Object.keys(user) : []
        };
    },
});

export const getSubscription = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User is not authenticated");
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        return subscription;
    },
});

export const hasActiveSubscription = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return false;
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        if (!subscription) {
            return false;
        }

        // Check if subscription is active and not expired
        const isActive = subscription.status === "active";
        const notExpired = subscription.endsOn > Date.now();

        return isActive && notExpired;
    },
});

export const createSubscription = action({
    args: { plan: v.string() }, // plan is the product ID from Dodo Payments dashboard
    handler: async (ctx, { plan }) => {
        // Get user info using the auth query
        const user = await ctx.runQuery(api.dodoPayments.getCurrentUser);
        if (!user) {
            throw new Error("User is not authenticated");
        }

        console.log("User object structure:", Object.keys(user));
        console.log("User data:", user);
        console.log("Plan ID being used:", plan);
        console.log("Environment:", process.env.DODO_PAYMENTS_ENVIRONMENT);

        if (!process.env.DODO_API_KEY) {
            throw new Error("DODO_API_KEY is not configured");
        }

        if (!process.env.HOSTING_URL) {
            throw new Error("HOSTING_URL is not configured");
        }

        // Validate plan ID (TEST MODE)
        const validPlans = [
            "pdt_NbDFxxJzUKVZ32wjtWLXL", // Monthly (Test)
            "pdt_NcwhabaNUbTAp1o4sfq1A"  // Annual (Test)
        ];
        
        if (!validPlans.includes(plan)) {
            throw new Error(`Invalid plan ID: ${plan}`);
        }

        const dodo = new DodoPayments({
            bearerToken: process.env.DODO_API_KEY,
            environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
        });

        // Test API connection first
        try {
            console.log("Testing API connection...");
            const products = await dodo.products.list();
            console.log("Available products:", products.items?.map(p => ({ id: p.product_id, name: p.name })));
        } catch (testError: any) {
            console.error("API connection test failed:", testError);
            throw new Error(`API connection failed: ${testError.message}`);
        }

        try {
            console.log(`Creating subscription for user ${user._id} with plan ${plan}`);
            console.log(`API Key configured: ${process.env.DODO_API_KEY ? 'Yes' : 'No'}`);
            console.log(`API Key length: ${process.env.DODO_API_KEY?.length || 0}`);
            
            // Log customer information for debugging
            console.log(`Customer info:`, {
                email: user.email,
                name: user.name,
                userId: user._id,
                fullUser: user
            });

            // Validate customer data
            if (!user.email) {
                throw new Error("User email is required but not available");
            }

            const customerName = user.name || user.email.split('@')[0] || 'User';
            console.log(`Using customer name: ${customerName}`);

            const subscription = await dodo.subscriptions.create({
                product_id: plan,
                customer: {
                    email: user.email!,
                    name: customerName,
                },
                billing: {
                    city: "San Francisco",
                    country: "US", // Must be valid ISO country code
                    state: "CA",
                    street: "123 Main St",
                    zipcode: "94102", // Must be a string
                },
                payment_link: true,
                return_url: `${process.env.HOSTING_URL}/success`,
                metadata: {
                    userId: user._id,
                    userEmail: user.email!,
                    planType: plan === "pdt_NbDFxxJzUKVZ32wjtWLXL" ? "monthly" : "annual",
                },
                quantity: 1,
            });

            console.log(`Subscription created successfully: ${subscription.subscription_id}`);
            console.log(`Payment link: ${subscription.payment_link}`);

            if (!subscription.payment_link) {
                throw new Error("No payment link received from Dodo Payments");
            }

            return {
                paymentLink: subscription.payment_link,
                subscriptionId: subscription.subscription_id,
            };
        } catch (error: any) {
            console.error("Dodo Payments API error details:", {
                message: error.message,
                status: error.status,
                name: error.name,
                headers: error.headers,
                body: error.body,
                stack: error.stack
            });
            
            // Handle specific API errors
            if (error.status === 401) {
                throw new Error("Authentication failed. Please check your API key configuration.");
            } else if (error.status === 404) {
                throw new Error("Product not found. Please check the product ID.");
            } else if (error.status === 400) {
                throw new Error(`Invalid request: ${error.message || "Bad request"}`);
            } else if (error.message?.includes("product_id")) {
                throw new Error("Invalid subscription plan selected. Please try again.");
            } else if (error.message?.includes("customer")) {
                throw new Error("Customer information is invalid. Please check your account details.");
            } else if (error.message?.includes("billing")) {
                throw new Error("Billing address validation failed. Please contact support.");
            } else {
                throw new Error(`Failed to create subscription: ${error.message || "Unknown error"}`);
            }
        }
    },
});

export const fulfillSubscription = action({
    args: { event: v.any() },
    handler: async (ctx, { event }) => {
        console.log("Dodo webhook event received:", event.type, JSON.stringify(event, null, 2));
        
        try {
            // Handle subscription.active event - when subscription is activated
            if (event.type === "subscription.active") {
                const subscriptionData = event.data;
                const userId = subscriptionData.metadata?.userId;

                if (!userId) {
                    console.error("Webhook received for subscription without userId in metadata");
                    return { success: false, error: "No userId in metadata" };
                }

                console.log(`Activating subscription ${subscriptionData.subscription_id} for user ${userId}`);

                // Calculate end date (30 days from now for monthly, 365 days for annual)
                const isMonthly = subscriptionData.metadata?.planType === "monthly";
                const daysToAdd = isMonthly ? 30 : 365;
                const endsOn = Date.now() + (daysToAdd * 24 * 60 * 60 * 1000);

                await ctx.runMutation(api.dodoPayments.updateSubscription, {
                    userId,
                    subscriptionId: subscriptionData.subscription_id,
                    endsOn,
                    status: "active" as const,
                });

                console.log(`✅ Subscription activated for user ${userId}`);
                return { success: true, message: "Subscription activated" };
            }

            // Handle subscription.renewed event
            if (event.type === "subscription.renewed") {
                const subscriptionData = event.data;
                const userId = subscriptionData.metadata?.userId;

                if (userId) {
                    console.log(`Renewing subscription ${subscriptionData.subscription_id} for user ${userId}`);
                    
                    // Calculate new end date
                    const isMonthly = subscriptionData.metadata?.planType === "monthly";
                    const daysToAdd = isMonthly ? 30 : 365;
                    const endsOn = Date.now() + (daysToAdd * 24 * 60 * 60 * 1000);

                    await ctx.runMutation(api.dodoPayments.updateSubscription, {
                        userId,
                        subscriptionId: subscriptionData.subscription_id,
                        endsOn,
                        status: "active" as const,
                    });

                    console.log(`✅ Subscription renewed for user ${userId}`);
                }
                return { success: true, message: "Subscription renewed" };
            }

            // Handle subscription.cancelled event
            if (event.type === "subscription.cancelled") {
                const subscriptionData = event.data;
                const userId = subscriptionData.metadata?.userId;

                if (userId) {
                    console.log(`Cancelling subscription ${subscriptionData.subscription_id} for user ${userId}`);
                    
                    await ctx.runMutation(api.dodoPayments.updateSubscription, {
                        userId,
                        subscriptionId: subscriptionData.subscription_id,
                        endsOn: Date.now(),
                        status: "cancelled" as const,
                    });

                    console.log(`✅ Subscription cancelled for user ${userId}`);
                }
                return { success: true, message: "Subscription cancelled" };
            }

            // Handle subscription.failed event
            if (event.type === "subscription.failed") {
                const subscriptionData = event.data;
                const userId = subscriptionData.metadata?.userId;

                if (userId) {
                    console.log(`Subscription failed ${subscriptionData.subscription_id} for user ${userId}`);
                    
                    await ctx.runMutation(api.dodoPayments.updateSubscription, {
                        userId,
                        subscriptionId: subscriptionData.subscription_id,
                        endsOn: Date.now(),
                        status: "expired" as const,
                    });

                    console.log(`❌ Subscription failed for user ${userId}`);
                }
                return { success: true, message: "Subscription failed" };
            }

            // Handle subscription.on_hold event
            if (event.type === "subscription.on_hold") {
                const subscriptionData = event.data;
                const userId = subscriptionData.metadata?.userId;

                if (userId) {
                    console.log(`Subscription on hold ${subscriptionData.subscription_id} for user ${userId}`);
                    
                    await ctx.runMutation(api.dodoPayments.updateSubscription, {
                        userId,
                        subscriptionId: subscriptionData.subscription_id,
                        endsOn: Date.now() + (7 * 24 * 60 * 60 * 1000), // Give 7 days grace period
                        status: "expired" as const,
                    });

                    console.log(`⏸️ Subscription on hold for user ${userId}`);
                }
                return { success: true, message: "Subscription on hold" };
            }

            // Handle payment.succeeded event
            if (event.type === "payment.succeeded") {
                const paymentData = event.data;
                const userId = paymentData.metadata?.userId;

                if (userId) {
                    console.log(`Payment succeeded ${paymentData.payment_id} for user ${userId}`);
                    
                    await ctx.runMutation(api.dodoPayments.updatePayment, {
                        userId,
                        paymentId: paymentData.payment_id,
                        amount: paymentData.total_amount || 0,
                        status: "succeeded",
                    });

                    console.log(`💰 Payment succeeded for user ${userId}`);
                }
                return { success: true, message: "Payment succeeded" };
            }

            // Handle payment.failed event
            if (event.type === "payment.failed") {
                const paymentData = event.data;
                const userId = paymentData.metadata?.userId;

                if (userId) {
                    console.log(`Payment failed ${paymentData.payment_id} for user ${userId}`);
                    
                    await ctx.runMutation(api.dodoPayments.updatePayment, {
                        userId,
                        paymentId: paymentData.payment_id,
                        amount: paymentData.total_amount || 0,
                        status: "failed",
                    });

                    console.log(`❌ Payment failed for user ${userId}`);
                }
                return { success: true, message: "Payment failed" };
            }

            // Log unhandled event types
            console.log(`⚠️ Unhandled webhook event type: ${event.type}`);
            return { success: true, message: `Unhandled event type: ${event.type}` };

        } catch (error: any) {
            console.error("❌ Error processing webhook:", error);
            return { success: false, error: error.message };
        }
    }
});

export const updateSubscription = mutation({
    args: {
        userId: v.string(),
        subscriptionId: v.string(),
        endsOn: v.number(),
        status: v.optional(v.union(v.literal("active"), v.literal("cancelled"), v.literal("expired"))),
    },
    handler: async (ctx, { userId, subscriptionId, endsOn, status = "active" }) => {
        const existingSubscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        if (existingSubscription) {
            await ctx.db.patch(existingSubscription._id, {
                subscriptionId,
                endsOn,
                status,
            });
        } else {
            await ctx.db.insert("subscriptions", {
                userId,
                subscriptionId,
                endsOn,
                status,
            });
        }
    },
});

export const updatePayment = mutation({
    args: {
        userId: v.string(),
        paymentId: v.string(),
        amount: v.number(),
        status: v.string(),
    },
    handler: async (ctx, { userId, paymentId, amount, status }) => {
        // You can add a payments table to track payment history
        // For now, we'll just log the payment
        console.log(`Payment ${paymentId} for user ${userId}: ${amount} - ${status}`);
    },
});

export const webhookHandler = httpAction(async (ctx, request) => {
    console.log("Dodo webhook received:", request.method, request.url);
    
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        headers[key] = value;
    });
    console.log("All webhook headers:", headers);
    
    const event = await validateRequest(request);
    if (!event) {
        console.error("Webhook validation failed");
        return new Response("Could not validate request", { status: 400 });
    }

    console.log("Webhook validated successfully, processing event:", event.type);
    console.log("Event data:", JSON.stringify(event, null, 2));
    
    const result = await ctx.runAction(api.dodoPayments.fulfillSubscription, { event });
    console.log("Webhook processing result:", result);

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
});

async function validateRequest(req: Request) {
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET!;
    if (!webhookSecret) {
        console.error("DODO_WEBHOOK_SECRET is not set in environment variables");
        throw new Error("DODO_WEBHOOK_SECRET is not configured");
    }
    
    const payloadString = await req.text();
    
    // Dodo Payments uses Standard Webhooks format
    const webhookHeaders = {
        "webhook-id": req.headers.get("webhook-id") || "",
        "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
        "webhook-signature": req.headers.get("webhook-signature") || "",
    };
    
    console.log("Webhook validation attempt:");
    console.log("- Headers:", webhookHeaders);
    console.log("- Payload length:", payloadString.length);
    console.log("- Secret configured:", webhookSecret ? "Yes" : "No");
    
    // Check if required headers are present
    if (!webhookHeaders["webhook-id"] || !webhookHeaders["webhook-timestamp"] || !webhookHeaders["webhook-signature"]) {
        console.error("Missing required webhook headers");
        return null;
    }
    
    const wh = new Webhook(webhookSecret);
    let evt: any;
    try {
        evt = await wh.verify(payloadString, webhookHeaders) as any;
        console.log("✅ Webhook signature verified successfully");
    } catch (err: any) {
        console.error("❌ Webhook signature verification failed:", err.message);
        console.error("Full error:", err);
        return null;
    }
    return evt;
}
