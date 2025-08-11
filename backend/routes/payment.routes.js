import express from "express";
import { getAllPayments, getPaymentById, handleStripeWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

// Get all payments (admin)
router.get("/", getAllPayments);

// Get single payment
router.get("/:paymentId", getPaymentById);

// Stripe webhook for payment confirmations
router.post("/webhook/stripe", express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
