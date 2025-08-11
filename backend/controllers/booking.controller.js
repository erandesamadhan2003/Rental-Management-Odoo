import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import { createStripePaymentIntent, confirmStripePayment, createStripeTransfer, refundStripePayment } from "../services/payment.service.js";
import { sendEmail } from '../services/email.service.js';

// Calculate platform fee (10% default) and owner amount
const calculateAmounts = (totalPrice) => {
  const platformFee = Math.round(totalPrice * 0.1); // 10%
  const ownerAmount = totalPrice - platformFee;
  return { platformFee, ownerAmount };
};

// Create booking (status: pending, unpaid)
export const createBooking = async (req, res) => {
  try {
    const { productId, renterId, renterClerkId, ownerId, ownerClerkId, startDate, endDate, totalPrice } = req.body;

    const { platformFee, ownerAmount } = calculateAmounts(totalPrice);

    const booking = await Booking.create({
      productId,
      renterId,
      renterClerkId,
      ownerId,
      ownerClerkId,
      startDate,
      endDate,
      totalPrice,
      platformFee,
      ownerAmount,
      status: "pending",
      paymentStatus: "unpaid"
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create booking", error: error.message });
  }
};

// Start payment process
export const initiateBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const paymentIntent = await createStripePaymentIntent(
      booking.totalPrice, 
      "usd", 
      bookingId,
      {
        renterId: booking.renterId.toString(),
        ownerId: booking.ownerId.toString(),
        productId: booking.productId.toString()
      }
    );

    res.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to initiate payment", error: error.message });
  }
};

// Confirm payment
export const confirmBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentIntentId } = req.body;

    const paymentIntent = await confirmStripePayment(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        message: "Payment not successful", 
        status: paymentIntent.status 
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const payment = await Payment.create({
      bookingId,
      renterId: booking.renterId,
      renterClerkId: booking.renterClerkId,
      ownerId: booking.ownerId,
      ownerClerkId: booking.ownerClerkId,
      paymentGateway: "stripe",
      gatewayPaymentId: paymentIntent.id,
      gatewayChargeId: paymentIntent.latest_charge,
      amount: booking.totalPrice,
      currency: "usd",
      platformFee: booking.platformFee,
      ownerAmount: booking.ownerAmount,
      paymentStatus: "successful",
      paymentDate: new Date()
    });

    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.paymentId = payment._id;
    await booking.save();

    res.json({ success: true, booking, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Payment confirmation failed", error: error.message });
  }
};

// Confirm pickup & payout
export const confirmPickup = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ownerStripeAccountId } = req.body; // Owner's Stripe Connect account ID
    
    const booking = await Booking.findById(bookingId).populate("paymentId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (!ownerStripeAccountId) {
      return res.status(400).json({ 
        success: false, 
        message: "Owner Stripe account ID is required for payout" 
      });
    }

    booking.pickupStatus = "completed";
    booking.status = "in_rental";
    await booking.save();

    // Create transfer to owner (platform fee already deducted)
    try {
      const transfer = await createStripeTransfer(
        booking.ownerAmount,
        ownerStripeAccountId,
        {
          bookingId: bookingId,
          ownerId: booking.ownerId.toString(),
          type: "rental_payout"
        }
      );

      booking.payoutStatus = "completed";
      booking.payoutDate = new Date();
      booking.payoutTransactionId = transfer.id;
      await booking.save();

      res.json({ 
        success: true, 
        message: "Pickup confirmed & payout completed", 
        booking, 
        transfer 
      });
    } catch (transferError) {
      booking.payoutStatus = "failed";
      await booking.save();
      
      res.status(500).json({ 
        success: false, 
        message: "Pickup confirmed but payout failed", 
        error: transferError.message 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to confirm pickup", error: error.message });
  }
};

// Complete booking on return
export const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "completed";
    booking.returnStatus = "completed";
    booking.returnDate = new Date();
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to complete booking", error: error.message });
  }
};

// Cancel booking & refund
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("paymentId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "cancelled";
    booking.cancelReason = req.body.reason || "";
    await booking.save();

    if (booking.paymentStatus === "paid") {
      try {
        const refund = await refundStripePayment(booking.paymentId.gatewayPaymentId, booking.totalPrice);
        
        booking.paymentStatus = "refunded";
        booking.refundStatus = "processed";
        booking.refundDate = new Date();
        booking.refundAmount = booking.totalPrice;
        await booking.save();
        
        return res.json({ success: true, message: "Booking cancelled & refunded", refund });
      } catch (refundError) {
        return res.status(500).json({ 
          success: false, 
          message: "Booking cancelled but refund failed", 
          error: refundError.message 
        });
      }
    }

    res.json({ success: true, message: "Booking cancelled (no payment to refund)" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel booking", error: error.message });
  }
};
