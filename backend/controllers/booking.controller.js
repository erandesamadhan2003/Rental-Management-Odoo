import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.js";
import Notification from "../models/notification.model.js";
import NotificationService from "../services/notification.service.js";
import { createStripePaymentIntent, confirmStripePayment, createStripeTransfer, refundStripePayment } from "../services/payment.service.js";
import { sendEmail, generateOTP, sendDeliveryReturnOTP } from '../services/email.service.js';
import { createInvoiceForBooking } from './invoice.controller.js';
import mongoose from "mongoose";

// Calculate platform fee (10% default) and owner amount
const calculateAmounts = (totalPrice) => {
  const platformFee = Math.round(totalPrice * 0.1); // 10%
  const ownerAmount = totalPrice - platformFee;
  return { platformFee, ownerAmount };
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (booking, payment) => {
  try {
    const { renterId, ownerId, productId, startDate, endDate, totalPrice } = booking;
    
    // Get renter and owner details
    const [renter, owner] = await Promise.all([
      User.findById(renterId),
      User.findById(ownerId)
    ]);
    
    if (!renter || !owner) {
      console.error('Could not find renter or owner for payment confirmation email');
      return;
    }
    
    // Format dates
    const formattedStartDate = new Date(startDate).toLocaleDateString();
    const formattedEndDate = new Date(endDate).toLocaleDateString();
    
    // Send email to renter
    await sendEmail({
      to: renter.email,
      subject: 'Payment Confirmation - Your Rental is Confirmed!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 40px; }
            .booking-details { background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmation</h1>
              <p>Your rental is confirmed!</p>
            </div>
            
            <div class="content">
              <h2>Hello ${renter.firstName || renter.username},</h2>
              
              <p>Your payment of ₹${totalPrice} has been successfully processed. Your rental is now confirmed!</p>
              
              <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Product:</strong> ${productId.title}</p>
                <p><strong>Rental Period:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
                <p><strong>Owner:</strong> ${owner.firstName || owner.username}</p>
                <p><strong>Total Amount Paid:</strong> ₹${totalPrice}</p>
                <p><strong>Payment ID:</strong> ${payment.gatewayPaymentId}</p>
              </div>
              
              <p>An invoice has been generated and is available in your account. You can also download it from the booking details page.</p>
              
              <p>If you have any questions about your rental, please contact us or the owner directly.</p>
              
              <p>Thank you for using our platform!</p>
              
              <p>Best regards,<br>
              <strong>Rental Management Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Rental Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    // Send email to owner
    await sendEmail({
      to: owner.email,
      subject: 'New Rental Payment Received',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Rental Payment</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 40px; }
            .booking-details { background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Rental Payment</h1>
              <p>You've received a payment for your rental item</p>
            </div>
            
            <div class="content">
              <h2>Hello ${owner.firstName || owner.username},</h2>
              
              <p>Good news! A payment of ₹${booking.ownerAmount} (after platform fee) has been received for your rental item.</p>
              
              <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Product:</strong> ${productId.title}</p>
                <p><strong>Rental Period:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
                <p><strong>Renter:</strong> ${renter.firstName || renter.username}</p>
                <p><strong>Total Rental Amount:</strong> ₹${totalPrice}</p>
                <p><strong>Your Earnings (after platform fee):</strong> ₹${booking.ownerAmount}</p>
              </div>
              
              <p>Please prepare the item for pickup according to the agreed schedule. The funds will be transferred to your account after the rental is confirmed.</p>
              
              <p>Thank you for using our platform!</p>
              
              <p>Best regards,<br>
              <strong>Rental Management Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Rental Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('Payment confirmation emails sent successfully');
  } catch (error) {
    console.error('Error sending payment confirmation emails:', error);
  }
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
    
    // Generate rental agreement document
    try {
      const documentService = await import('../services/document.service.js');
      const rentalAgreement = await documentService.generateRentalAgreement(booking._id);
      console.log('Rental agreement generated:', rentalAgreement?._id);
    } catch (documentError) {
      console.error('Failed to generate rental agreement:', documentError);
      // Continue even if document generation fails
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

// Start payment for a booking - redirects to payment controller
export const initiateBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Redirect to the payment controller's initiatePayment endpoint
    req.body.bookingId = bookingId;
    req.body.amount = booking.totalPrice;
    req.body.currency = 'inr';
    
    // Forward the request to the payment controller using axios
    const axios = (await import('axios')).default;
    const response = await axios.post(
      `${req.protocol}://${req.get('host')}/api/payments/initiate`,
      req.body
    );
    
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to initiate payment", error: error.message });
  }
};

// Confirm payment - redirects to payment controller
export const confirmBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Payment intent ID is required' });
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.status !== "pending_payment") {
      return res.status(400).json({ success: false, message: "Booking is not ready for payment" });
    }
    
    // Redirect to the payment controller's confirmPayment endpoint
    req.body.bookingId = bookingId;
    
    // Forward the request to the payment controller using axios
    const axios = (await import('axios')).default;
    const response = await axios.post(
      `${req.protocol}://${req.get('host')}/api/payments/confirm`,
      req.body
    );
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm payment', error: error.message });
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

// Generate OTP for delivery verification
export const generateDeliveryOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userType } = req.body; // 'owner' or 'renter'
    
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title')
      .populate('renterId', 'email firstName lastName username')
      .populate('ownerId', 'email firstName lastName username');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    if (booking.status !== "confirmed" && booking.status !== "in_rental") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be confirmed or in rental state for delivery verification" 
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Check if an active OTP already exists
    const existingOTP = await mongoose.model('OTP').findOne({
      bookingId: booking._id,
      type: "delivery",
      expiresAt: { $gt: new Date() }
    });
    
    if (existingOTP) {
      // Update existing OTP
      existingOTP.otp = otp;
      existingOTP.expiresAt = expiresAt;
      existingOTP.ownerVerified = false;
      existingOTP.renterVerified = false;
      await existingOTP.save();
    } else {
      // Create new OTP record
      await mongoose.model('OTP').create({
        bookingId: booking._id,
        otp,
        type: "delivery",
        expiresAt
      });
    }
    
    // Determine recipient based on userType
    const recipient = userType === 'owner' ? booking.ownerId : booking.renterId;
    const recipientName = recipient.firstName || recipient.username;
    
    // Send OTP via email
    await sendDeliveryReturnOTP(
      recipient.email,
      otp,
      recipientName,
      booking.productId.title,
      true // isDelivery = true
    );
    
    res.json({ 
      success: true, 
      message: `Delivery verification OTP sent to ${userType}`,
      expiresAt
    });
  } catch (error) {
    console.error('Error generating delivery OTP:', error);
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
    const { otp, userType } = req.body; // 'owner' or 'renter'
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    // Find active OTP for this booking
    const otpRecord = await mongoose.model('OTP').findOne({
      bookingId: booking._id,
      type: "delivery",
      otp,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }
    
    // Update verification status based on user type
    if (userType === 'owner') {
      otpRecord.ownerVerified = true;
    } else if (userType === 'renter') {
      otpRecord.renterVerified = true;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user type" 
      });
    }
    
    await otpRecord.save();
    
    // Check if both owner and renter have verified
    if (otpRecord.ownerVerified && otpRecord.renterVerified) {
      // Update booking status
      booking.deliveryStatus = "delivered";
      booking.deliveryDate = new Date();
      booking.status = "in_rental";
      await booking.save();
      
      // Create notifications
      await Promise.all([
        // Notify owner
        Notification.create({
          userId: booking.ownerId,
          userClerkId: booking.ownerClerkId,
          type: "delivery_completed",
          message: `Product has been successfully delivered to the renter`,
          relatedId: booking._id,
          relatedType: "booking"
        }),
        // Notify renter
        Notification.create({
          userId: booking.renterId,
          userClerkId: booking.renterClerkId,
          type: "delivery_completed",
          message: `Product has been successfully delivered to you`,
          relatedId: booking._id,
          relatedType: "booking"
        })
      ]);
      
      return res.json({ 
        success: true, 
        message: "Delivery verified by both parties and completed",
        booking
      });
    }
    
    res.json({ 
      success: true, 
      message: `OTP verified by ${userType}`,
      ownerVerified: otpRecord.ownerVerified,
      renterVerified: otpRecord.renterVerified
    });
  } catch (error) {
    console.error('Error verifying delivery OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify delivery OTP", 
      error: error.message 
    });
  }
};

// Generate OTP for return verification
export const generateReturnOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userType } = req.body; // 'owner' or 'renter'
    
    const booking = await Booking.findById(bookingId)
      .populate('productId', 'title')
      .populate('renterId', 'email firstName lastName username')
      .populate('ownerId', 'email firstName lastName username');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    if (booking.status !== "in_rental") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be in rental state for return verification" 
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
    
    // Check if an active OTP already exists
    const existingOTP = await mongoose.model('OTP').findOne({
      bookingId: booking._id,
      type: "return",
      expiresAt: { $gt: new Date() }
    });
    
    if (existingOTP) {
      // Update existing OTP
      existingOTP.otp = otp;
      existingOTP.expiresAt = expiresAt;
      existingOTP.ownerVerified = false;
      existingOTP.renterVerified = false;
      await existingOTP.save();
    } else {
      // Create new OTP record
      await mongoose.model('OTP').create({
        bookingId: booking._id,
        otp,
        type: "return",
        expiresAt
      });
    }
    
    // Determine recipient based on userType
    const recipient = userType === 'owner' ? booking.ownerId : booking.renterId;
    const recipientName = recipient.firstName || recipient.username;
    
    // Send OTP via email
    await sendDeliveryReturnOTP(
      recipient.email,
      otp,
      recipientName,
      booking.productId.title,
      false // isDelivery = false (return)
    );
    
    res.json({ 
      success: true, 
      message: `Return verification OTP sent to ${userType}`,
      expiresAt
    });
  } catch (error) {
    console.error('Error generating return OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate return OTP", 
      error: error.message 
    });
  }
};

// Verify return OTP and complete booking
export const verifyReturnOTP = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { otp, userType, dropLocation } = req.body; // 'owner' or 'renter'
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    // Find active OTP for this booking
    const otpRecord = await mongoose.model('OTP').findOne({
      bookingId: booking._id,
      type: "return",
      otp,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }
    
    // Update verification status based on user type
    if (userType === 'owner') {
      otpRecord.ownerVerified = true;
    } else if (userType === 'renter') {
      otpRecord.renterVerified = true;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user type" 
      });
    }
    
    await otpRecord.save();
    
    // Check if both owner and renter have verified
    if (otpRecord.ownerVerified && otpRecord.renterVerified) {
      // Complete the booking
      booking.status = "completed";
      booking.returnStatus = "completed";
      booking.returnDate = new Date();
      if (dropLocation) booking.dropLocation = dropLocation;
      await booking.save();
      
      // Create notifications
      await Promise.all([
        // Notify owner
        Notification.create({
          userId: booking.ownerId,
          userClerkId: booking.ownerClerkId,
          type: "return_completed",
          message: `Product has been successfully returned by the renter`,
          relatedId: booking._id,
          relatedType: "booking"
        }),
        // Notify renter
        Notification.create({
          userId: booking.renterId,
          userClerkId: booking.renterClerkId,
          type: "return_completed",
          message: `You have successfully returned the product`,
          relatedId: booking._id,
          relatedType: "booking"
        })
      ]);
      
      return res.json({ 
        success: true, 
        message: "Return verified by both parties and booking completed",
        booking
      });
    }
    
    res.json({ 
      success: true, 
      message: `OTP verified by ${userType}`,
      ownerVerified: otpRecord.ownerVerified,
      renterVerified: otpRecord.renterVerified
    });
  } catch (error) {
    console.error('Error verifying return OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify return OTP", 
      error: error.message 
    });
  }
};

// Complete booking on return (legacy method, kept for backward compatibility)
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

    // Generate return document
    try {
      const documentService = await import('../services/document.service.js');
      const returnDocument = await documentService.createReturnDocument(booking._id);
      console.log('Return document generated:', returnDocument?._id);
    } catch (documentError) {
      console.error('Failed to generate return document:', documentError);
      // Continue even if document generation fails
    }

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
    
    // Generate pickup document
    try {
      const documentService = await import('../services/document.service.js');
      const pickupDocument = await documentService.createPickupDocument(booking._id);
      console.log('Pickup document generated:', pickupDocument?._id);
    } catch (documentError) {
      console.error('Failed to generate pickup document:', documentError);
      // Continue even if document generation fails
    }

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
