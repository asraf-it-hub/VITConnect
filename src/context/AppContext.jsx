import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedItems, setSavedItems] = useState({ listings: [], requests: [] });
  const [users, setUsers] = useState([]);

  // Fetch initial profile if token exists
  const fetchProfile = async () => {
    const token = localStorage.getItem("vitconnect_token");
    if (!token) {
      // Default to Rahul Sharma for preview if no active session
      setCurrentUser(null);
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
      // Retrieve profile cache
      const cached = localStorage.getItem("vitconnect_user");
      if (cached) setCurrentUser(JSON.parse(cached));
    }
  };

  // Fetch Listings
  const fetchListings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/listings`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
        localStorage.setItem("vitconnect_listings", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to fetch listings, loading cache:", e);
      const cached = localStorage.getItem("vitconnect_listings");
      if (cached) setListings(JSON.parse(cached));
    }
  };

  // Fetch Requests
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        localStorage.setItem("vitconnect_requests", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to fetch requests, loading cache:", e);
      const cached = localStorage.getItem("vitconnect_requests");
      if (cached) setRequests(JSON.parse(cached));
    }
  };

  // Fetch Lost & Found
  const fetchLostFound = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lostfound`);
      if (res.ok) {
        const data = await res.json();
        setLostFound(data);
        localStorage.setItem("vitconnect_lost_found", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to fetch lostFound, loading cache:", e);
      const cached = localStorage.getItem("vitconnect_lost_found");
      if (cached) setLostFound(JSON.parse(cached));
    }
  };

  // Fetch Chat Conversations
  const fetchChats = async () => {
    if (!localStorage.getItem("vitconnect_token")) return;
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        localStorage.setItem("vitconnect_chats", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to fetch chats, loading cache:", e);
      const cached = localStorage.getItem("vitconnect_chats");
      if (cached) setConversations(JSON.parse(cached));
    }
  };

  // Fetch Users (for admin panel & profiles check)
  const fetchUsersList = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        localStorage.setItem("vitconnect_users_list", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to fetch users, loading cache:", e);
      const cached = localStorage.getItem("vitconnect_users_list");
      if (cached) setUsers(JSON.parse(cached));
    }
  };

  // Load everything on mount
  useEffect(() => {
    fetchProfile();
    fetchListings();
    fetchRequests();
    fetchLostFound();
    fetchUsersList();

    // Load saved wishlist items
    try {
      const stored = localStorage.getItem("vitconnect_saved");
      if (stored) setSavedItems(JSON.parse(stored));
    } catch (e) {
      console.error("Error reading saved wishlist:", e);
    }

    // Load local notifications
    try {
      const stored = localStorage.getItem("vitconnect_notifications");
      if (stored) setNotifications(JSON.parse(stored));
    } catch (e) {
      console.error("Error reading notifications:", e);
    }
  }, []);

  // Sync current user to local storage as cache
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("vitconnect_user", JSON.stringify(currentUser));
      fetchChats();
    } else {
      localStorage.removeItem("vitconnect_user");
      setConversations([]);
    }
  }, [currentUser]);

  // Sync notifications & savedItems
  useEffect(() => {
    localStorage.setItem("vitconnect_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("vitconnect_saved", JSON.stringify(savedItems));
  }, [savedItems]);

  // Authentication Actions
  const login = async (email, password, method) => {
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
    } catch (e) {
      console.error("Auth server error:", e);
      // Offline fallback login simulation
      const offlineUser = MOCK_USERS[0];
      setCurrentUser(offlineUser);
      return offlineUser;
    }
  };

  const loginWithGoogle = async () => {
    return login("aditya.vardhan2024@vitap.ac.in", "dummy-google", "google");
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
  };

  // Listings CRUD
  const addListing = async (listingData) => {
    try {
      const res = await fetch(`${API_URL}/api/listings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(listingData)
      });
      if (res.ok) {
        fetchListings();
      }
    } catch (e) {
      console.error("Failed to add listing:", e);
    }
  };

  const deleteListing = async (id) => {
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
      }
    } catch (e) {
      console.error("Failed to delete listing:", e);
    }
  };

  // Requests CRUD
  const addRequest = async (requestData) => {
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData)
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (e) {
      console.error("Failed to add request:", e);
    }
  };

  const deleteRequest = async (id) => {
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
      }
    } catch (e) {
      console.error("Failed to delete request:", e);
    }
  };

  // Lost & Found CRUD
  const addLostFound = async (lfData) => {
    try {
      const res = await fetch(`${API_URL}/api/lostfound`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(lfData)
      });
      if (res.ok) {
        fetchLostFound();
      }
    } catch (e) {
      console.error("Failed to add lost found:", e);
    }
  };

  const resolveLostFound = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/lostfound/${id}/resolve`, {
        method: "PATCH",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchLostFound();
      }
    } catch (e) {
      console.error("Failed to resolve item:", e);
    }
  };

  // Messaging Actions
  const sendMessage = async (recipientId, text, productContext = null) => {
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
    }
  };

  const markChatAsRead = async (recipientId) => {
    try {
      const res = await fetch(`${API_URL}/api/messages/read/${recipientId}`, {
        method: "PATCH",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        // Optimistically update counts locally
        setConversations(prev => prev.map(chat => {
          if (chat.recipientId === recipientId) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        }));
      }
    } catch (e) {
      console.error("Failed to mark chat read:", e);
    }
  };

  // Wishlist Actions
  const toggleSaveItem = (type, itemId) => {
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
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      }
    } catch (e) {
      console.error("Failed to update profile:", e);
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
        reportItem
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
