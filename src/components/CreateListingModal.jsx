import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { X, Upload, Image as ImageIcon, Check } from "lucide-react";

export default function CreateListingModal({ isOpen, onClose }) {
  const { addListing, currentUser } = useContext(AppContext);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("Excellent");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = ["Books", "Electronics", "Cycles", "Calculators", "Hostel Items", "Project Kits", "Lab Equipment", "Accessories", "Furniture", "Stationery"];
  const conditions = ["New", "Like New", "Excellent", "Good Condition", "Fair"];

  const handleImageUpload = (e) => {
    setError("");
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Process each file to base64 Data URL
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then(base64Urls => {
        setImages(prev => [...prev, ...base64Urls]);
        setIsUploading(false);
      })
      .catch(err => {
        setError("Error loading images. Please try again.");
        setIsUploading(false);
      });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("Please sign in first to sell an item.");
      return;
    }
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError("Please specify a valid selling price.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a brief description of the item.");
      return;
    }
    if (images.length === 0) {
      setError("Please upload at least one photo of the item.");
      return;
    }

    setIsSubmitting(true);
    const result = await addListing({
      name,
      price: parseFloat(price),
      category,
      condition,
      description,
      images
    });
    setIsSubmitting(false);

    if (result && !result.success) {
      setError(result.error || "Failed to list product.");
    } else {
      // Reset State & Close
      setName("");
      setPrice("");
      setCategory("Books");
      setCondition("Excellent");
      setDescription("");
      setImages([]);
      onClose();
    }
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--glass-bg)",
          padding: "28px",
          position: "relative",
          boxShadow: "var(--shadow-lg)"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
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

        <h2 style={{ fontFamily: "var(--font-family-heading)", fontSize: "1.4rem", fontWeight: "700", marginBottom: "6px" }}>
          Sell / List an Item
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
          Your listing will be instantly visible to other VIT-AP students.
        </p>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "16px",
            border: "1px solid rgba(239, 68, 68, 0.15)"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Item Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
              Product Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Casio fx-991EX Calculator"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* Price */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                Selling Price (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* Category */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                Category
              </label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
            {/* Condition */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                Condition
              </label>
              <select
                className="form-input"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
              Description & Deal Location *
            </label>
            <textarea
              placeholder="Provide specifications, age of item, usage details, and mention preferred hostels (e.g. MH-1, LH-2) for physical exchange."
              className="form-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "none" }}
            />
          </div>

          {/* Photo Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>
              Product Images *
            </label>
            
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {/* Image Preview Box */}
              {images.map((img, idx) => (
                <div key={idx} style={{ position: "relative", width: "70px", height: "70px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <img src={img} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      background: "rgba(239, 68, 68, 0.8)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      cursor: "pointer"
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {/* Upload Input Trigger */}
              <label style={{
                width: "70px",
                height: "70px",
                borderRadius: "8px",
                border: "2px dashed var(--border-color)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-secondary)",
                transition: "border-color var(--transition-fast)"
              }} className="glass-panel-hover">
                {isUploading ? (
                  <span style={{ fontSize: "0.7rem" }}>Loading..</span>
                ) : (
                  <>
                    <Upload size={16} />
                    <span style={{ fontSize: "0.6rem", marginTop: "4px" }}>Photos</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  disabled={isUploading}
                />
              </label>
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Upload up to 3 photos of the item. At least one image is required.
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "12px", borderRadius: "12px", marginTop: "8px", opacity: isSubmitting ? 0.7 : 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Listing Product..." : "List Product"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
