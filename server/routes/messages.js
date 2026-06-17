const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const User = require("../models/User");

// Helper: Get room ID for two users (sorted join)
const getRoomId = (uid1, uid2) => {
  return [uid1.toString(), uid2.toString()].sort().join("-");
};

// @route   GET api/messages
// @desc    Get all conversations/chats for current user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Fetch all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { recipientId: currentUserId }]
    }).sort({ createdAt: 1 }); // Sort chronologically to construct thread

    // Group messages by counter-party
    const groups = {};
    for (const msg of messages) {
      const isMine = msg.senderId.toString() === currentUserId;
      const counterPartyId = isMine ? msg.recipientId.toString() : msg.senderId.toString();
      
      const rId = getRoomId(currentUserId, counterPartyId);

      if (!groups[rId]) {
        groups[rId] = {
          roomId: rId,
          counterPartyId,
          messages: [],
          productContext: msg.productContext || null
        };
      }
      
      // Update productContext to latest if available
      if (msg.productContext && msg.productContext.id) {
        groups[rId].productContext = msg.productContext;
      }

      groups[rId].messages.push({
        senderId: msg.senderId.toString(),
        text: msg.text,
        time: msg.time,
        read: msg.read
      });
    }

    // Now convert grouped threads into frontend friendly objects
    const conversations = [];
    for (const key of Object.keys(groups)) {
      const grp = groups[key];
      
      // Fetch counterparty details
      const counterUser = await User.findById(grp.counterPartyId);
      if (!counterUser) continue; // Skip if user no longer exists

      // Calculate unread count (incoming messages that are unread)
      const unreadCount = grp.messages.filter(
        m => m.senderId !== currentUserId && !m.read
      ).length;

      conversations.push({
        id: `chat-${grp.counterPartyId}`,
        recipientId: grp.counterPartyId,
        recipientName: counterUser.name,
        recipientPhoto: counterUser.photo,
        recipientDept: counterUser.department,
        recipientYear: counterUser.year,
        recipientMobile: counterUser.mobile || "",
        productContext: grp.productContext,
        messages: grp.messages,
        unreadCount
      });
    }

    // Sort by latest message time
    conversations.sort((a, b) => {
      return b.messages.length - a.messages.length; // Simple fallback sorting
    });

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post("/", auth, async (req, res) => {
  const { recipientId, text, productContext } = req.body;

  try {
    const senderId = req.user.id;
    const rId = getRoomId(senderId, recipientId);

    const newMessage = new Message({
      roomId: rId,
      senderId,
      recipientId,
      text,
      productContext
    });

    const msg = await newMessage.save();
    res.json(msg);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PATCH api/messages/read/:recipientId
// @desc    Mark all messages in a chat thread as read
// @access  Private
router.patch("/read/:recipientId", auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const senderId = req.params.recipientId;

    // Mark as read all incoming messages from this recipient
    await Message.updateMany(
      { senderId, recipientId: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json({ msg: "Messages marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
