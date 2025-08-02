# Dodo Payments Integration Setup

This guide will help you complete the Dodo Payments integration for your Talkflo app.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Dodo Payments Configuration
DODO_API_KEY=your_dodo_api_key_here
DODO_WEBHOOK_SECRET=your_dodo_webhook_secret_here

# Product IDs for subscription plans
VITE_DODO_MONTHLY_PRODUCT_ID=your_monthly_product_id_here
VITE_DODO_ANNUAL_PRODUCT_ID=your_annual_product_id_here

# Application URLs
HOSTING_URL=http://localhost:5173

# Convex Configuration
CONVEX_DEPLOYMENT=your_convex_deployment_name
```

## Dodo Payments Dashboard Setup

### 1. Create Products
1. Log into your Dodo Payments dashboard
2. Create two products:
   - **Monthly Plan**: $9/month
   - **Annual Plan**: $90/year
3. Note down the Product IDs for each plan

### 2. Configure Webhook
1. Go to the Webhooks section in your Dodo Payments dashboard
2. Add a new webhook endpoint:
   - **URL**: `https://88381908447d.ngrok-free.app/webhooks/dodo`
   - **Events**: Select all subscription and payment events
3. Copy the webhook secret

### 3. Get API Keys
1. Go to the API Keys section in your Dodo Payments dashboard
2. Generate a new API key with appropriate permissions
3. Copy the API key

## Implementation Details

### Features Implemented

✅ **Subscription Creation**
- Uses Dodo Payments hosted checkout
- Supports both monthly and annual plans
- Includes user metadata for tracking

✅ **Webhook Handling**
- Processes subscription events (active, renewed, cancelled)
- Processes payment events (succeeded, failed)
- Updates subscription status in database

✅ **User Interface**
- Beautiful pricing page with feature comparison
- Loading states and error handling
- Success and cancel pages

✅ **Database Integration**
- Stores subscription data in Convex
- Tracks subscription status and end dates
- Links subscriptions to user accounts

### Webhook Events Handled

- `subscription.active` - New subscription activated
- `subscription.renewed` - Subscription renewed
- `subscription.cancelled` - Subscription cancelled
- `payment.succeeded` - Payment successful
- `payment.failed` - Payment failed

### API Endpoints

- `POST /webhooks/dodo` - Webhook endpoint for Dodo Payments
- `POST /subscriptions` - Create new subscription (Dodo Payments API)
- `GET /subscriptions` - List user subscriptions

## Testing

### Test Cards
Use these test card numbers during development:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Expired**: 4000 0000 0000 0069

### Test Flow
1. Navigate to `/pricing`
2. Select a plan (Monthly or Annual)
3. Complete payment with test card
4. Verify webhook events are received
5. Check subscription status in database

## Security Notes

- Webhook signatures are verified using Svix
- API keys are stored securely in environment variables
- User authentication is required for subscription creation
- All sensitive data is encrypted in transit

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check ngrok tunnel is active
   - Verify webhook URL is correct
   - Ensure webhook secret is properly configured

2. **Subscription creation fails**
   - Verify API key is correct
   - Check product IDs are valid
   - Ensure user is authenticated

3. **Database errors**
   - Run `npx convex dev --once` to regenerate types
   - Check schema changes are deployed

### Debug Logs

The implementation includes comprehensive logging:
- Webhook events received
- API errors from Dodo Payments
- Subscription status changes
- Payment processing events

Check the Convex dashboard logs for detailed debugging information. 