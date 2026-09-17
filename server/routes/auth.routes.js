const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email || "",
    phone: user.phone || "",
    role: user.role,
    savedAddresses: user.savedAddresses || [],
  };
}

function issueToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ error: "Fill all required fields" });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(409).json({ error: "Account already exists" });

    const user = await User.create({
      name,
      email: email || undefined,
      phone: phone || undefined,
      passwordHash: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { contact, password } = req.body;
    const normalized = String(contact || "")
      .trim()
      .toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalized }, { phone: contact }],
    });
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
