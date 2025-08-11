import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    renterClerkId: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerClerkId: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    totalPrice: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },

    status: { 
      type: String, 
      enum: ["pending", "confirmed", "in_rental", "cancelled", "completed"], 
      default: "pending" 
    },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },

    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    pickupStatus: { type: String, enum: ["pending", "scheduled", "completed"], default: "pending" },
    pickupDate: Date,

    deliveryStatus: { type: String, enum: ["pending", "out_for_delivery", "delivered"], default: "pending" },
    deliveryDate: Date,

    returnStatus: { type: String, enum: ["pending", "scheduled", "completed", "late"], default: "pending" },
    returnDate: Date,
    lateFee: { type: Number, default: 0 },

    platformFee: { type: Number, default: 0 },
    ownerAmount: { type: Number, default: 0 },

    payoutStatus: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    payoutDate: Date,

    cancelReason: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
