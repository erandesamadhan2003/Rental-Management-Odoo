// Mock payment service for testing - replace with actual Stripe integration in production

// Mock Stripe payment intent creation
export const createStripePaymentIntent = async (amount, currency, bookingId, metadata) => {
  // In production, this would call Stripe API
  // For now, return a mock payment intent
  return {
    id: `pi_mock_${Date.now()}`,
    client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount * 100, // Convert to cents
    currency,
    status: 'requires_payment_method',
    metadata
  }
}

// Mock Stripe payment confirmation
export const confirmStripePayment = async (paymentIntentId) => {
  // In production, this would verify the payment with Stripe
  // For now, return a mock successful payment
  return {
    id: paymentIntentId,
    status: 'succeeded',
    latest_charge: `ch_mock_${Date.now()}`,
    amount: 1000, // Mock amount in cents
    currency: 'usd'
  }
}

// Mock Stripe transfer creation
export const createStripeTransfer = async (amount, destinationAccountId, metadata) => {
  // In production, this would create a transfer to the owner's Stripe Connect account
  // For now, return a mock transfer
  return {
    id: `tr_mock_${Date.now()}`,
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    destination: destinationAccountId,
    status: 'paid',
    metadata
  }
}

// Mock Stripe payment refund
export const refundStripePayment = async (paymentIntentId, amount) => {
  // In production, this would create a refund through Stripe
  // For now, return a mock refund
  return {
    id: `re_mock_${Date.now()}`,
    payment_intent: paymentIntentId,
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    status: 'succeeded'
  }
}

// Note: Replace these mock functions with actual Stripe API calls in production
// You'll need to:
// 1. Install stripe package: npm install stripe
// 2. Set up Stripe environment variables
// 3. Initialize Stripe with your secret key
// 4. Replace mock functions with actual Stripe API calls
