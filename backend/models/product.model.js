import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date
});

const productSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Mongo ref
    ownerClerkId: { type: String, required: true }, // Clerk reference
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    pricePerHour: Number,
    pricePerDay: Number,
    pricePerWeek: Number,
    location: { type: String, required: true },
    images: [String],
    availability: [availabilitySchema],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
