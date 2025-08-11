import express from "express";
import {
  getMyNotifications,
  markNotificationRead
} from "../controllers/notification.controller.js";

const router = express.Router();

// Notification flow
router.get("/my", getMyNotifications);
router.put("/:id/read", markNotificationRead);

export default router;
