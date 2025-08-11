import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.js";
import Notification from "../models/notification.model.js";
import NotificationService from "../services/notification.service.js";
import { createPaymentIntent, createCheckoutSession, confirmPayment, retrieveCheckoutSession } from "../services/stripe.service.js";
import { sendEmail } from '../services/email.service.js';
import { createInvoiceForBooking } from './invoice.controller.js';

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

// Create rental request with automatic pricing calculation
export const createRentalRequest = async (req, res) => {
  try {
    const { 
      productId, 
      productTitle,
      ownerClerkId, 
      renterClerkId, 
      startDate, 
      endDate, 
      notes,
      pricing 
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ 
        success: false, 
        message: "Start date cannot be in the past" 
      });
    }

    if (start >= end) {
      return res.status(400).json({ 
        success: false, 
        message: "End date must be after start date" 
      });
    }

    // Find renter and owner
    const [renter, owner] = await Promise.all([
      User.findOne({ clerkId: renterClerkId }),
      User.findOne({ clerkId: ownerClerkId })
    ]);

    if (!renter || !owner) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Calculate platform fee and owner amount
    const { platformFee, ownerAmount } = calculateAmounts(pricing.total);

    // Create booking with pending approval status
    const booking = await Booking.create({
      productId,
      renterId: renter._id,
      renterClerkId,
      ownerId: owner._id,
      ownerClerkId,
      startDate: start,
      endDate: end,
      totalPrice: pricing.total,
      platformFee,
      ownerAmount,
      status: "requested",
      paymentStatus: "unpaid",
      notes: notes || ''
    });

    // Create notification for owner about rental request
    try {
      await NotificationService.createRentalRequestNotification({
        renterId: renterClerkId,
        ownerId: ownerClerkId,
        productId,
        productTitle: productTitle || 'Product',
        startDate: startDate,
        endDate: endDate,
        totalAmount: pricing.total,
        bookingId: booking._id
      });
    } catch (notificationError) {
      console.error('Failed to create rental request notification:', notificationError);
    }

    // Send email notification to owner
    try {
      await sendEmail({
        to: owner.email,
        subject: `New Rental Request for ${productTitle}`,
        html: `
          <h2>New Rental Request</h2>
          <p>You have received a new rental request for your product: <strong>${productTitle}</strong></p>
          <p><strong>Renter:</strong> ${renter.firstName} ${renter.lastName}</p>
          <p><strong>Duration:</strong> ${start.toDateString()} to ${end.toDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${pricing.total.toFixed(2)}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <p>Please log in to your dashboard to approve or reject this request.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.status(201).json({ 
      success: true, 
      message: "Rental request sent successfully. The owner will be notified.",
      booking 
    });
  } catch (error) {
    console.error('Create rental request error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create rental request", 
      error: error.message 
    });
  }
};

// Create booking (rental request)
export const createBooking = async (req, res) => {
  try {
    const { productId, renterId, renterClerkId, ownerId, ownerClerkId, startDate, endDate, totalPrice, productTitle } = req.body;

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
      status: "requested",
      paymentStatus: "unpaid"
    });

    // Create notification for owner about rental request
    try {
      await NotificationService.createRentalRequestNotification({
        renterId: renterClerkId,
        ownerId: ownerClerkId,
        productId,
        productTitle: productTitle || 'Product',
        startDate,
        endDate,
        totalAmount: totalPrice,
        bookingId: booking._id
      });
    } catch (notificationError) {
      console.error('Failed to create rental request notification:', notificationError);
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create booking", error: error.message });
  }
};

// Accept rental request (owner action)
export const acceptRentalRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ownerClerkId } = req.body;

    const booking = await Booking.findById(bookingId).populate('productId', 'title');
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.ownerClerkId !== ownerClerkId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (booking.status !== "requested") {
      return res.status(400).json({ success: false, message: "Booking already processed" });
    }

    // Update booking status
    booking.status = "pending_payment";
    await booking.save();

    // Create invoice for the approved booking
    let invoice = null;
    try {
      invoice = await createInvoiceForBooking(booking._id);
    } catch (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      // Don't fail the approval if invoice creation fails
    }

    // Notify renter that request was accepted and payment is needed
    try {
      console.log('Creating acceptance notification for booking:', booking._id)
      const acceptanceNotification = await NotificationService.createRentalAcceptanceNotification({
        renterId: booking.renterClerkId,
        ownerId: booking.ownerClerkId,
        productTitle: booking.productId?.title || 'Product',
        bookingId: booking._id,
        totalAmount: booking.totalPrice,
        invoiceId: invoice?._id
      });
      console.log('Acceptance notification created:', acceptanceNotification?._id)
    } catch (notificationError) {
      console.error('Failed to create acceptance notification:', notificationError);
      // Continue execution even if notification fails
    }

    res.json({ 
      success: true, 
      message: "Rental request accepted. Invoice has been generated.", 
      booking,
      invoice 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to accept rental request", error: error.message });
  }
};

// Reject rental request (owner action)
export const rejectRentalRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ownerClerkId, reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('productId', 'title');
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.ownerClerkId !== ownerClerkId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (booking.status !== "requested") {
      return res.status(400).json({ success: false, message: "Booking already processed" });
    }

    // Update booking status
    booking.status = "rejected";
    booking.cancelReason = reason || "Rejected by owner";
    await booking.save();

    // Notify renter that request was rejected
    try {
      console.log('Creating rejection notification for booking:', booking._id)
      const rejectionNotification = await NotificationService.createRentalRejectionNotification({
        renterId: booking.renterClerkId,
        ownerId: booking.ownerClerkId,
        productTitle: booking.productId?.title || 'Product',
        bookingId: booking._id
      });
      console.log('Rejection notification created:', rejectionNotification?._id)
    } catch (notificationError) {
      console.error('Failed to create rejection notification:', notificationError);
      // Continue execution even if notification fails
    }

    res.json({ success: true, message: "Rental request rejected", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to reject rental request", error: error.message });
  }
};

// Start payment process with Stripe
export const initiateBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod = 'card' } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title description images')
      .populate('renterId', 'email firstName lastName')
      .populate('ownerId', 'email firstName lastName');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending_payment") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking is not ready for payment" 
      });
    }

    if (paymentMethod === 'checkout') {
      // Create Stripe Checkout Session
      const checkoutData = {
        productName: booking.productId.title || 'Equipment Rental',
        productDescription: `Rental from ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}`,
        amount: booking.totalPrice,
        currency: 'usd',
        bookingId: booking._id,
        successUrl: `${process.env.CLIENT_URL}/payment/success`,
        cancelUrl: `${process.env.CLIENT_URL}/payment/cancel`,
        customerEmail: booking.renterId.email,
      };

      const session = await createCheckoutSession(checkoutData);
      
      if (!session.success) {
        return res.status(400).json({
          success: false,
          message: "Failed to create payment session",
          error: session.error
        });
      }

      // Save session ID to booking
      booking.stripeSessionId = session.sessionId;
      booking.paymentStatus = "pending";
      await booking.save();

      return res.json({
        success: true,
        sessionId: session.sessionId,
        checkoutUrl: session.url,
        message: "Checkout session created successfully"
      });
    } else {
      // Create Payment Intent for card payments
      const paymentIntent = await createPaymentIntent(
        booking.totalPrice,
        'usd',
        {
          bookingId: booking._id.toString(),
          renterId: booking.renterId._id.toString(),
          ownerId: booking.ownerId._id.toString(),
          productId: booking.productId._id.toString()
        }
      );

      if (!paymentIntent.success) {
        return res.status(400).json({
          success: false,
          message: "Failed to create payment intent",
          error: paymentIntent.error
        });
      }

      // Save payment intent ID to booking
      booking.stripePaymentIntentId = paymentIntent.paymentIntentId;
      booking.paymentStatus = "pending";
      await booking.save();

      return res.json({
        success: true,
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        amount: booking.totalPrice,
        message: "Payment intent created successfully"
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to initiate payment", 
      error: error.message 
    });
  }
};

// Confirm payment after Stripe processing
export const confirmBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentIntentId, sessionId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title')
      .populate('renterId', 'email firstName lastName')
      .populate('ownerId', 'email firstName lastName');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let paymentData = null;

    if (sessionId) {
      // Handle Checkout Session confirmation
      const sessionResult = await retrieveCheckoutSession(sessionId);
      
      if (!sessionResult.success) {
        return res.status(400).json({
          success: false,
          message: "Failed to retrieve checkout session",
          error: sessionResult.error
        });
      }

      if (sessionResult.session.payment_status !== 'paid') {
        return res.status(400).json({
          success: false,
          message: "Payment not completed",
          status: sessionResult.session.payment_status
        });
      }

      paymentData = sessionResult.session;
    } else if (paymentIntentId) {
      // Handle Payment Intent confirmation
      const paymentResult = await confirmPayment(paymentIntentId);
      
      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: "Failed to confirm payment",
          error: paymentResult.error
        });
      }

      if (paymentResult.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: "Payment not successful",
          status: paymentResult.status
        });
      }

      paymentData = paymentResult.paymentIntent;
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment ID or Session ID is required"
      });
    }

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      renterId: booking.renterId._id,
      renterClerkId: booking.renterClerkId,
      ownerId: booking.ownerId._id,
      ownerClerkId: booking.ownerClerkId,
      paymentGateway: "stripe",
      gatewayPaymentId: paymentData.id || paymentData.payment_intent,
      amount: booking.totalPrice,
      currency: "usd",
      platformFee: booking.platformFee,
      ownerAmount: booking.ownerAmount,
      paymentStatus: "successful",
      paymentDate: new Date(),
      metadata: {
        stripeSessionId: sessionId,
        stripePaymentIntentId: paymentIntentId
      }
    });

    // Update booking status
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.paymentId = payment._id;
    await booking.save();

    // Create invoice for the payment
    let invoice = null;
    try {
      invoice = await createInvoiceForBooking(booking._id);
    } catch (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
    }

    // Create notifications
    try {
      // Notify the renter about successful payment
      await NotificationService.createPaymentConfirmationNotification({
        userClerkId: booking.renterClerkId,
        amount: booking.totalPrice,
        method: 'Credit Card',
        bookingId: booking._id,
        productTitle: booking.productId?.title || 'Rental Item'
      });

      // Notify the owner about confirmed booking
      await NotificationService.createBookingStatusNotification({
        userClerkId: booking.ownerClerkId,
        status: 'confirmed',
        productTitle: booking.productId?.title || 'Your Product',
        bookingId: booking._id
      });
    } catch (notificationError) {
      console.error('Failed to create payment notifications:', notificationError);
    }

    // Send email notifications
    try {
      // Email to renter
      await sendEmail({
        to: booking.renterId.email,
        subject: `Payment Confirmed - ${booking.productId?.title}`,
        html: `
          <h2>Payment Successful!</h2>
          <p>Your payment for <strong>${booking.productId?.title}</strong> has been processed successfully.</p>
          <p><strong>Amount Paid:</strong> $${booking.totalPrice.toFixed(2)}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Rental Period:</strong> ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}</p>
          <p>The owner will contact you soon with pickup/delivery details.</p>
        `
      });

      // Email to owner
      await sendEmail({
        to: booking.ownerId.email,
        subject: `Booking Confirmed - ${booking.productId?.title}`,
        html: `
          <h2>Booking Confirmed!</h2>
          <p>Payment for your product <strong>${booking.productId?.title}</strong> has been received.</p>
          <p><strong>Renter:</strong> ${booking.renterId.firstName} ${booking.renterId.lastName}</p>
          <p><strong>Amount:</strong> $${booking.ownerAmount.toFixed(2)} (after platform fee)</p>
          <p><strong>Rental Period:</strong> ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}</p>
          <p>Please prepare the item and contact the renter at ${booking.renterId.email} for pickup/delivery arrangements.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError);
    }

    res.json({ 
      success: true, 
      message: "Payment confirmed successfully",
      booking, 
      payment,
      invoice: invoice || null
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Payment confirmation failed", 
      error: error.message 
    });
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

// Update booking payment status (simple payment completion)
export const updateBookingPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, paymentMethod, paymentData } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title')
      .populate('renterId', 'username email firstName lastName')
      .populate('ownerId', 'username email firstName lastName');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending_payment") {
      return res.status(400).json({ success: false, message: "Booking is not ready for payment" });
    }

    // Update booking status
    booking.status = "paid";
    booking.paymentStatus = paymentStatus;
    await booking.save();

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      renterId: booking.renterId._id,
      renterClerkId: booking.renterClerkId,
      amount: booking.totalPrice,
      platformFee: booking.platformFee,
      ownerAmount: booking.ownerAmount,
      method: paymentMethod || 'card',
      status: 'completed',
      transactionId: paymentData?.transactionId || `TXN_${Date.now()}`,
      metadata: paymentData || {}
    });

    // Create invoice for the payment
    let invoice = null;
    try {
      invoice = await createInvoiceForBooking(booking._id);
    } catch (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
    }

    // Notify owner that payment is received
    try {
      await NotificationService.createPaymentConfirmationNotification({
        userId: booking.ownerId._id,
        userClerkId: booking.ownerClerkId,
        amount: booking.totalPrice,
        method: paymentMethod || 'card',
        bookingId: booking._id,
        productTitle: booking.productId?.title || 'Product'
      });
    } catch (notificationError) {
      console.error('Failed to create payment notification:', notificationError);
    }

    // Send email notifications
    try {
      // Email to renter
      await sendEmail({
        to: booking.renterId.email,
        subject: `Payment Confirmation - ${booking.productId?.title}`,
        html: `
          <h2>Payment Confirmed!</h2>
          <p>Your payment for <strong>${booking.productId?.title}</strong> has been processed successfully.</p>
          <p><strong>Amount Paid:</strong> ₹${booking.totalPrice.toFixed(2)}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p>The owner has been notified and will contact you soon with pickup/delivery details.</p>
        `
      });

      // Email to owner
      await sendEmail({
        to: booking.ownerId.email,
        subject: `Payment Received - ${booking.productId?.title}`,
        html: `
          <h2>Payment Received!</h2>
          <p>Payment for your product <strong>${booking.productId?.title}</strong> has been received.</p>
          <p><strong>Amount:</strong> ₹${booking.ownerAmount.toFixed(2)} (after platform fee)</p>
          <p><strong>Renter:</strong> ${booking.renterId.firstName} ${booking.renterId.lastName}</p>
          <p><strong>Rental Period:</strong> ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}</p>
          <p>Please prepare the item and contact the renter for pickup/delivery arrangements.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
    }

    res.json({ 
      success: true, 
      message: "Payment completed successfully", 
      booking,
      payment,
      invoiceId: invoice?._id
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to update payment status", 
      error: error.message 
    });
  }
};

// Generate delivery OTP
export const generateDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "confirmed" && booking.status !== "paid") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be confirmed to generate delivery OTP" 
      });
    }

    // Generate 6-digit OTP
    const deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry (15 minutes from now)
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    
    booking.deliveryOTP = deliveryOTP;
    booking.deliveryOTPExpiry = otpExpiry;
    await booking.save();

    res.json({ 
      success: true, 
      message: "Delivery OTP generated successfully",
      otp: deliveryOTP // In production, this should be sent via SMS/email
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate delivery OTP", 
      error: error.message 
    });
  }
};

// Verify delivery OTP
export const verifyDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (!booking.deliveryOTP || !booking.deliveryOTPExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: "No delivery OTP found. Please generate OTP first" 
      });
    }

    if (new Date() > booking.deliveryOTPExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: "Delivery OTP has expired" 
      });
    }

    if (booking.deliveryOTP !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid delivery OTP" 
      });
    }

    // Update booking status to delivered
    booking.status = "in_rental";
    booking.deliveryStatus = "completed";
    booking.deliveryDate = new Date();
    booking.deliveryOTP = null;
    booking.deliveryOTPExpiry = null;
    await booking.save();

    res.json({ 
      success: true, 
      message: "Delivery verified successfully",
      booking 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify delivery OTP", 
      error: error.message 
    });
  }
};

// Generate return OTP
export const generateReturnOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "in_rental") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be in rental status to generate return OTP" 
      });
    }

    // Generate 6-digit OTP
    const returnOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry (15 minutes from now)
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    
    booking.returnOTP = returnOTP;
    booking.returnOTPExpiry = otpExpiry;
    await booking.save();

    res.json({ 
      success: true, 
      message: "Return OTP generated successfully",
      otp: returnOTP // In production, this should be sent via SMS/email
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate return OTP", 
      error: error.message 
    });
  }
};

// Verify return OTP
export const verifyReturnOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (!booking.returnOTP || !booking.returnOTPExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: "No return OTP found. Please generate OTP first" 
      });
    }

    if (new Date() > booking.returnOTPExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: "Return OTP has expired" 
      });
    }

    if (booking.returnOTP !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid return OTP" 
      });
    }

    // Update booking status to completed
    booking.status = "completed";
    booking.returnStatus = "completed";
    booking.returnDate = new Date();
    booking.returnOTP = null;
    booking.returnOTPExpiry = null;
    await booking.save();

    res.json({ 
      success: true, 
      message: "Return verified successfully",
      booking 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify return OTP", 
      error: error.message 
    });
  }
};
