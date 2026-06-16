const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"]
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerDept: {
    type: String,
    required: true
  },
  sellerYear: {
    type: String,
    required: true
  },
  sellerPhoto: {
    type: String,
    required: true
  },
  postedTime: {
    type: String,
    default: "Just now"
  },
  views: {
    type: Number,
    default: 1
  },
  saves: {
    type: Number,
    default: 0
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Listing", ListingSchema);
