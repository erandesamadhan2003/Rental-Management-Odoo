import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Create a payment intent with Stripe
export const createStripePaymentIntent = async (amount, currency, bookingId, metadata) => {
  try {
    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);
    
    // TESTING MODE: Bypass actual Stripe API call
    console.log('TEST MODE: Creating mock payment intent in service for testing purposes');
    
    // Create a mock payment intent for testing
    const testId = 'test_pi_' + Date.now();
    const testSecret = 'test_secret_' + Date.now();
    
    return {
      id: testId,
      client_secret: testSecret,
      amount: amountInCents,
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      metadata: {
        bookingId,
        ...metadata
      }
    };
    
    /* COMMENTED OUT FOR TESTING
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        bookingId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata
    };
    */
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    throw error;
  }
};

// Confirm a payment with Stripe
export const confirmStripePayment = async (paymentIntentId) => {
  try {
    // TESTING MODE: Bypass actual Stripe API call
    console.log('TEST MODE: Confirming mock payment intent in service for testing purposes');
    
    // Create a mock successful payment intent for testing
    return {
      id: paymentIntentId,
      status: 'succeeded',
      latest_charge: 'test_ch_' + Date.now(),
      amount: 1000, // Mock amount
      currency: 'inr'
    };
    
    /* COMMENTED OUT FOR TESTING
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // If payment intent is already succeeded, just return it
    if (paymentIntent.status === 'succeeded') {
      return paymentIntent;
    }
    */
    
    // TESTING MODE: Bypass actual Stripe API call
    // Otherwise, confirm the payment (this is usually done client-side)
    // This is a fallback for server-side confirmation
    /* COMMENTED OUT FOR TESTING
    return await stripe.paymentIntents.confirm(paymentIntentId);
    */
    
    // For testing: Return a mock confirmed payment intent
    console.log('TEST MODE: Returning mock confirmed payment intent');
    return {
      id: paymentIntentId,
      status: 'succeeded',
      latest_charge: 'test_ch_' + Date.now(),
      amount: 1000, // Mock amount
      currency: 'inr'
    };
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    throw error;
  }
};

// Create a transfer to the owner's account
export const createStripeTransfer = async (amount, destinationAccountId, metadata) => {
  try {
    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);
    
    // TESTING MODE: Bypass actual Stripe API call
    console.log('TEST MODE: Creating mock transfer for testing purposes');
    
    // Return a mock transfer for testing
    return {
      id: 'test_tr_' + Date.now(),
      object: 'transfer',
      amount: amountInCents,
      currency: 'inr',
      destination: destinationAccountId,
      metadata,
      created: Math.floor(Date.now() / 1000),
      status: 'succeeded'
    };
    
    /* COMMENTED OUT FOR TESTING
    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'inr',
      destination: destinationAccountId,
      metadata
    });
    
    return transfer;
    */
  } catch (error) {
    console.error('Error creating Stripe transfer:', error);
    throw error;
  }
};

// Refund a payment
export const refundStripePayment = async (paymentIntentId, amount) => {
  try {
    // Convert amount to cents
    const amountInCents = amount ? Math.round(amount * 100) : 1000; // Default mock amount
    
    // TESTING MODE: Bypass actual Stripe API call
    console.log('TEST MODE: Creating mock refund for testing purposes');
    
    // Return a mock refund for testing
    return {
      id: 'test_re_' + Date.now(),
      object: 'refund',
      amount: amountInCents,
      currency: 'inr',
      payment_intent: paymentIntentId,
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000)
    };
    
    /* COMMENTED OUT FOR TESTING
    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountInCents, // If undefined, refunds the full amount
    });
    
    return refund;
    */
  } catch (error) {
    console.error('Error refunding Stripe payment:', error);
    throw error;
  }
};
