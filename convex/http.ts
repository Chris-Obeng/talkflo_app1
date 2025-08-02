import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { webhookHandler } from "./dodoPayments";

const http = httpRouter();

// Test route
const testHandler = httpAction(async (ctx, request) => {
    return new Response("Test endpoint working!", { status: 200 });
});

http.route({
    path: "/test",
    method: "GET",
    handler: testHandler,
});

// Add the Dodo Payments webhook route
http.route({
    path: "/webhooks/dodo",
    method: "POST",
    handler: webhookHandler,
});

auth.addHttpRoutes(http);

export default http;
