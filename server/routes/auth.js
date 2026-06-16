const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/User");

// @route   POST api/auth/login
// @desc    Auth user & get token (Login or Register on the fly)
// @access  Public
router.post("/login", async (req, res) => {
  const { email, name, photo, department, year, bio } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if not exists
      user = new User({
        name: name || email.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
        email,
        photo: photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        department: department || "Computer Science & Engineering (CSE)",
        year: year || "1st Year",
        bio: bio || "VIT-AP Student. Connect to buy or sell items.",
        isAdmin: email.includes("admin") || email === "ramana.murthy@vitap.ac.in"
      });
      await user.save();
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "vitconnect_fallback_secret",
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PATCH api/auth/profile
// @desc    Update current user profile fields
// @access  Private
router.patch("/profile", auth, async (req, res) => {
  const { name, department, year, bio, photo } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (department) updateFields.department = department;
  if (year) updateFields.year = year;
  if (bio) updateFields.bio = bio;
  if (photo) updateFields.photo = photo;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/auth/users
// @desc    Get all users (Admin view or profiles query)
// @access  Public
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/auth/users/:id
// @desc    Ban/Delete a user
// @access  Private (Admin only)
router.delete("/users/:id", auth, async (req, res) => {
  try {
    // Check if requester is Admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied. Admin authorization required." });
    }

    const userToBan = await User.findById(req.params.id);
    if (!userToBan) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (userToBan.isAdmin) {
      return res.status(400).json({ msg: "Cannot ban an administrator account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User banned and deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
