import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import Notification from "../models/notification.model.js";
import { createStripePaymentIntent, confirmStripePayment, createStripeTransfer, refundStripePayment } from "../services/payment.service.js";
import { sendEmail } from '../services/email.service.js';

// Calculate platform fee (10% default) and owner amount
const calculateAmounts = (totalPrice) => {
  const platformFee = Math.round(totalPrice * 0.1); // 10%
  const ownerAmount = totalPrice - platformFee;
  return { platformFee, ownerAmount };
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('productId', 'title category brand pricePerDay')
      .populate('renterId', 'username email firstName lastName')
      .populate('ownerId', 'username email firstName lastName');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch booking', 
      error: error.message 
    });
  }
};

// List bookings with optional filters (by clerkId, role, status, pagination)
export const listBookings = async (req, res) => {
  try {
    const { clerkId, role, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (clerkId) {
      if (role === 'owner') filter.ownerClerkId = clerkId;
      else if (role === 'renter') filter.renterClerkId = clerkId;
      else filter.$or = [{ ownerClerkId: clerkId }, { renterClerkId: clerkId }];
    }
    if (status) filter.status = status;

    const numericLimit = Math.min(Number(limit) || 20, 100);
    const numericPage = Math.max(Number(page) || 1, 1);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .limit(numericLimit)
        .skip((numericPage - 1) * numericLimit)
        .populate('productId', 'title category')
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      bookings,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

// Create rental request (status: pending, paymentStatus: unpaid)
export const createRentalRequest = async (req, res) => {
  try {
    const { productId, renterId, renterClerkId, ownerId, ownerClerkId, startDate, endDate, totalPrice, pickupLocation, dropLocation } = req.body;

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
      paymentStatus: "unpaid",
      pickupLocation,
      dropLocation
    });

    // Create notification for owner
    await Notification.create({
      userId: ownerId,
      userClerkId: ownerClerkId,
      type: "rental_request",
      message: `New rental request for your product`,
      relatedId: booking._id,
      relatedType: "booking",
      metadata: { renterId, renterClerkId, productId }
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create rental request", error: error.message });
  }
};

// Owner accepts rental request
export const acceptRentalRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { pickupLocation, dropLocation } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "confirmed";
    if (pickupLocation) booking.pickupLocation = pickupLocation;
    if (dropLocation) booking.dropLocation = dropLocation;
    await booking.save();

    // Create notification for renter
    await Notification.create({
      userId: booking.renterId,
      userClerkId: booking.renterClerkId,
      type: "payment_confirmation",
      message: `Your rental request has been accepted! Please proceed with payment.`,
      relatedId: booking._id,
      relatedType: "booking"
    });

    res.json({ success: true, message: "Rental request accepted", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to accept rental request", error: error.message });
  }
};

// Owner rejects rental request
export const rejectRentalRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "cancelled";
    booking.cancelReason = reason || "Owner rejected the request";
    await booking.save();

    // Create notification for renter
    await Notification.create({
      userId: booking.renterId,
      userClerkId: booking.renterClerkId,
      type: "system",
      message: `Your rental request was rejected: ${booking.cancelReason}`,
      relatedId: booking._id,
      relatedType: "booking"
    });

    res.json({ success: true, message: "Rental request rejected", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reject rental request", error: error.message });
  }
};

// Create booking
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

    // Create notification for owner
    await Notification.create({
      userId: booking.ownerId,
      userClerkId: booking.ownerClerkId,
      type: "payment_confirmation",
      message: `Payment received for rental request`,
      relatedId: booking._id,
      relatedType: "booking"
    });

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

      // Create notification for renter
      await Notification.create({
        userId: booking.renterId,
        userClerkId: booking.renterClerkId,
        type: "pickup_scheduled",
        message: `Pickup confirmed for your rental`,
        relatedId: booking._id,
        relatedType: "booking"
      });

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
    const { dropLocation } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "completed";
    booking.returnStatus = "completed";
    booking.returnDate = new Date();
    if (dropLocation) booking.dropLocation = dropLocation;
    await booking.save();

    // Create notification for owner
    await Notification.create({
      userId: booking.ownerId,
      userClerkId: booking.ownerClerkId,
      type: "drop_scheduled",
      message: `Rental completed and item returned`,
      relatedId: booking._id,
      relatedType: "booking"
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to complete booking", error: error.message });
  }
};

// Cancel booking & refund
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(bookingId).populate("paymentId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "cancelled";
    booking.cancelReason = reason || "";
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
