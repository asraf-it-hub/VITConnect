import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const DEMO_TOKEN_PREFIX = "vitconnect-demo-session";

const readStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
};

const isDemoToken = (token) => token?.startsWith(DEMO_TOKEN_PREFIX);

// Default Mock Students for fallback
const MOCK_USERS = [
  {
    id: "user-1",
    name: "Rahul Sharma",
    email: "rahul.sharma2023@vitap.ac.in",
    department: "Computer Science & Engineering (CSE)",
    year: "3rd Year",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    bio: "CSE undergrad passionate about UI design and web dev. Live in MH-1 Hostel. Text me here or WhatsApp directly.",
    rating: 4.8,
    reviewsCount: 12,
    itemsSold: 8,
    joinDate: "July 2023",
    isAdmin: false
  }
];

// Helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem("vitconnect_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => readStorage("vitconnect_user", null));
  const [listings, setListings] = useState(() => readStorage("vitconnect_listings", []));
  const [requests, setRequests] = useState(() => readStorage("vitconnect_requests", []));
  const [lostFound, setLostFound] = useState(() => readStorage("vitconnect_lost_found", []));
  const [conversations, setConversations] = useState(() => readStorage("vitconnect_chats", []));
  const [notifications, setNotifications] = useState(() => readStorage("vitconnect_notifications", []));
  const [savedItems, setSavedItems] = useState(() => readStorage("vitconnect_saved", { listings: [], requests: [] }));
  const [users, setUsers] = useState(() => readStorage("vitconnect_users_list", []));
  const [orders, setOrders] = useState(() => readStorage("vitconnect_orders", []));

  // Global Modal & Verification states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");
  const [isProfilePromptOpen, setIsProfilePromptOpen] = useState(false);
  const [profileEditTriggered, setProfileEditTriggered] = useState(false);

  const openAuthModal = (msg = "Please login to proceed") => {
    setAuthModalMessage(msg);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalMessage("");
  };

  const openProfilePrompt = () => {
    setIsProfilePromptOpen(true);
  };

  const closeProfilePrompt = () => {
    setIsProfilePromptOpen(false);
  };

  const isProfileIncomplete = (user) => {
    if (!user) return false;
    return !user.department || !user.year || !user.mobile;
  };

  // Fetch initial profile if token exists
  const fetchProfile = async () => {
    const token = localStorage.getItem("vitconnect_token");
    const cached = readStorage("vitconnect_user", null);

    if (!token) {
      setCurrentUser(cached);
      return;
    }

    if (isDemoToken(token)) {
      setCurrentUser(cached || MOCK_USERS[0]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      } else {
        localStorage.removeItem("vitconnect_token");
        setCurrentUser(null);
      }
    } catch (e) {
      console.error("Failed to load live profile, checking cache:", e);
      if (cached) setCurrentUser(cached);
    }
  };

  // Fetch Listings
  const fetchListings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/listings`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
        writeStorage("vitconnect_listings", data);
      }
    } catch (e) {
      console.error("Failed to fetch listings, loading cache:", e);
      setListings(readStorage("vitconnect_listings", []));
    }
  };

  // Fetch Requests
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        writeStorage("vitconnect_requests", data);
      }
    } catch (e) {
      console.error("Failed to fetch requests, loading cache:", e);
      setRequests(readStorage("vitconnect_requests", []));
    }
  };

  // Fetch Lost & Found
  const fetchLostFound = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lostfound`);
      if (res.ok) {
        const data = await res.json();
        setLostFound(data);
        writeStorage("vitconnect_lost_found", data);
      }
    } catch (e) {
      console.error("Failed to fetch lostFound, loading cache:", e);
      setLostFound(readStorage("vitconnect_lost_found", []));
    }
  };

  // Fetch Chat Conversations
  const fetchChats = async () => {
    const token = localStorage.getItem("vitconnect_token");
    if (!token) return;
    if (isDemoToken(token)) {
      setConversations(readStorage("vitconnect_chats", []));
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        writeStorage("vitconnect_chats", data);
      }
    } catch (e) {
      console.error("Failed to fetch chats, loading cache:", e);
      setConversations(readStorage("vitconnect_chats", []));
    }
  };

  // Fetch Users (for admin panel & profiles check)
  const fetchUsersList = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        writeStorage("vitconnect_users_list", data);
      }
    } catch (e) {
      console.error("Failed to fetch users, loading cache:", e);
      setUsers(readStorage("vitconnect_users_list", []));
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("vitconnect_token");
    if (!token) return;
    if (isDemoToken(token)) {
      setOrders(readStorage("vitconnect_orders", []));
      return;
    }
    try {
      let mergedOrders = [];
      if (currentUser?.isAdmin) {
        const res = await fetch(`${API_URL}/api/orders/admin`, { headers: getAuthHeaders() });
        if (res.ok) {
          mergedOrders = await res.json();
        }
      } else {
        const [buyerRes, sellerRes] = await Promise.all([
          fetch(`${API_URL}/api/orders/buyer`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/api/orders/seller`, { headers: getAuthHeaders() })
        ]);
        let buyerOrders = [];
        let sellerOrders = [];
        if (buyerRes.ok) buyerOrders = await buyerRes.json();
        if (sellerRes.ok) sellerOrders = await sellerRes.json();
        const orderMap = new Map();
        buyerOrders.forEach(o => orderMap.set(o.id || o._id, o));
        sellerOrders.forEach(o => orderMap.set(o.id || o._id, o));
        mergedOrders = Array.from(orderMap.values());
      }
      mergedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(mergedOrders);
      writeStorage("vitconnect_orders", mergedOrders);
    } catch (e) {
      console.error("Failed to fetch orders, loading cache:", e);
      setOrders(readStorage("vitconnect_orders", []));
    }
  };

  // Load everything on mount
  useEffect(() => {
    fetchProfile();
    fetchListings();
    fetchRequests();
    fetchLostFound();
    fetchUsersList();
    fetchOrders();

    setSavedItems(readStorage("vitconnect_saved", { listings: [], requests: [] }));
    setNotifications(readStorage("vitconnect_notifications", []));
  }, []);

  // Sync current user to local storage as cache
  useEffect(() => {
    if (currentUser) {
      writeStorage("vitconnect_user", currentUser);
      fetchChats();
      fetchOrders();
    } else {
      localStorage.removeItem("vitconnect_user");
      setConversations([]);
      setOrders([]);
    }
  }, [currentUser]);

  // Poll chats/messages every 3 seconds to enable real-time replies
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      fetchChats();
      fetchOrders();
      fetchListings();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Sync notifications & savedItems
  useEffect(() => {
    writeStorage("vitconnect_notifications", notifications);
  }, [notifications]);

  useEffect(() => {
    writeStorage("vitconnect_saved", savedItems);
  }, [savedItems]);

  // Authentication Actions
  const login = async (email, password, method) => {
    const completeDemoLogin = () => {
      const offlineUser = {
        ...MOCK_USERS[0],
        id: readStorage("vitconnect_user", null)?.id || MOCK_USERS[0].id,
        email,
        name: email.split("@")[0].split(".").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
      };
      localStorage.setItem("vitconnect_token", `${DEMO_TOKEN_PREFIX}:${Date.now()}`);
      writeStorage("vitconnect_user", offlineUser);
      setCurrentUser(offlineUser);
      addNotification({
        type: "system",
        text: `Welcome back, ${offlineUser.name}! Your session will stay signed in on this browser.`
      });
      return offlineUser;
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("vitconnect_token", data.token);
        setCurrentUser(data.user);
        addNotification({
          type: "system",
          text: `Welcome back, ${data.user.name}! Login verified via ${method.toUpperCase()}.`
        });
        return data.user;
      }
      return completeDemoLogin();
    } catch (e) {
      console.error("Auth server error:", e);
      return completeDemoLogin();
    }
  };

  const loginWithGoogle = async (email = "aditya.vardhan2024@vitap.ac.in") => {
    return login(email, "dummy-google", "google");
  };

  const loginWithGoogleOauth = async (idToken) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("vitconnect_token", data.token);
        setCurrentUser(data.user);
        addNotification({
          type: "system",
          text: `Welcome, ${data.user.name}! Successfully signed in via Google.`
        });
        return data.user;
      } else {
        const errData = await res.json();
        console.error("Google Auth failed:", errData.msg);
        addNotification({
          type: "system",
          text: `Google Sign-In failed: ${errData.msg || "Invalid token"}`
        });
      }
    } catch (e) {
      console.error("Google Auth connection error:", e);
      addNotification({
        type: "system",
        text: "Could not connect to authentication server."
      });
    }
  };

  const loginWithGithubOauth = async (code) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("vitconnect_token", data.token);
        setCurrentUser(data.user);
        addNotification({
          type: "system",
          text: `Welcome, ${data.user.name}! Successfully signed in via GitHub.`
        });
        return data.user;
      } else {
        const errData = await res.json();
        console.error("GitHub Auth failed:", errData.msg);
        addNotification({
          type: "system",
          text: `GitHub Sign-In failed: ${errData.msg || "Invalid code"}`
        });
      }
    } catch (e) {
      console.error("GitHub Auth connection error:", e);
      addNotification({
        type: "system",
        text: "Could not connect to authentication server."
      });
    }
  };

  const logout = () => {
    localStorage.removeItem("vitconnect_token");
    localStorage.removeItem("vitconnect_user");
    setCurrentUser(null);
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  // Orders CRUD
  const reserveProduct = async (productId) => {
    const reserveLocal = () => {
      if (!currentUser) return { success: false, error: "Please sign in first." };
      let matchedListing = null;
      setListings(prev => {
        const updated = prev.map(item => {
          if (item.id === productId || item._id === productId) {
            if (item.sellerId === currentUser.id) return item;
            const updatedItem = {
              ...item,
              status: "Reserved",
              reservedBy: currentUser.id,
              reservedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString()
            };
            matchedListing = updatedItem;
            return updatedItem;
          }
          return item;
        });
        writeStorage("vitconnect_listings", updated);
        return updated;
      });
      if (matchedListing) {
        addNotification({
          type: "system",
          text: `You have successfully reserved "${matchedListing.name}" for 15 minutes. Submit payment to confirm.`
        });
        return { success: true, listing: matchedListing };
      }
      return { success: false, error: "Listing not found or you are the seller." };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return reserveLocal();
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/reserve/${productId}`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updatedListing = await res.json();
        fetchListings();
        return { success: true, listing: updatedListing };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || "Failed to reserve product." };
      }
    } catch (e) {
      console.error("Failed to reserve product:", e);
      return reserveLocal();
    }
  };

  const submitOrderPayment = async (orderData) => {
    const submitLocal = () => {
      if (!currentUser) return { success: false, error: "Please sign in first." };
      const listing = listings.find(item => item.id === orderData.productId || item._id === orderData.productId);
      if (!listing) return { success: false, error: "Listing not found." };

      const duplicate = orders.find(o => (o.productId === orderData.productId) && o.buyerId === currentUser.id && o.status === "Pending Payment Verification");
      if (duplicate) return { success: false, error: "You have already submitted a payment for this listing." };

      const newOrder = {
        id: `order-${Date.now()}`,
        _id: `order-${Date.now()}`,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        productId: listing.id || listing._id,
        productName: listing.name,
        amount: listing.price,
        transactionId: orderData.transactionId,
        screenshot: orderData.screenshot || "",
        status: "Pending Payment Verification",
        createdAt: new Date().toISOString()
      };

      setOrders(prev => {
        const updated = [newOrder, ...prev];
        writeStorage("vitconnect_orders", updated);
        return updated;
      });

      setListings(prev => {
        const updated = prev.map(item => {
          if (item.id === orderData.productId || item._id === orderData.productId) {
            return {
              ...item,
              status: "Reserved",
              reservedBy: currentUser.id,
              reservedUntil: null
            };
          }
          return item;
        });
        writeStorage("vitconnect_listings", updated);
        return updated;
      });

      addNotification({
        type: "system",
        text: `Payment submitted for "${listing.name}". Waiting for seller verification.`
      });

      return { success: true, order: newOrder };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return submitLocal();
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/submit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const order = await res.json();
        fetchOrders();
        fetchListings();
        return { success: true, order };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || "Failed to submit payment." };
      }
    } catch (e) {
      console.error("Failed to submit order payment:", e);
      return submitLocal();
    }
  };

  const approveOrderPayment = async (orderId) => {
    const approveLocal = () => {
      let matchedOrder = null;
      setOrders(prev => {
        const updated = prev.map(o => {
          if (o.id === orderId || o._id === orderId) {
            matchedOrder = { ...o, status: "Completed" };
            return matchedOrder;
          }
          return o;
        });
        writeStorage("vitconnect_orders", updated);
        return updated;
      });

      if (matchedOrder) {
        setListings(prev => {
          const updated = prev.map(item => {
            if (item.id === matchedOrder.productId || item._id === matchedOrder.productId) {
              return { ...item, status: "Sold" };
            }
            return item;
          });
          writeStorage("vitconnect_listings", updated);
          return updated;
        });

        // Cancel other pending orders for this product
        setOrders(prev => {
          const updated = prev.map(o => {
            if (o.productId === matchedOrder.productId && o.id !== orderId && o._id !== orderId && o.status === "Pending Payment Verification") {
              return { ...o, status: "Rejected" };
            }
            return o;
          });
          writeStorage("vitconnect_orders", updated);
          return updated;
        });

        // Increment itemsSold locally if seller is current user
        if (currentUser && matchedOrder.sellerId === currentUser.id) {
          const updatedUser = { ...currentUser, itemsSold: (currentUser.itemsSold || 0) + 1 };
          setCurrentUser(updatedUser);
          writeStorage("vitconnect_user", updatedUser);
        }

        // Local Notifications
        addNotification({
          type: "system",
          text: `Payment Approved! You sold "${matchedOrder.productName}" successfully.`,
          link: "#profile"
        });

        return { success: true };
      }
      return { success: false, error: "Order not found." };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return approveLocal();
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/approve`, {
        method: "PATCH",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchOrders();
        fetchListings();
        fetchProfile();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || "Failed to approve payment." };
      }
    } catch (e) {
      console.error("Failed to approve payment:", e);
      return approveLocal();
    }
  };

  const rejectOrderPayment = async (orderId) => {
    const rejectLocal = () => {
      let matchedOrder = null;
      setOrders(prev => {
        const updated = prev.map(o => {
          if (o.id === orderId || o._id === orderId) {
            matchedOrder = { ...o, status: "Rejected" };
            return matchedOrder;
          }
          return o;
        });
        writeStorage("vitconnect_orders", updated);
        return updated;
      });

      if (matchedOrder) {
        setListings(prev => {
          const updated = prev.map(item => {
            if (item.id === matchedOrder.productId || item._id === matchedOrder.productId) {
              return {
                ...item,
                status: "Available",
                reservedBy: null,
                reservedUntil: null
              };
            }
            return item;
          });
          writeStorage("vitconnect_listings", updated);
          return updated;
        });

        addNotification({
          type: "system",
          text: `Payment Rejected for "${matchedOrder.productName}". Product is available again.`,
          link: "#profile"
        });

        return { success: true };
      }
      return { success: false, error: "Order not found." };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return rejectLocal();
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/reject`, {
        method: "PATCH",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchOrders();
        fetchListings();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || "Failed to reject payment." };
      }
    } catch (e) {
      console.error("Failed to reject payment:", e);
      return rejectLocal();
    }
  };

  const deleteOrder = async (orderId) => {
    const deleteLocal = () => {
      const order = orders.find(o => o.id === orderId || o._id === orderId);
      if (order && order.status === "Pending Payment Verification") {
        setListings(prev => {
          const updated = prev.map(item => {
            if (item.id === order.productId || item._id === order.productId) {
              return {
                ...item,
                status: "Available",
                reservedBy: null,
                reservedUntil: null
              };
            }
            return item;
          });
          writeStorage("vitconnect_listings", updated);
          return updated;
        });
      }

      setOrders(prev => {
        const updated = prev.filter(o => o.id !== orderId && o._id !== orderId);
        writeStorage("vitconnect_orders", updated);
        return updated;
      });
      return { success: true };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return deleteLocal();
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/admin/${orderId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchOrders();
        fetchListings();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || "Failed to delete order." };
      }
    } catch (e) {
      console.error("Failed to delete order:", e);
      return deleteLocal();
    }
  };

  // Listings CRUD
  const addListing = async (listingData) => {
    const addLocalListing = () => {
      if (!currentUser) return { success: false, error: "Please sign in first." };
      const listing = {
        ...listingData,
        id: `listing-${Date.now()}`,
        _id: `listing-${Date.now()}`,
        sellerId: currentUser.id || currentUser._id,
        sellerName: currentUser.name,
        sellerDept: currentUser.department || "",
        sellerYear: currentUser.year || "",
        sellerPhoto: currentUser.photo,
        postedTime: "Just now",
        views: 1,
        saves: 0,
        isReported: false,
        reportReason: "",
        createdAt: new Date().toISOString()
      };
      setListings(prev => {
        const updated = [listing, ...prev];
        writeStorage("vitconnect_listings", updated);
        return updated;
      });
      return { success: true };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return addLocalListing();
    }

    try {
      const res = await fetch(`${API_URL}/api/listings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(listingData)
      });
      if (res.ok) {
        fetchListings();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Failed to add listing:", e);
      return addLocalListing();
    }
  };

  const deleteListing = async (id) => {
    const deleteLocalListing = () => {
      setListings(prev => {
        const updated = prev.filter(item => item.id !== id && item._id !== id);
        writeStorage("vitconnect_listings", updated);
        return updated;
      });
      setSavedItems(prev => ({
        ...prev,
        listings: prev.listings.filter(iId => iId !== id)
      }));
      return { success: true };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return deleteLocalListing();
    }

    try {
      const res = await fetch(`${API_URL}/api/listings/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchListings();
        // Clear from saved wishlist
        setSavedItems(prev => ({
          ...prev,
          listings: prev.listings.filter(iId => iId !== id)
        }));
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Failed to delete listing:", e);
      return deleteLocalListing();
    }
  };

  // Requests CRUD
  const addRequest = async (requestData) => {
    const addLocalRequest = () => {
      if (!currentUser) return { success: false, error: "Please sign in first." };
      const requestId = `request-${Date.now()}`;
      const request = {
        ...requestData,
        id: requestId,
        _id: requestId,
        requesterId: currentUser.id || currentUser._id,
        requesterName: currentUser.name,
        requesterDept: currentUser.department || "",
        requesterYear: currentUser.year || "",
        postedTime: "Just now",
        saves: 0,
        createdAt: new Date().toISOString()
      };
      setRequests(prev => {
        const updated = [request, ...prev];
        writeStorage("vitconnect_requests", updated);
        return updated;
      });
      return { success: true };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return addLocalRequest();
    }

    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData)
      });
      if (res.ok) {
        fetchRequests();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Failed to add request:", e);
      return addLocalRequest();
    }
  };

  const deleteRequest = async (id) => {
    const deleteLocalRequest = () => {
      setRequests(prev => {
        const updated = prev.filter(req => req.id !== id && req._id !== id);
        writeStorage("vitconnect_requests", updated);
        return updated;
      });
      setSavedItems(prev => ({
        ...prev,
        requests: prev.requests.filter(rId => rId !== id)
      }));
      return { success: true };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return deleteLocalRequest();
    }

    try {
      const res = await fetch(`${API_URL}/api/requests/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchRequests();
        setSavedItems(prev => ({
          ...prev,
          requests: prev.requests.filter(rId => rId !== id)
        }));
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Failed to delete request:", e);
      return deleteLocalRequest();
    }
  };

  // Lost & Found CRUD
  const addLostFound = async (lfData) => {
    const addLocalLostFound = () => {
      if (!currentUser) return { success: false, error: "Please sign in first." };
      const reportId = `lostfound-${Date.now()}`;
      const report = {
        ...lfData,
        id: reportId,
        _id: reportId,
        studentId: currentUser.id || currentUser._id,
        studentName: currentUser.name,
        postedTime: "Just now",
        resolved: false,
        createdAt: new Date().toISOString()
      };
      setLostFound(prev => {
        const updated = [report, ...prev];
        writeStorage("vitconnect_lost_found", updated);
        return updated;
      });
      return { success: true };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return addLocalLostFound();
    }

    try {
      const res = await fetch(`${API_URL}/api/lostfound`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(lfData)
      });
      if (res.ok) {
        fetchLostFound();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Failed to add lost found:", e);
      return addLocalLostFound();
    }
  };

  const resolveLostFound = async (id) => {
    const resolveLocalLostFound = () => {
      setLostFound(prev => {
        const updated = prev.map(item => (
          item.id === id || item._id === id ? { ...item, resolved: true } : item
        ));
        writeStorage("vitconnect_lost_found", updated);
        return updated;
      });
      return { success: true };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return resolveLocalLostFound();
    }

    try {
      const res = await fetch(`${API_URL}/api/lostfound/${id}/resolve`, {
        method: "PATCH",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchLostFound();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Failed to resolve item:", e);
      return resolveLocalLostFound();
    }
  };

  // Messaging Actions
  const sendMessage = async (recipientId, text, productContext = null) => {
    const sendLocalMessage = () => {
      if (!currentUser) return;
      const message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id || currentUser._id,
        text,
        productContext,
        createdAt: new Date().toISOString()
      };
      setConversations(prev => {
        const existing = prev.find(chat => chat.recipientId === recipientId);
        const recipientName = productContext?.sellerName || productContext?.requesterName || "Student";
        const updated = existing
          ? prev.map(chat => chat.recipientId === recipientId ? { ...chat, messages: [...(chat.messages || []), message], lastMessage: text } : chat)
          : [{ recipientId, recipientName, messages: [message], lastMessage: text, unreadCount: 0 }, ...prev];
        writeStorage("vitconnect_chats", updated);
        return updated;
      });
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      sendLocalMessage();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipientId, text, productContext })
      });
      if (res.ok) {
        fetchChats();
      }
    } catch (e) {
      console.error("Failed to send message:", e);
      sendLocalMessage();
    }
  };

  const markChatAsRead = async (recipientId) => {
    const markLocalChatAsRead = () => {
      setConversations(prev => {
        const updated = prev.map(chat => (
          chat.recipientId === recipientId ? { ...chat, unreadCount: 0 } : chat
        ));
        writeStorage("vitconnect_chats", updated);
        return updated;
      });
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      markLocalChatAsRead();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/messages/read/${recipientId}`, {
        method: "PATCH",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        markLocalChatAsRead();
      }
    } catch (e) {
      console.error("Failed to mark chat read:", e);
      markLocalChatAsRead();
    }
  };

  // Wishlist Actions
  const toggleSaveItem = (type, itemId) => {
    if (!currentUser) {
      openAuthModal("Please login to proceed");
      return;
    }
    setSavedItems(prev => {
      const list = prev[type] || [];
      const isSaved = list.includes(itemId);
      const updatedList = isSaved
        ? list.filter(id => id !== itemId)
        : [...list, itemId];

      return {
        ...prev,
        [type]: updatedList
      };
    });
  };

  // Notifications Actions (Local)
  const addNotification = (notifData) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: notifData.type || "system",
      text: notifData.text,
      time: `Today, ${timestamp}`,
      createdAt: Date.now(),
      read: false,
      link: notifData.link || "#"
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // User Profile Settings
  const updateProfile = async (profileData) => {
    const updateLocalProfile = () => {
      if (!currentUser) return { success: false, error: "Please sign in first." };
      const user = { ...currentUser, ...profileData };
      setCurrentUser(user);
      writeStorage("vitconnect_user", user);
      setUsers(prev => {
        const userId = user.id || user._id;
        const hasUser = prev.some(item => (item.id || item._id) === userId);
        const updated = hasUser
          ? prev.map(item => (item.id || item._id) === userId ? user : item)
          : [user, ...prev];
        writeStorage("vitconnect_users_list", updated);
        return updated;
      });
      return { success: true };
    };

    if (isDemoToken(localStorage.getItem("vitconnect_token"))) {
      return updateLocalProfile();
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.msg || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Failed to update profile:", e);
      return updateLocalProfile();
    }
  };

  // Admin Actions
  const banUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchUsersList();
        fetchListings();
        fetchRequests();
      }
    } catch (e) {
      console.error("Failed to ban user:", e);
    }
  };

  const assignUserBadge = async (userId, badge) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${userId}/badge`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ badge })
      });
      if (res.ok) {
        fetchUsersList();
      }
    } catch (e) {
      console.error("Failed to assign badge:", e);
    }
  };

  const reportItem = async (itemType, itemId, reason) => {
    if (itemType !== "listings") return;
    try {
      const res = await fetch(`${API_URL}/api/listings/${itemId}/report`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        fetchListings();
        addNotification({
          type: "system",
          text: `Listing report submitted for validation. Reason: ${reason}`
        });
      }
    } catch (e) {
      console.error("Failed to report item:", e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        listings,
        requests,
        lostFound,
        conversations,
        notifications,
        savedItems,
        users,
        orders,
        login,
        loginWithGoogle,
        loginWithGoogleOauth,
        loginWithGithubOauth,
        logout,
        addListing,
        deleteListing,
        addRequest,
        deleteRequest,
        addLostFound,
        resolveLostFound,
        sendMessage,
        markChatAsRead,
        toggleSaveItem,
        addNotification,
        clearNotifications,
        updateProfile,
        banUser,
        assignUserBadge,
        reportItem,
        fetchOrders,
        reserveProduct,
        submitOrderPayment,
        approveOrderPayment,
        rejectOrderPayment,
        deleteOrder,
        isAuthModalOpen,
        authModalMessage,
        isProfilePromptOpen,
        profileEditTriggered,
        openAuthModal,
        closeAuthModal,
        openProfilePrompt,
        closeProfilePrompt,
        isProfileIncomplete,
        setProfileEditTriggered
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
