import express from "express";
import {
  createBooking,
  initiateBookingPayment,
  confirmBookingPayment,
  confirmPickup,
  completeBooking,
  cancelBooking
} from "../controllers/booking.controller.js";

const router = express.Router();

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
