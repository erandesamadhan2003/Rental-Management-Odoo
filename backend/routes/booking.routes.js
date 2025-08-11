import express from "express";
import {
  createBooking,
  createRentalRequest,
  acceptRentalRequest,
  rejectRentalRequest,
  listBookings,
  getBookingById,
  initiateBookingPayment,
  confirmBookingPayment,
  updateBookingPaymentStatus,
  confirmPickup,
  completeBooking,
  cancelBooking,
  generateDeliveryOTP,
  verifyDeliveryOTP,
  generateReturnOTP,
  verifyReturnOTP
} from "../controllers/booking.controller.js";

const router = express.Router();

// List bookings
router.get('/', listBookings);

// Get booking by ID
router.get('/:id', getBookingById);

// Create rental request with automatic pricing
router.post('/rental-request', createRentalRequest);

// Create booking
router.post("/", createBooking);

// Accept rental request (owner action)
router.post("/:bookingId/accept", acceptRentalRequest);

// Reject rental request (owner action)
router.post("/:bookingId/reject", rejectRentalRequest);

// Update payment status (simple payment completion)
router.post("/:bookingId/payment", updateBookingPaymentStatus);

// Start payment for a booking
router.post("/:bookingId/pay", initiateBookingPayment);

// Confirm payment after Razorpay callback
router.post("/:bookingId/confirm-payment", confirmBookingPayment);

// Confirm pickup & start payout
router.put("/:bookingId/confirm-pickup", confirmPickup);

// Complete booking on return (legacy method)
router.put("/:bookingId/complete", completeBooking);

// Delivery OTP endpoints
router.post("/:bookingId/delivery/generate-otp", generateDeliveryOTP);
router.post("/:bookingId/delivery/verify-otp", verifyDeliveryOTP);

// Return OTP endpoints
router.post("/:bookingId/return/generate-otp", generateReturnOTP);
router.post("/:bookingId/return/verify-otp", verifyReturnOTP);

// Cancel booking & refund if paid
router.put("/:bookingId/cancel", cancelBooking);

export default router;
