const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Request = require("../models/Request");
const User = require("../models/User");

// @route   GET api/requests
// @desc    Get all requests
// @access  Public
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/requests
// @desc    Create a new request
// @access  Private
router.post("/", auth, async (req, res) => {
  const { itemName, budget, deadline, description } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const newRequest = new Request({
      itemName,
      budget: parseFloat(budget) || 0,
      deadline,
      description,
      requesterId: req.user.id,
      requesterName: user.name,
      requesterDept: user.department,
      requesterYear: user.year,
      postedTime: "Just now"
    });

    const request = await newRequest.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/requests/:id
// @desc    Delete a request
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    // Check if request belongs to user OR user is admin
    if (request.requesterId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: "User not authorized to delete this request" });
    }

    await Request.findByIdAndDelete(req.params.id);
    res.json({ msg: "Request deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
