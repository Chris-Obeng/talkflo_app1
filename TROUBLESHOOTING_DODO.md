# Dodo Payments Integration Troubleshooting

## Quick Fix Summary

The main issues that were causing subscription creation failures have been fixed:

### 1. ✅ **Fixed Product IDs**
- **Old (incorrect)**: `pdt_NbDFxxJzUKVZ32wjtWLXL` and `pdt_NcwhabaNUbTAp1o4sfq1A`
- **New (correct)**: 
  - Monthly: `pdt_ssoVhz9zhE5Tvo4NzqLb5`
  - Annual: `pdt_sShrMgwjXkk2Has1z8LFU`

### 2. ✅ **Fixed Billing Address Format**
- **Issue**: Zipcode was a string, country code was invalid
- **Fix**: Zipcode is now a number (94102), country is valid ISO code ("US")

### 3. ✅ **Improved Error Handling**
- Added specific error messages for different failure types
- Better logging for debugging
- Validation of plan IDs before API calls

### 4. ✅ **Updated Response Handling**
- Fixed PricingPage to handle new response format with `paymentLink` property
- Added proper console logging for debugging

### 5. ✅ **Fixed Pricing Display**
- Updated annual price from $90 to $80 to match actual product configuration
- Updated savings calculation from $18 to $28

## Testing the Integration

### Step 1: Test Subscription Creation
1. Go to `/pricing` in your app
2. Click "Subscribe Monthly" or "Subscribe Annual"
3. Check browser console for logs:
   ```
   Starting subscription for plan: pdt_ssoVhz9zhE5Tvo4NzqLb5
   Creating subscription for user [user-id] with plan [plan-id]
   Subscription created successfully: [subscription-id]
   Payment link: https://checkout.dodopayments.com/[checkout-id]
   Redirecting to payment link: [payment-link]
   ```

### Step 2: Test Payment Flow
1. Use Dodo Payments test card: `4242 4242 4242 4242`
2. Complete the checkout process
3. Should redirect to `/success` page

### Step 3: Test Webhook Events
1. Check Convex logs for webhook events:
   ```
   Webhook event received: subscription.active
   Activating subscription [subscription-id] for user [user-id]
   ```

## Debug Component

Add this to any page to see subscription status:

```tsx
import SubscriptionDebug from './components/SubscriptionDebug';

// In your component:
<SubscriptionDebug />
```

## Common Issues & Solutions

### Issue: "Failed to create subscription"
**Cause**: Invalid product ID or API configuration
**Solution**: 
1. Verify product IDs in `.env.local` match the ones in your Dodo dashboard
2. Check API key is correct and has proper permissions

### Issue: "No payment link received"
**Cause**: API call succeeded but response format unexpected
**Solution**: Check Convex logs for the actual API response structure

### Issue: Webhook not receiving events
**Cause**: Webhook URL not configured correctly in Dodo dashboard
**Solution**: 
1. For local development: Use ngrok to expose localhost
2. Set webhook URL to: `https://your-ngrok-url.ngrok.io/webhooks/dodo`
3. For production: Use your actual domain

### Issue: User not authenticated error
**Cause**: User session expired or not logged in
**Solution**: Ensure user is logged in before attempting subscription creation

## Environment Variables Checklist

Verify these are set correctly in `.env.local`:

```env
# ✅ API Configuration
DODO_API_KEY=HkjDs73y4wVzS-nJ.4FG_OqXN3GJc0-CKQnwjzOI_im1TfOOm9vHXlSKUOuOY2zxW
DODO_WEBHOOK_SECRET=whsec_3St8wYLi9yRZPBPsfrIoM1zGcaPpy6k9

# ✅ Product IDs (Updated)
VITE_DODO_MONTHLY_PRODUCT_ID=pdt_ssoVhz9zhE5Tvo4NzqLb5
VITE_DODO_ANNUAL_PRODUCT_ID=pdt_sShrMgwjXkk2Has1z8LFU

# ✅ URLs
HOSTING_URL=http://localhost:5173
```

## API Test Commands

You can test the API directly using curl:

```bash
# Test subscription creation
curl -X POST "https://api.dodopayments.com/v1/subscriptions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "pdt_ssoVhz9zhE5Tvo4NzqLb5",
    "customer": {
      "email": "test@example.com",
      "name": "Test User"
    },
    "billing": {
      "city": "San Francisco",
      "country": "US",
      "state": "CA",
      "street": "123 Main St",
      "zipcode": 94102
    },
    "payment_link": true,
    "quantity": 1
  }'
```

## Next Steps

1. **Test the integration** with the fixes applied
2. **Set up webhook URL** in Dodo Payments dashboard for your production domain
3. **Add subscription checks** in your app to show premium features only to subscribed users
4. **Handle subscription status** in your UI (show upgrade prompts for free users)

## Production Deployment

Before going live:

1. Update `HOSTING_URL` to your production domain
2. Change Dodo Payments mode from "test" to "live" 
3. Update webhook URL in Dodo dashboard to production endpoint
4. Test with real payment methods

The integration should now work correctly! 🎉