import Stripe from "stripe";

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Create Stripe payment intent for booking
export const createStripePaymentIntent = async (amount, currency = "usd", bookingId, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return paymentIntent;
  } catch (error) {
    console.error("Error creating Stripe payment intent:", error);
    throw error;
  }
};

// Confirm Stripe payment
export const confirmStripePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error confirming Stripe payment:", error);
    throw error;
  }
};

// Create Stripe transfer to product owner (platform fee deducted)
export const createStripeTransfer = async (amount, destinationAccountId, metadata = {}) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      destination: destinationAccountId,
      metadata,
    });
    
    return transfer;
  } catch (error) {
    console.error("Error creating Stripe transfer:", error);
    throw error;
  }
};

// Refund Stripe payment to renter
export const refundStripePayment = async (paymentIntentId, amount) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
    });
    
    return refund;
  } catch (error) {
    console.error("Error refunding Stripe payment:", error);
    throw error;
  }
};

// Get Stripe account details for payout
export const getStripeAccount = async (accountId) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error("Error getting Stripe account:", error);
    throw error;
  }
};
