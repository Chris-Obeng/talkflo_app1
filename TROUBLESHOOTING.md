# Dodo Payments Integration Troubleshooting

## Common Issues and Solutions

### 1. "Failed to create subscription" Error

**Symptoms:**
- Toast message shows "Failed to create subscription. Please try again."
- Console shows API errors

**Possible Causes:**

#### A. Missing Environment Variables
**Solution:** Ensure these environment variables are set in `.env.local`:
```env
DODO_API_KEY=your_actual_api_key_here
HOSTING_URL=http://localhost:5173
VITE_DODO_MONTHLY_PRODUCT_ID=your_monthly_product_id
VITE_DODO_ANNUAL_PRODUCT_ID=your_annual_product_id
```

#### B. Invalid API Key
**Solution:** 
1. Check your Dodo Payments dashboard
2. Generate a new API key
3. Update `.env.local` with the new key
4. Restart your development server

#### C. Invalid Product IDs
**Solution:**
1. Go to your Dodo Payments dashboard
2. Create products for Monthly ($9) and Annual ($90) plans
3. Copy the exact Product IDs
4. Update the environment variables

#### D. Network Issues
**Solution:**
1. Check your internet connection
2. Verify the Dodo Payments API is accessible
3. Check if your firewall is blocking requests

### 2. Checkout Not Opening

**Symptoms:**
- Clicking subscribe button doesn't open checkout
- No redirect to payment page

**Solutions:**

#### A. SDK Loading Issues
**Solution:** Check browser console for SDK errors:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any errors related to DodoPayments
4. Ensure the SDK script is loading from `https://checkout.dodopayments.com/sdk.js`

#### B. Payment Link Issues
**Solution:** Verify the payment link is being generated:
1. Check the browser console for the payment link URL
2. Try opening the payment link directly in a new tab
3. Verify the link format: `https://checkout.dodopayments.com/buy/...`

### 3. Webhook Not Receiving Events

**Symptoms:**
- Payment completed but subscription status not updated
- No webhook events in Convex logs

**Solutions:**

#### A. Webhook URL Configuration
**Solution:** Ensure webhook is properly configured in Dodo Payments dashboard:
1. Go to Dodo Payments dashboard
2. Navigate to Webhooks section
3. Add webhook URL: `https://88381908447d.ngrok-free.app/webhooks/dodo`
4. Select all subscription and payment events
5. Copy the webhook secret to `.env.local`

#### B. Ngrok Tunnel Issues
**Solution:** 
1. Ensure ngrok is running: `ngrok http 3000`
2. Update the webhook URL in Dodo Payments dashboard with the new ngrok URL
3. Update `DODO_WEBHOOK_SECRET` in `.env.local`

### 4. Environment Variable Debugging

**To check if environment variables are loaded:**

1. **Frontend Variables** (VITE_*):
   ```javascript
   console.log('Monthly Product ID:', import.meta.env.VITE_DODO_MONTHLY_PRODUCT_ID);
   console.log('Annual Product ID:', import.meta.env.VITE_DODO_ANNUAL_PRODUCT_ID);
   ```

2. **Backend Variables** (in Convex):
   ```typescript
   console.log('API Key exists:', !!process.env.DODO_API_KEY);
   console.log('Hosting URL:', process.env.HOSTING_URL);
   ```

### 5. Testing the Integration

#### A. Test with Sample Data
Create a test function to verify the API connection:

```typescript
// Add this to convex/dodoPayments.ts for testing
export const testConnection = action({
    args: {},
    handler: async (ctx) => {
        const response = await fetch("https://api.dodopayments.com/v1/products", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DODO_API_KEY}`,
            },
        });
        
        if (response.ok) {
            const products = await response.json();
            return { success: true, products: products.data };
        } else {
            const error = await response.json();
            return { success: false, error };
        }
    },
});
```

#### B. Test Cards
Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Expired**: 4000 0000 0000 0069

### 6. Production Deployment

#### A. Environment Variables
For production, update these variables:
```env
HOSTING_URL=https://your-domain.com
DODO_API_KEY=your_live_api_key
```

#### B. Webhook URL
Update webhook URL in Dodo Payments dashboard:
```
https://your-domain.com/webhooks/dodo
```

#### C. SDK Mode
Change SDK mode from "test" to "live" in `SubscriptionModal.tsx`:
```typescript
window.DodoPayments.Initialize({
  mode: "live", // Change from "test" to "live"
  // ... other options
});
```

### 7. Debug Logs

The integration includes comprehensive logging:

1. **Frontend Logs** (Browser Console):
   - SDK initialization
   - Checkout events
   - Payment link generation

2. **Backend Logs** (Convex Dashboard):
   - API requests to Dodo Payments
   - Webhook events received
   - Subscription status updates

### 8. Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "DODO_API_KEY is not configured" | Missing API key | Add to `.env.local` |
| "HOSTING_URL is not configured" | Missing hosting URL | Add to `.env.local` |
| "No payment link received" | API response issue | Check product IDs and API key |
| "Failed to create subscription" | API error | Check console for detailed error |

### 9. Getting Help

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Check the Convex dashboard logs
3. Verify all environment variables are set correctly
4. Test with the sample data function
5. Contact Dodo Payments support if API issues persist 