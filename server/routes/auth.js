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
        department: department || "",
        year: year || "",
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

// @route   POST api/auth/google
// @desc    Login/Register using Google ID Token
// @access  Public
router.post("/google", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ msg: "Google ID Token is required" });
  }

  try {
    // Verify ID Token with Google's tokeninfo API
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!googleRes.ok) {
      return res.status(400).json({ msg: "Invalid Google ID Token" });
    }

    const googleUser = await googleRes.json();
    const { email, name, picture } = googleUser;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        photo: picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        department: "",
        year: "",
        bio: "VIT-AP Student. Logged in with Google OAuth.",
        isAdmin: email.includes("admin") || email === "ramana.murthy@vitap.ac.in"
      });
      await user.save();
    }

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

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
    console.error("Google Auth Error:", err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/github
// @desc    Login/Register using GitHub OAuth Code
// @access  Public
router.post("/github", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ msg: "GitHub auth code is required" });
  }

  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ msg: "GitHub OAuth credentials are not configured on the server" });
    }

    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    if (!tokenRes.ok) {
      return res.status(400).json({ msg: "Failed to exchange GitHub authorization code" });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(400).json({ msg: "GitHub access token not returned", details: tokenData });
    }

    // Fetch user profile from GitHub API
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `token ${accessToken}`,
        "User-Agent": "VITConnect-App"
      }
    });

    if (!userRes.ok) {
      return res.status(400).json({ msg: "Failed to retrieve GitHub user profile" });
    }

    const githubUser = await userRes.json();
    const { login, name, avatar_url } = githubUser;

    // Fetch user emails from GitHub (sometimes email is private/null in profile)
    let email = githubUser.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          "Authorization": `token ${accessToken}`,
          "User-Agent": "VITConnect-App"
        }
      });
      if (emailsRes.ok) {
        const emails = await emailsRes.json();
        const primaryEmail = emails.find(e => e.primary);
        email = primaryEmail ? primaryEmail.email : null;
      }
    }

    // Fallback if no email can be found
    if (!email) {
      email = `${login.toLowerCase()}@github.com`;
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name || login,
        email,
        photo: avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        department: "",
        year: "",
        bio: "VIT-AP Student. Logged in with GitHub OAuth.",
        isAdmin: email.includes("admin") || email === "ramana.murthy@vitap.ac.in"
      });
      await user.save();
    }

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

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
    console.error("GitHub Auth Error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
