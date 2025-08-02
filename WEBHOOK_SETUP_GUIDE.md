# Dodo Payments Webhook Setup Guide

## Current Issue
The webhook is failing with a 403 Forbidden error because it's trying to reach an ngrok URL that's not properly configured.

## Solution: Use Convex Deployment URL

### Step 1: Update Webhook URL in Dodo Payments Dashboard

1. **Go to your Dodo Payments Dashboard**
2. **Navigate to:** Developer → Webhooks
3. **Update the webhook URL to:**
   ```
   https://oceanic-lapwing-236.convex.cloud/webhooks/dodo
   ```

### Step 2: Configure Webhook Events

Make sure these events are selected in your webhook configuration:

**Subscription Events:**
- ✅ `subscription.active` - When subscription becomes active
- ✅ `subscription.renewed` - When subscription is renewed
- ✅ `subscription.cancelled` - When subscription is cancelled
- ✅ `subscription.failed` - When subscription creation fails

**Payment Events:**
- ✅ `payment.succeeded` - When payment is successful
- ✅ `payment.failed` - When payment fails

### Step 3: Webhook Secret

Make sure your webhook secret is correctly set in Convex:
```bash
npx convex env set DODO_WEBHOOK_SECRET whsec_3St8wYLi9yRZPBPsfrIoM1zGcaPpy6k9
```

## Expected Webhook Flow

### For Successful Subscription:
1. **User completes payment** → Dodo Payments processes
2. **`subscription.active` webhook** → Updates subscription status to "active"
3. **`payment.succeeded` webhook** → Logs successful payment
4. **User sees updated status** in the app

### Webhook Payload Structure

Based on Dodo Payments documentation, webhooks follow this structure:

```json
{
  "business_id": "bus_jo33D0FA0igBb8UHG9sVN",
  "type": "subscription.active",
  "timestamp": "2025-08-02T02:15:00Z",
  "data": {
    "subscription_id": "sub_xxxxx",
    "status": "active",
    "metadata": {
      "userId": "user_id_here",
      "userEmail": "user@example.com",
      "planType": "monthly"
    }
  }
}
```

## Testing the Webhook

### Method 1: Check Convex Logs
1. Go to [Convex Dashboard](https://dashboard.convex.dev/d/oceanic-lapwing-236)
2. Look for logs from the `http` function
3. Check for webhook validation and processing logs

### Method 2: Check Dodo Payments Dashboard
1. Go to Developer → Webhooks
2. Check the "Webhook Attempts" section
3. Look for successful (200) responses

### Method 3: Test Purchase
1. Make a test purchase using test card: `4242 4242 4242 4242`
2. Complete the payment
3. Check if subscription status updates in your app
4. Check the SubscriptionDebug component for updated data

## Troubleshooting

### If webhook still fails:

1. **Check the URL is correct:**
   ```
   https://oceanic-lapwing-236.convex.cloud/webhooks/dodo
   ```

2. **Verify webhook secret:**
   ```bash
   npx convex env list | grep DODO_WEBHOOK_SECRET
   ```

3. **Check Convex logs** for detailed error messages

4. **Test webhook manually** using the Dodo Payments dashboard webhook testing feature

### Common Issues:

- **403 Forbidden**: Wrong URL or blocked request
- **400 Bad Request**: Invalid webhook signature or payload
- **500 Internal Error**: Error in webhook processing code

## Next Steps

After fixing the webhook:

1. **Test the complete flow** with a test purchase
2. **Verify subscription status updates** in your app
3. **Check that the success page redirects** to `/app` correctly
4. **Test subscription features** in your app

The webhook should now work correctly and update subscription statuses in real-time! 🎉