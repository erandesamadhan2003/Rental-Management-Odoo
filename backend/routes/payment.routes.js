import express from "express";
import { getAllPayments, getPaymentById, handleStripeWebhook, initiatePayment, confirmPayment } from "../controllers/payment.controller.js";

const router = express.Router();

// Get all payments (admin)
router.get("/", getAllPayments);

// Get single payment
router.get("/:paymentId", getPaymentById);

// Initiate payment
router.post("/initiate", initiatePayment);

// Confirm payment
router.post("/confirm", confirmPayment);

// Stripe webhook for payment confirmations
router.post("/webhook/stripe", express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
