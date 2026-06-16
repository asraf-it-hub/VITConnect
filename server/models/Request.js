const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    type: Number,
    required: true
  },
  deadline: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterDept: {
    type: String,
    required: true
  },
  requesterYear: {
    type: String,
    required: true
  },
  postedTime: {
    type: String,
    default: "Just now"
  },
  saves: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Request", RequestSchema);
