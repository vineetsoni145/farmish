const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const {
      category = "all",
      query = "",
      minPrice,
      maxPrice,
      sortBy = "relevance",
      sortOrder = "desc",
    } = req.query;
    const filter = {};
    if (category !== "all") filter.category = category;
    if (query)
      filter.$or = [
        { name: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
      ];
    if (minPrice || maxPrice) {
      filter.priceRupees = {};
      if (minPrice) filter.priceRupees.$gte = Number(minPrice);
      if (maxPrice) filter.priceRupees.$lte = Number(maxPrice);
    }
    const sort =
      sortBy === "price"
        ? { priceRupees: sortOrder === "asc" ? 1 : -1 }
        : sortBy === "rating"
          ? { ratingScore: sortOrder === "asc" ? 1 : -1 }
          : {};
    const products = await Product.find(filter).sort(sort).lean();
    res.json(
      products.map(({ _id, ...product }) => ({
        id: _id,
        ...product,
        priceDisplay: `₹${product.priceRupees}/${product.unitLabel}`,
      })),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: "Product not found" });
    const { _id, ...data } = product;
    res.json({
      id: _id,
      ...data,
      priceDisplay: `₹${data.priceRupees}/${data.unitLabel}`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
