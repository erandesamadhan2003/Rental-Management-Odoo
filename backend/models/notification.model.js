import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userClerkId: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: [
        "reminder", 
        "payment", 
        "system", 
        "promotion", 
        "rental_request", 
        "rental_accepted", 
        "rental_rejected", 
        "payment_confirmation", 
        "pickup_scheduled", 
        "drop_scheduled",
        "due_payment"
      ]
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // For related booking/product
    relatedType: { type: String }, // 'booking', 'product', 'payment'
    metadata: { type: mongoose.Schema.Types.Mixed } // Additional data
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
