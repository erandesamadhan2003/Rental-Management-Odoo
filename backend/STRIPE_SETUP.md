# Stripe Payment Setup Guide

## Environment Variables

Create a `.env` file in your backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rental_management

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Frontend Environment Variables

Create a `.env` file in your frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Stripe Account Setup

### 1. Create Stripe Account
- Go to [stripe.com](https://stripe.com) and create an account
- Complete basic account verification (no KYC required for test mode)

### 2. Get API Keys
- In your Stripe Dashboard, go to Developers → API keys
- Copy your **Publishable key** (starts with `pk_test_`)
- Copy your **Secret key** (starts with `sk_test_`)

### 3. Set Up Webhooks
- Go to Developers → Webhooks in your Stripe Dashboard
- Click "Add endpoint"
- Set endpoint URL: `https://yourdomain.com/api/payments/webhook/stripe`
- For local development: Use [ngrok](https://ngrok.com) to expose your local server
- Select events: `payment_intent.succeeded` and `payment_intent.payment_failed`
- Copy the webhook signing secret (starts with `whsec_`)

### 4. Enable Transfers (for payouts)
- Go to Settings → Connect in your Stripe Dashboard
- Enable Stripe Connect for transfers
- This allows you to send money to product owners

## Installation

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Testing

### Test Card Numbers
Use these test card numbers for testing:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### Test Flow
1. Create a booking
2. Initiate payment with test card
3. Payment is processed automatically via webhook
4. Owner receives payout when pickup is confirmed

## Production Considerations

1. **Switch to Live Keys**: Replace test keys with live keys
2. **Webhook Security**: Ensure webhook endpoints are HTTPS
3. **Error Handling**: Implement proper error logging and monitoring
4. **Compliance**: Ensure compliance with local payment regulations
5. **Monitoring**: Set up Stripe Dashboard monitoring for transactions

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Connect Guide](https://stripe.com/docs/connect) 