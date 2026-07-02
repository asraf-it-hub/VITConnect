import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, RefreshCw } from "lucide-react";

export default function AuthModal({ isOpen, onClose, message }) {
  const { login, sendOtp, loginWithGoogle, loginWithGoogleOauth, loginWithGithubOauth } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("signin"); // signin, signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useOtpForLogin, setUseOtpForLogin] = useState(false);
  
  // Signup details fields
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [mobile, setMobile] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // Poll for Google One-Tap SDK script loading
  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google?.accounts?.id) {
        setGoogleScriptLoaded(true);
      } else {
        setTimeout(checkGoogleLoaded, 100);
      }
    };
    checkGoogleLoaded();
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    try {
      const idToken = response.credential;
      await loginWithGoogleOauth(idToken);
      setIsLoading(false);
      handleClose();
    } catch (err) {
      console.error("GSI response error:", err);
      setError("Failed to verify Google Identity credentials");
      setIsLoading(false);
    }
  };

  // Timer logic for OTP Resend
  useEffect(() => {
    let interval;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setEmail("");
    setPassword("");
    setUseOtpForLogin(false);
    setName("");
    setDepartment("");
    setYear("");
    setBio("");
    setMobile("");
    setOtpSent(false);
    setOtpValue(["", "", "", "", "", ""]);
    setResendTimer(60);
    setError("");
    setIsLoading(false);
  };

  const validateEmail = (val) => {
    const lower = val.toLowerCase();
    return lower.endsWith("@vitap.ac.in") || lower.endsWith("@vitapstudent.ac.in") || lower.endsWith("@gmail.com");
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please use a valid student email (@vitap.ac.in) or Gmail (@gmail.com)");
      return;
    }

    if (activeTab === "signup") {
      if (!name.trim()) {
        setError("Name is required");
        return;
      }
      if (!department) {
        setError("Department is required");
        return;
      }
      if (!year) {
        setError("Graduation year is required");
        return;
      }
      if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        setError("Please enter a valid 10-digit mobile number");
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(email);
      setIsLoading(false);
      if (res.success) {
        setOtpSent(true);
        setResendTimer(60);
      } else {
        setError(res.error || "Failed to send OTP code.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("Could not connect to authentication server.");
    }
  };

  const handleGoogleLogin = () => {
    const emailInput = prompt("Enter student email for Google Demo Login:", "asraf.pothuganti2024@vitap.ac.in");
    if (!emailInput) return; // User cancelled
    
    if (!validateEmail(emailInput)) {
      setError("Please use a valid student email (@vitap.ac.in) or Gmail (@gmail.com)");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      loginWithGoogle(emailInput);
      setIsLoading(false);
      handleClose();
    }, 1200);
  };

  const handleGithubRedirect = () => {
    setIsLoading(true);
    const clientId = "Ov23li0nmFXpHXA2EhQZ";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  const handleOtpInput = (index, value) => {
    if (value.length > 1) return; // Keep it single digit
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);

    // Focus next input
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && otpValue[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please use a valid student email (@vitap.ac.in) or Gmail (@gmail.com)");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password, "password_mode");
      setIsLoading(false);
      if (res && res.success) {
        handleClose();
      } else {
        setError(res?.error || "Invalid email or password.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("Authentication connection error.");
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    const code = otpValue.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (activeTab === "signup") {
        res = await login(email, code, name, department, year, bio, mobile, "", password);
      } else {
        res = await login(email, code);
      }
      setIsLoading(false);
      if (res && res.success) {
        handleClose();
      } else {
        setError(res?.error || "Invalid or incorrect OTP code. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("Authentication failed. Please verify the code and try again.");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtpValue(["", "", "", "", "", ""]);
    setResendTimer(60);
    setError("");
    await handleSendOtp();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(10, 15, 30, 0.4)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--glass-bg)",
          padding: "32px 24px",
          position: "relative",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="btn btn-ghost"
          style={{
            position: "absolute",
            right: "16px",
            top: "16px",
            padding: "6px",
            borderRadius: "50%",
            border: "none"
          }}
        >
          <X size={18} />
        </button>

        {/* Brand details */}
        <div style={{ textAlign: "center", marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <img 
            src="/FinalLogo.png" 
            alt="VITConnect Logo" 
            style={{ height: "80px", width: "80px", borderRadius: "16px", objectFit: "cover", boxShadow: "var(--shadow-sm)" }} 
          />
          <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "1.6rem", color: "var(--accent)", margin: 0 }}>
            VITConnect
          </h2>
          {message ? (
            <div style={{
              background: "var(--accent-light)",
              color: "var(--accent)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginTop: "4px",
              fontWeight: "600",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              width: "100%"
            }}>
              {message}
            </div>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              VIT-AP Student Authentication
            </p>
          )}
        </div>

        {/* Tab switchers */}
        <div style={{
          display: "flex",
          background: "rgba(0,0,0,0.03)",
          padding: "4px",
          borderRadius: "10px",
          marginBottom: "24px",
          border: "1px solid var(--border-color)"
        }}>
          {[
            { id: "signin", label: "SIGN IN" },
            { id: "signup", label: "SIGN UP" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
                setOtpSent(false);
                setOtpValue(["", "", "", "", "", ""]);
              }}
              style={{
                flex: 1,
                border: "none",
                background: activeTab === tab.id ? "var(--bg-surface-solid)" : "transparent",
                color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
                padding: "8px 0",
                fontSize: "0.85rem",
                fontWeight: activeTab === tab.id ? "600" : "500",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                boxShadow: activeTab === tab.id ? "var(--shadow-sm)" : "none"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "16px",
            fontWeight: "500",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0"
          }}>
            <RefreshCw className="skeleton-pulse" size={40} style={{ color: "var(--accent)", animation: "spin 1.5s linear infinite" }} />
            <span style={{ marginTop: "16px", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500" }}>
              Verifying credentials...
            </span>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {!isLoading && (
          <AnimatePresence mode="wait">
            {/* Sign In View */}
            {activeTab === "signin" && (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}
              >
                {/* Social Login Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", margin: "0 0 4px 0" }}>
                    Sign in via Official Student Accounts
                  </p>
                  
                  <GoogleSignInButton
                    googleScriptLoaded={googleScriptLoaded}
                    handleGoogleLogin={handleGoogleLogin}
                    onCredentialResponse={handleGoogleCredentialResponse}
                  />

                  {/* GitHub Button */}
                  <button
                    type="button"
                    onClick={handleGithubRedirect}
                    className="btn"
                    style={{
                      width: "100%",
                      background: "#24292e",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      borderRadius: "12px",
                      boxShadow: "var(--shadow-sm)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#1b1f23"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#24292e"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    <span style={{ fontWeight: "600" }}>Continue with GitHub</span>
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "4px 0", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <span style={{ height: "1px", width: "40px", background: "var(--border-color)", marginRight: "8px" }}></span>
                  or
                  <span style={{ height: "1px", width: "40px", background: "var(--border-color)", marginLeft: "8px" }}></span>
                </div>

                {/* Email Section */}
                {!useOtpForLogin ? (
                  // Email & Password Form
                  <form onSubmit={handlePasswordLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                        Student Email / Gmail
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                          type="email"
                          placeholder="yourname@gmail.com"
                          className="form-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ paddingLeft: "38px" }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: "100%", marginTop: "4px", borderRadius: "12px" }}
                    >
                      Log In
                    </button>
                    
                    <div style={{ textAlign: "center", marginTop: "4px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setUseOtpForLogin(true);
                          setError("");
                          setOtpSent(false);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--accent)",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        Log In via Email OTP instead
                      </button>
                    </div>
                  </form>
                ) : (
                  // Email OTP Form
                  <>
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                            Student Email / Gmail
                          </label>
                          <div style={{ position: "relative" }}>
                            <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input
                              type="email"
                              placeholder="yourname@gmail.com"
                              className="form-input"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              style={{ paddingLeft: "38px" }}
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ width: "100%", marginTop: "4px", borderRadius: "12px" }}
                        >
                          Send Verification OTP
                        </button>
                        <div style={{ textAlign: "center", marginTop: "4px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setUseOtpForLogin(false);
                              setError("");
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--accent)",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                          >
                            Log In via Password instead
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                            6-Digit code sent to <strong>{email}</strong>
                          </p>
                          
                          {/* OTP Inputs */}
                          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                            {otpValue.map((digit, index) => (
                              <input
                                key={index}
                                id={`otp-input-${index}`}
                                type="text"
                                maxLength={1}
                                pattern="\d*"
                                value={digit}
                                onChange={(e) => handleOtpInput(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                style={{
                                  width: "42px",
                                  height: "48px",
                                  borderRadius: "10px",
                                  border: "1px solid var(--border-color)",
                                  background: "rgba(0,0,0,0.02)",
                                  textAlign: "center",
                                  fontSize: "1.3rem",
                                  fontWeight: "600",
                                  color: "var(--accent)",
                                  outline: "none",
                                  transition: "all var(--transition-fast)"
                                }}
                                className="form-input"
                              />
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%", borderRadius: "12px" }}
                          >
                            Verify & Sign In
                          </button>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Didn't receive code?</span>
                            <button
                              type="button"
                              onClick={handleResendOtp}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: resendTimer === 0 ? "var(--accent)" : "var(--text-muted)",
                                fontWeight: "600",
                                cursor: resendTimer === 0 ? "pointer" : "not-allowed"
                              }}
                            >
                              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </>
                )}

                <div style={{ textAlign: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("signup");
                        setError("");
                        setOtpSent(false);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent)",
                        fontWeight: "600",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline"
                      }}
                    >
                      Sign Up
                    </button>
                  </span>
                </div>
              </motion.div>
            )}

            {/* Sign Up View */}
            {activeTab === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{ width: "100%" }}
              >
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center", margin: "0 0 4px 0" }}>
                      Create student account with Gmail or College Email
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>Full Name</label>
                      <input
                        type="text"
                        placeholder="Aditya Vardhan"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ height: "38px" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="aditya.vardhan@gmail.com"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ height: "38px" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>Password (to login next time without OTP)</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ height: "38px" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>Department</label>
                        <select
                          className="form-input"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          required
                          style={{
                            height: "38px",
                            background: "var(--bg-surface-solid)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-color)",
                            padding: "0 10px",
                            borderRadius: "8px",
                            fontSize: "0.85rem"
                          }}
                        >
                          <option value="">Select Dept</option>
                          <option value="CSE">CSE</option>
                          <option value="ECE">ECE</option>
                          <option value="ME">Mech Eng</option>
                          <option value="Management">Business/MBA</option>
                          <option value="Law">VIT School of Law</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>Graduation Year</label>
                        <select
                          className="form-input"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          required
                          style={{
                            height: "38px",
                            background: "var(--bg-surface-solid)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-color)",
                            padding: "0 10px",
                            borderRadius: "8px",
                            fontSize: "0.85rem"
                          }}
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>Mobile (10 digits for WhatsApp)</label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        maxLength={10}
                        className="form-input"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        style={{ height: "38px" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>Short Bio</label>
                      <textarea
                        placeholder="I'm a computer science student interested in exchanging items on campus..."
                        className="form-input"
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        style={{ resize: "none", fontSize: "0.85rem", padding: "8px 10px" }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: "100%", marginTop: "4px", borderRadius: "12px", height: "42px" }}
                    >
                      Send Verification OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                        6-Digit code sent to <strong>{email}</strong>
                      </p>
                      
                      {/* OTP Inputs */}
                      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                        {otpValue.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-input-${index}`}
                            type="text"
                            maxLength={1}
                            pattern="\d*"
                            value={digit}
                            onChange={(e) => handleOtpInput(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            style={{
                              width: "42px",
                              height: "48px",
                              borderRadius: "10px",
                              border: "1px solid var(--border-color)",
                              background: "rgba(0,0,0,0.02)",
                              textAlign: "center",
                              fontSize: "1.3rem",
                              fontWeight: "600",
                              color: "var(--accent)",
                              outline: "none",
                              transition: "all var(--transition-fast)"
                            }}
                            className="form-input"
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", borderRadius: "12px" }}
                      >
                        Verify & Create Account
                      </button>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--text-muted)" }}>Didn't receive code?</span>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: resendTimer === 0 ? "var(--accent)" : "var(--text-muted)",
                            fontWeight: "600",
                            cursor: resendTimer === 0 ? "pointer" : "not-allowed"
                          }}
                        >
                          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("signin");
                        setError("");
                        setOtpSent(false);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent)",
                        fontWeight: "600",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline"
                      }}
                    >
                      Sign In
                    </button>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}

function GoogleSignInButton({ googleScriptLoaded, handleGoogleLogin, onCredentialResponse }) {
  useEffect(() => {
    if (googleScriptLoaded) {
      try {
        window.google.accounts.id.initialize({
          client_id: "775611308846-02o1afpdpqu8oulfdmrnitebqgq0lvri.apps.googleusercontent.com",
          callback: onCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const container = document.getElementById("google-signin-btn-container");
        if (container) {
          window.google.accounts.id.renderButton(
            container,
            {
              theme: "outline",
              size: "large",
              width: "372",
              text: "signin_with",
              shape: "rectangular"
            }
          );
        }
      } catch (err) {
        console.error("GSI initialize failed:", err);
      }
    }
  }, [googleScriptLoaded, onCredentialResponse]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div id="google-signin-btn-container" style={{ width: "100%", display: "flex", justifyContent: "center", minHeight: "44px" }}></div>
      {!googleScriptLoaded && (
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn"
          style={{
            width: "100%",
            background: "var(--bg-surface-solid)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            padding: "12px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            borderRadius: "12px",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span style={{ fontWeight: "600" }}>Continue with Google (Demo)</span>
        </button>
      )}
    </div>
  );
}
