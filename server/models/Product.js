const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    priceRupees: { type: Number, required: true, min: 0 },
    unitLabel: { type: String, required: true },
    category: { type: String, required: true, index: true },
    img: String,
    description: String,
    full: { type: Number, default: 5 },
    empty: { type: Number, default: 0 },
    ratingText: String,
    ratingScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
