const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// @route   POST api/auth/send-otp
// @desc    Generate, hash, store and send a 6-digit OTP to the user's email
// @access  Public
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  // Validate email domain
  const lowerEmail = email.toLowerCase();
  const isValidDomain =
    lowerEmail.endsWith("@vitap.ac.in") ||
    lowerEmail.endsWith("@vitapstudent.ac.in") ||
    lowerEmail.endsWith("@gmail.com");

  if (!isValidDomain) {
    return res.status(400).json({ msg: "Please use a valid student email (@vitap.ac.in) or Gmail (@gmail.com)" });
  }

  try {
    // Rate limiting: Check if an OTP was sent to this email in the last 60 seconds
    const existingOtp = await Otp.findOne({ email: lowerEmail });
    if (existingOtp) {
      const timeDiff = Date.now() - existingOtp.createdAt.getTime();
      if (timeDiff < 60 * 1000) {
        const secondsLeft = Math.ceil((60 * 1000 - timeDiff) / 1000);
        return res.status(429).json({ msg: `Please wait ${secondsLeft} seconds before requesting another OTP.` });
      }
      // Delete old OTP if expired or ready to be recreated
      await Otp.deleteOne({ email: lowerEmail });
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash the OTP before storing it using SHA-256
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Save to DB
    const newOtp = new Otp({
      email: lowerEmail,
      otpHash,
      createdAt: new Date()
    });
    await newOtp.save();

    // Send OTP via Resend
    let emailSent = false;
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== "YOUR_RESEND_API_KEY") {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: lowerEmail,
          subject: "VITConnect Authentication OTP",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; border: 1px solid #e5e7eb; border-radius: 12px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #10b981; font-size: 1.8rem; margin: 0; font-weight: bold;">VITConnect</h2>
                <p style="font-size: 0.9rem; color: #6b7280; margin: 5px 0 0 0;">Official Student Marketplace</p>
              </div>
              <div style="padding: 10px 0; border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6;">
                <p style="font-size: 1rem; line-height: 1.5; color: #4b5563;">Hello,</p>
                <p style="font-size: 1rem; line-height: 1.5; color: #4b5563;">Use the following OTP code to complete your login or registration on VITConnect. This code is valid for <strong>5 minutes</strong>.</p>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; font-size: 1.8rem; font-weight: bold; text-align: center; letter-spacing: 6px; margin: 24px 0; color: #10b981; border: 1px dashed #a7f3d0;">
                  ${otp}
                </div>
              </div>
              <p style="font-size: 0.85rem; line-height: 1.5; color: #9ca3af; margin-top: 20px;">If you didn't request this code, you can safely ignore this email.</p>
              <div style="text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #f3f4f6; font-size: 0.8rem; color: #9ca3af;">
                VITConnect Team • Connecting Campus Commerce
              </div>
            </div>
          `
        });
        emailSent = true;
      } catch (mailErr) {
        console.error("Resend API Error details:", mailErr.message);
      }
    }

    // Always log OTP to server console to ensure dev/testing is not blocked
    console.log(`\n========================================\n[OTP DEBUG] Send OTP to: ${lowerEmail}\nCode: ${otp}\n========================================\n`);

    res.json({
      msg: emailSent
        ? "OTP sent successfully to your email."
        : "OTP generated successfully (logged to server console in dev fallback)."
    });
  } catch (err) {
    console.error("Send OTP Route Error:", err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/verify-otp
// @desc    Verify OTP and log in / register the user
// @access  Public
router.post("/verify-otp", async (req, res) => {
  const { email, otp, name, department, year, bio, mobile, photo, password } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ msg: "Email and OTP code are required" });
  }

  const lowerEmail = email.toLowerCase();

  try {
    // Find OTP doc
    const otpDoc = await Otp.findOne({ email: lowerEmail });
    if (!otpDoc) {
      return res.status(400).json({ msg: "Invalid or expired OTP code." });
    }

    // Verify hash
    const inputHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (inputHash !== otpDoc.otpHash) {
      return res.status(400).json({ msg: "Invalid or incorrect OTP code." });
    }

    // Delete OTP document so it cannot be reused
    await Otp.deleteOne({ email: lowerEmail });

    // Look for user
    let user = await User.findOne({ email: lowerEmail });

    if (!user) {
      // Create user if not exists (Register)
      user = new User({
        name: name || lowerEmail.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
        email: lowerEmail,
        photo: photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        department: department || "",
        year: year || "",
        bio: bio || "VIT-AP Student. Connect to buy or sell items.",
        mobile: mobile || "",
        password: password ? bcrypt.hashSync(password, 10) : "",
        isAdmin: lowerEmail.includes("admin") || lowerEmail === "ramana.murthy@vitap.ac.in" || lowerEmail === "asrafpothuganti@gmail.com"
      });
      await user.save();
    } else {
      // User exists. Update details if they are provided during a login/signup hybrid flow (e.g. if they updated fields)
      let needsSave = false;
      if (name && user.name !== name) { user.name = name; needsSave = true; }
      if (department && user.department !== department) { user.department = department; needsSave = true; }
      if (year && user.year !== year) { user.year = year; needsSave = true; }
      if (bio && user.bio !== bio) { user.bio = bio; needsSave = true; }
      if (mobile && user.mobile !== mobile) { user.mobile = mobile; needsSave = true; }
      if (photo && user.photo !== photo) { user.photo = photo; needsSave = true; }
      if (password) {
        user.password = bcrypt.hashSync(password, 10);
        needsSave = true;
      }

      if (lowerEmail === "asrafpothuganti@gmail.com" && !user.isAdmin) {
        user.isAdmin = true;
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
      }
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

    // Sign token
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
    console.error("Verify OTP Route Error:", err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/login
// @desc    Auth user & get token (Login via password or social trigger)
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password, name, photo, department, year, bio } = req.body;

  try {
    const lowerEmail = email.toLowerCase();
    let user = await User.findOne({ email: lowerEmail });

    // If password is sent, we are doing a regular email/password login
    if (password) {
      if (!user) {
        return res.status(400).json({ msg: "Account not found. Please sign up first." });
      }
      
      if (!user.password) {
        return res.status(400).json({ msg: "This account was created via social login or OTP. Please log in using Google/GitHub or request an OTP to set your password." });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid email or password." });
      }
    } else {
      // Legacy on-the-fly login for demo / social redirects (when no password is provided)
      if (!user) {
        // Create a new user if not exists
        user = new User({
          name: name || lowerEmail.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
          email: lowerEmail,
          photo: photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          department: department || "",
          year: year || "",
          bio: bio || "VIT-AP Student. Connect to buy or sell items.",
          isAdmin: lowerEmail.includes("admin") || lowerEmail === "ramana.murthy@vitap.ac.in" || lowerEmail === "asrafpothuganti@gmail.com"
        });
        await user.save();
      } else if (lowerEmail === "asrafpothuganti@gmail.com" && !user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
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
  const { name, department, year, bio, photo, mobile } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (department) updateFields.department = department;
  if (year) updateFields.year = year;
  if (bio) updateFields.bio = bio;
  if (photo) updateFields.photo = photo;
  if (mobile !== undefined) updateFields.mobile = mobile;

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

// @route   PATCH api/auth/users/:id/badge
// @desc    Assign verification badge to user
// @access  Private (Admin only)
router.patch("/users/:id/badge", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied. Admin authorization required." });
    }

    const { badge } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { badge } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
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
        isAdmin: email.includes("admin") || email === "ramana.murthy@vitap.ac.in" || email === "asrafpothuganti@gmail.com"
      });
      await user.save();
    } else {
      // Update existing user's photo with Google's picture if currently default or empty
      const defaultPhoto = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
      if (picture && (!user.photo || user.photo === defaultPhoto)) {
        user.photo = picture;
        await user.save();
      }
      if (email === "asrafpothuganti@gmail.com" && !user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
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
        isAdmin: email.includes("admin") || email === "ramana.murthy@vitap.ac.in" || email === "asrafpothuganti@gmail.com"
      });
      await user.save();
    } else if (email === "asrafpothuganti@gmail.com" && !user.isAdmin) {
      user.isAdmin = true;
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
