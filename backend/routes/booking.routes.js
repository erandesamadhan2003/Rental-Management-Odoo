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
  confirmPickup,
  completeBooking,
  cancelBooking
} from "../controllers/booking.controller.js";

const router = express.Router();

// List bookings
router.get('/', listBookings);

// Get booking by ID
router.get('/:id', getBookingById);

// Create rental request
router.post('/rental-request', createRentalRequest);

// Owner actions on rental requests
router.put('/:bookingId/accept', acceptRentalRequest);
router.put('/:bookingId/reject', rejectRentalRequest);

// Create booking
router.post("/", createBooking);

// Start payment for a booking
router.post("/:bookingId/pay", initiateBookingPayment);

// Confirm payment after Razorpay callback
router.post("/:bookingId/confirm-payment", confirmBookingPayment);

// Confirm pickup & start payout
router.put("/:bookingId/confirm-pickup", confirmPickup);

// Complete booking on return
router.put("/:bookingId/complete", completeBooking);

// Cancel booking & refund if paid
router.put("/:bookingId/cancel", cancelBooking);

export default router;
