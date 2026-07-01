const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const Listing = require("../models/Listing");
const User = require("../models/User");

// @route   POST api/orders/reserve/:productId
// @desc    Reserve a product for 15 minutes
// @access  Private
router.post("/reserve/:productId", auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.productId);
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }

    if (listing.sellerId.toString() === req.user.id) {
      return res.status(400).json({ msg: "You cannot purchase your own listing" });
    }

    const now = new Date();

    // Check if listing is already sold
    if (listing.status === "Sold") {
      return res.status(400).json({ msg: "This item has already been sold" });
    }

    // Check if listing is reserved by someone else and reservation is still valid
    if (
      listing.status === "Reserved" &&
      listing.reservedBy &&
      listing.reservedBy.toString() !== req.user.id &&
      listing.reservedUntil &&
      listing.reservedUntil > now
    ) {
      // Check if there is a pending order. If so, it is locked
      const pendingOrder = await Order.findOne({
        productId: listing._id,
        status: "Pending Payment Verification"
      });
      if (pendingOrder) {
        return res.status(400).json({ msg: "This item is currently undergoing payment verification" });
      }
      return res.status(400).json({ msg: "This item is currently reserved by another buyer" });
    }

    // Reserve for 15 minutes
    listing.status = "Reserved";
    listing.reservedBy = req.user.id;
    listing.reservedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await listing.save();
    res.json(listing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/orders/submit
// @desc    Create an order and submit Transaction ID + payment screenshot
// @access  Private
router.post("/submit", auth, async (req, res) => {
  const { productId, transactionId, screenshot } = req.body;

  if (!productId || !transactionId) {
    return res.status(400).json({ msg: "Product ID and Transaction ID are required" });
  }

  try {
    const listing = await Listing.findById(productId);
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }

    if (listing.status === "Sold") {
      return res.status(400).json({ msg: "This item has already been sold" });
    }

    // Check if anyone else has a valid reservation
    const now = new Date();
    if (
      listing.status === "Reserved" &&
      listing.reservedBy &&
      listing.reservedBy.toString() !== req.user.id &&
      listing.reservedUntil &&
      listing.reservedUntil > now
    ) {
      return res.status(400).json({ msg: "This item reservation has been acquired by another buyer" });
    }

    // Prevent duplicate active orders for the same product
    const existingOrder = await Order.findOne({
      productId: listing._id,
      buyerId: req.user.id,
      status: "Pending Payment Verification"
    });
    if (existingOrder) {
      return res.status(400).json({ msg: "You have already submitted a payment for this listing" });
    }

    const buyer = await User.findById(req.user.id);
    if (!buyer) {
      return res.status(404).json({ msg: "Buyer profile not found" });
    }

    const seller = await User.findById(listing.sellerId);
    if (!seller) {
      return res.status(404).json({ msg: "Seller profile not found" });
    }

    // Create Order
    const newOrder = new Order({
      buyerId: req.user.id,
      buyerName: buyer.name,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      productId: listing._id,
      productName: listing.name,
      amount: listing.price,
      transactionId,
      screenshot: screenshot || "",
      status: "Pending Payment Verification"
    });

    const order = await newOrder.save();

    // Lock listing in Reserved indefinitely (reservedUntil = null) until seller reviews
    listing.status = "Reserved";
    listing.reservedBy = req.user.id;
    listing.reservedUntil = null; // No expiry now that payment is submitted
    await listing.save();

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/orders/buyer
// @desc    Get all orders purchased by the current user
// @access  Private
router.get("/buyer", auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/orders/seller
// @desc    Get all orders received by current user (as seller)
// @access  Private
router.get("/seller", auth, async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PATCH api/orders/:orderId/approve
// @desc    Approve a payment and mark product as Sold
// @access  Private
router.patch("/:orderId/approve", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.sellerId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized to approve this payment" });
    }

    if (order.status !== "Pending Payment Verification") {
      return res.status(400).json({ msg: `Order payment has already been marked as ${order.status}` });
    }

    // Update order status
    order.status = "Completed";
    await order.save();

    // Update listing status to Sold
    const listing = await Listing.findById(order.productId);
    if (listing) {
      listing.status = "Sold";
      await listing.save();
    }

    // Increment seller items sold count
    await User.findByIdAndUpdate(req.user.id, { $inc: { itemsSold: 1 } });

    // Cancel / reject any other pending orders for the same listing if any exist (safety check)
    await Order.updateMany(
      { productId: order.productId, _id: { $ne: order._id }, status: "Pending Payment Verification" },
      { $set: { status: "Rejected" } }
    );

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PATCH api/orders/:orderId/reject
// @desc    Reject a payment and make product Available again
// @access  Private
router.patch("/:orderId/reject", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.sellerId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized to reject this payment" });
    }

    if (order.status !== "Pending Payment Verification") {
      return res.status(400).json({ msg: `Order payment has already been marked as ${order.status}` });
    }

    // Update order status
    order.status = "Rejected";
    await order.save();

    // Reset Listing back to Available
    const listing = await Listing.findById(order.productId);
    if (listing && listing.status === "Reserved" && listing.reservedBy.toString() === order.buyerId.toString()) {
      listing.status = "Available";
      listing.reservedBy = null;
      listing.reservedUntil = null;
      await listing.save();
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/orders/admin
// @desc    Get all orders (Admin only)
// @access  Private
router.get("/admin", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied. Admin authorization required." });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/orders/admin/:orderId
// @desc    Delete/Cancel an order and release product if necessary (Admin only)
// @access  Private
router.delete("/admin/:orderId", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied. Admin authorization required." });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // If order was pending payment, release product reservation
    if (order.status === "Pending Payment Verification") {
      const listing = await Listing.findById(order.productId);
      if (listing && listing.status === "Reserved" && listing.reservedBy.toString() === order.buyerId.toString()) {
        listing.status = "Available";
        listing.reservedBy = null;
        listing.reservedUntil = null;
        await listing.save();
      }
    }

    await Order.findByIdAndDelete(req.params.orderId);
    res.json({ msg: "Order deleted and released successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
