const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const LostFound = require("../models/LostFound");
const User = require("../models/User");

// @route   GET api/lostfound
// @desc    Get all unresolved lost/found reports
// @access  Public
router.get("/", async (req, res) => {
  try {
    const lostFound = await LostFound.find().sort({ createdAt: -1 });
    res.json(lostFound);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/lostfound
// @desc    Create a new lost/found report
// @access  Private
router.post("/", auth, async (req, res) => {
  const { name, type, location, date, description } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const newReport = new LostFound({
      name,
      type,
      location,
      date,
      description,
      studentId: req.user.id,
      studentName: user.name,
      postedTime: "Just now"
    });

    const report = await newReport.save();
    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PATCH api/lostfound/:id/resolve
// @desc    Mark a report as resolved
// @access  Private
router.patch("/:id/resolve", auth, async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: "Report not found" });
    }

    // Only allow item owner or admin to resolve it
    if (report.studentId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    report.resolved = true;
    await report.save();

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
