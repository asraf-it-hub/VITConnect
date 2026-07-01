const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Listing = require("../models/Listing");
const User = require("../models/User");

// @route   GET api/listings
// @desc    Get all listings
// @access  Public
router.get("/", async (req, res) => {
  try {
    // Automatically release expired reservations
    const now = new Date();
    await Listing.updateMany(
      {
        status: "Reserved",
        reservedUntil: { $ne: null, $lt: now }
      },
      {
        $set: { status: "Available", reservedUntil: null, reservedBy: null }
      }
    );

    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/listings
// @desc    Create a new listing
// @access  Private
router.post("/", auth, async (req, res) => {
  const { name, price, category, condition, description, images, upiId, qrCode } = req.body;

  if (!upiId) {
    return res.status(400).json({ msg: "UPI ID is required for direct peer-to-peer payments." });
  }

  const upiRegex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  if (!upiRegex.test(upiId)) {
    return res.status(400).json({ msg: "Invalid UPI ID format. Correct format is name@bank" });
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ msg: "Please upload at least one photo of the item." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const newListing = new Listing({
      name,
      price: parseFloat(price) || 0,
      category,
      condition,
      description,
      images,
      upiId,
      qrCode: qrCode || "",
      sellerId: req.user.id,
      sellerName: user.name,
      sellerDept: user.department,
      sellerYear: user.year,
      sellerPhoto: user.photo,
      postedTime: "Just now",
      status: "Available"
    });

    const listing = await newListing.save();
    res.json(listing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PATCH api/listings/:id/report
// @desc    Report a listing for spam/fake
// @access  Private
router.patch("/:id/report", auth, async (req, res) => {
  const { reason } = req.body;

  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }

    listing.isReported = true;
    listing.reportReason = reason || "Spam";
    await listing.save();

    res.json(listing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }

    // Check if listing belongs to user OR user is admin
    if (listing.sellerId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: "User not authorized to delete this listing" });
    }

    // Incremement items sold stats on delete if it was sold (optional, for mock consistency, we can just delete it)
    if (listing.sellerId.toString() === req.user.id) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { itemsSold: 1 } });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ msg: "Listing deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
