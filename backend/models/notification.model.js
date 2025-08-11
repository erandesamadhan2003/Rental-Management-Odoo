import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userClerkId: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
