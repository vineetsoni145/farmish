const express = require("express");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { orderId, items, totalRupees, shippingAddress } = req.body;
    if (
      !orderId ||
      !Array.isArray(items) ||
      !items.length ||
      typeof totalRupees !== "number"
    ) {
      return res.status(400).json({ error: "Invalid order payload" });
    }
    const order = await Order.create({
      orderId,
      user: req.user.id,
      items,
      totalRupees,
      shippingAddress,
    });
    res.status(201).json({ orderId: order.orderId, status: order.status });
  } catch (error) {
    next(error);
  }
});

router.get("/:orderId", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user.id,
    }).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({
      orderId: order.orderId,
      status: order.status,
      items: order.items,
      totalRupees: order.totalRupees,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
