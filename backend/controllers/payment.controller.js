import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("bookingId renterId ownerId");
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payments", error: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate("bookingId renterId ownerId");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payment", error: error.message });
  }
};

// Stripe webhook handler
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No booking ID in payment metadata');
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found for payment:', bookingId);
      return;
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ gatewayPaymentId: paymentIntent.id });
    if (existingPayment) {
      console.log('Payment already processed:', paymentIntent.id);
      return;
    }

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      renterId: booking.renterId,
      renterClerkId: booking.renterClerkId,
      ownerId: booking.ownerId,
      ownerClerkId: booking.ownerClerkId,
      paymentGateway: "stripe",
      gatewayPaymentId: paymentIntent.id,
      gatewayChargeId: paymentIntent.latest_charge,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      platformFee: booking.platformFee,
      ownerAmount: booking.ownerAmount,
      paymentStatus: "successful",
      paymentDate: new Date()
    });

    // Update booking
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.paymentId = payment._id;
    await booking.save();

    console.log('Payment confirmed automatically for booking:', bookingId);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// Handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No booking ID in payment metadata');
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found for failed payment:', bookingId);
      return;
    }

    // Update booking status
    booking.paymentStatus = "unpaid";
    booking.status = "pending";
    await booking.save();

    console.log('Payment failed for booking:', bookingId);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};
