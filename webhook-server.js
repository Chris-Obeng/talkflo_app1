console.log('🚀 Starting webhook server...');

try {
    const express = require('express');
    const { ConvexHttpClient } = require('convex/browser');
    const { Webhook } = require('standardwebhooks');
    require('dotenv').config({ path: '.env.local' });

    console.log('📦 Packages loaded successfully');

    const app = express();
    const port = 3001;

    console.log('🔗 Initializing Convex client...');
    // Initialize Convex client
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || 'https://oceanic-lapwing-236.convex.cloud');

    console.log('✅ Convex client initialized');

app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Webhook endpoint that forwards to Convex
app.post('/webhooks/dodo', async (req, res) => {
    console.log('🔔 Webhook received from Dodo Payments');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    try {
        // Validate webhook signature
        const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error('DODO_WEBHOOK_SECRET not configured');
        }

        const payloadString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        
        const webhookHeaders = {
            "webhook-id": req.headers["webhook-id"] || "",
            "webhook-timestamp": req.headers["webhook-timestamp"] || "",
            "webhook-signature": req.headers["webhook-signature"] || "",
        };

        console.log('Validating webhook signature...');
        const wh = new Webhook(webhookSecret);
        const event = await wh.verify(payloadString, webhookHeaders);
        
        console.log('✅ Webhook signature validated');
        console.log('Event type:', event.type);
        
        // Forward to Convex action
        const result = await convex.action(api.dodoPayments.fulfillSubscription, { event });
        
        console.log('✅ Webhook processed successfully:', result);
        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(400).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

    app.listen(port, () => {
        console.log(`🚀 Webhook server running on http://localhost:${port}`);
        console.log(`📡 Webhook endpoint: http://localhost:${port}/webhooks/dodo`);
        console.log(`🔍 Health check: http://localhost:${port}/health`);
        console.log('\n🌐 To expose this with ngrok, run:');
        console.log(`   ngrok http ${port}`);
    });

} catch (error) {
    console.error('❌ Error starting webhook server:', error);
    process.exit(1);
}