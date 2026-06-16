const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  department: {
    type: String,
    default: ""
  },
  year: {
    type: String,
    default: ""
  },
  photo: {
    type: String,
    default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  },
  bio: {
    type: String,
    default: "VIT-AP Student. Connect to buy or sell items."
  },
  rating: {
    type: Number,
    default: 5.0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  itemsSold: {
    type: Number,
    default: 0
  },
  joinDate: {
    type: String,
    default: () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" })
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  badge: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("User", UserSchema);
