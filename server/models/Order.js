const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [mongoose.Schema.Types.Mixed], required: true },
    totalRupees: { type: Number, required: true },
    shippingAddress: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ["confirmed", "processing", "out_for_delivery", "delivered"],
      default: "confirmed",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
