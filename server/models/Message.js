const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: () => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Today, ${timestamp}`;
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  productContext: {
    id: { type: String },
    name: { type: String },
    price: { type: mongoose.Schema.Types.Mixed }, // String or Number
    image: { type: String },
    isRequest: { type: Boolean },
    isLostFound: { type: Boolean }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model("Message", MessageSchema);
