import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

// Default Mock Students
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
  },
  {
    id: "user-2",
    name: "Priyansh Verma",
    email: "priyansh.v2022@vitap.ac.in",
    department: "Computer Science (CSE)",
    year: "4th Year",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Final year student. Selling off hostel luggage, cycles, and calculators. Meet near MH-2 block.",
    rating: 4.6,
    reviewsCount: 9,
    itemsSold: 14,
    joinDate: "July 2022",
    isAdmin: false
  },
  {
    id: "user-3",
    name: "Anjali Nair",
    email: "anjali.nair2023@vitap.ac.in",
    department: "Electronics & Communication (ECE)",
    year: "3rd Year",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "ECE major. Often in SJT Lab blocks. Happy to help out junior students with books or project components.",
    rating: 4.9,
    reviewsCount: 16,
    itemsSold: 5,
    joinDate: "August 2023",
    isAdmin: false
  },
  {
    id: "user-4",
    name: "Sneha Reddy",
    email: "sneha.r2024@vitap.ac.in",
    department: "Mechanical Engineering",
    year: "2nd Year",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    bio: "Avid reader, mechanical geek. Hostel block LH-1. Text me on WhatsApp for quick responses.",
    rating: 4.5,
    reviewsCount: 4,
    itemsSold: 3,
    joinDate: "July 2024",
    isAdmin: false
  },
  {
    id: "user-admin",
    name: "Prof. Ramana Murthy",
    email: "ramana.murthy@vitap.ac.in",
    department: "Ecosystem Administrator",
    year: "Faculty / Admin",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    bio: "VITConnect Official Administrator. Reviewing spam, listings validation, and ecosystem health.",
    rating: 5.0,
    reviewsCount: 99,
    itemsSold: 0,
    joinDate: "January 2023",
    isAdmin: true
  }
];

// Default Mock Listings
const DEFAULT_LISTINGS = [
  {
    id: "list-1",
    name: "Herbalife Velo Cycle 26T",
    price: 2800,
    category: "Cycles",
    condition: "Good Condition",
    description: "Velo cycle in good running condition. Used for 2 years inside the VIT-AP campus. Brake pads were recently replaced. Has front basket and double stand. Ideal for riding between SJT and hostels.",
    sellerId: "user-2",
    sellerName: "Priyansh Verma",
    sellerDept: "Computer Science",
    sellerYear: "4th Year",
    sellerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    postedTime: "2 hours ago",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&auto=format&fit=crop&q=80"
    ],
    views: 42,
    saves: 8,
    isReported: false,
    reportReason: ""
  },
  {
    id: "list-2",
    name: "Casio Scientific Calculator fx-991EX",
    price: 850,
    category: "Calculators",
    condition: "Excellent",
    description: "Casio fx-991EX ClassWiz scientific calculator. Crucial for CSE/ECE math courses (Probability, Calculus, Linear Algebra). Excellent condition, solar battery works perfectly. Hard slide cover included.",
    sellerId: "user-3",
    sellerName: "Anjali Nair",
    sellerDept: "Electronics & Communication",
    sellerYear: "3rd Year",
    sellerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    postedTime: "5 hours ago",
    images: [
      "https://images.unsplash.com/photo-1627914801121-692a7e780447?w=600&auto=format&fit=crop&q=80"
    ],
    views: 89,
    saves: 15,
    isReported: false,
    reportReason: ""
  },
  {
    id: "list-3",
    name: "Lab Coat (Unisex, Size M)",
    price: 220,
    category: "Lab Equipment",
    condition: "Like New",
    description: "Standard white cotton lab coat with VIT-AP logo on pocket. Size Medium. Used only for Chemistry lab in 1st semester. Freshly washed, no chemical stains or tears.",
    sellerId: "user-4",
    sellerName: "Sneha Reddy",
    sellerDept: "Mechanical Engineering",
    sellerYear: "2nd Year",
    sellerPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    postedTime: "1 day ago",
    images: [
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&auto=format&fit=crop&q=80"
    ],
    views: 18,
    saves: 3,
    isReported: false,
    reportReason: ""
  },
  {
    id: "list-4",
    name: "Engineering Electromagnetics (Hayt)",
    price: 350,
    category: "Books",
    condition: "Fair",
    description: "Engineering Electromagnetics textbook by William H. Hayt Jr., 8th Edition. Standard syllabus textbook for ECE. A few highlights on Chapter 3 & 4, but binding is strong and pages are clean.",
    sellerId: "user-3",
    sellerName: "Anjali Nair",
    sellerDept: "Electronics & Communication",
    sellerYear: "3rd Year",
    sellerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    postedTime: "2 days ago",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80"
    ],
    views: 29,
    saves: 4,
    isReported: false,
    reportReason: ""
  },
  {
    id: "list-5",
    name: "Hostel Study Table LED Lamp",
    price: 400,
    category: "Hostel Items",
    condition: "Like New",
    description: "Rechargeable LED desk lamp with 3 brightness modes, touch control, and flexible neck. Features a small pen holder base. Battery lasts around 5 hours on full charge. Perfect for late-night exams.",
    sellerId: "user-4",
    sellerName: "Sneha Reddy",
    sellerDept: "Mechanical Engineering",
    sellerYear: "2nd Year",
    sellerPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    postedTime: "3 days ago",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80"
    ],
    views: 51,
    saves: 9,
    isReported: false,
    reportReason: ""
  },
  {
    id: "list-6",
    name: "Arduino UNO Starter Project Kit",
    price: 650,
    category: "Project Kits",
    condition: "Like New",
    description: "Complete Arduino Uno Starter kit for CSE/ECE workshops. Includes Arduino Uno board, breadboard, USB cables, 30+ jumper wires, LEDs, resistors, active buzzer, ultrasonic sensor, IR remote, and DHT11 temp sensor. Used for one project.",
    sellerId: "user-1",
    sellerName: "Rahul Sharma",
    sellerDept: "Computer Science & Engineering (CSE)",
    sellerYear: "3rd Year",
    sellerPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    postedTime: "4 days ago",
    images: [
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80"
    ],
    views: 65,
    saves: 11,
    isReported: false,
    reportReason: ""
  }
];

// Default Mock Requests
const DEFAULT_REQUESTS = [
  {
    id: "req-1",
    itemName: "Engineering Physics Lab Manual (1st Sem)",
    budget: 100,
    deadline: "This Week",
    description: "Looking for a written and signed Physics Lab manual from last year. Urgent, lab experiment check is on Friday.",
    requesterId: "user-4",
    requesterName: "Sneha Reddy",
    requesterDept: "Mechanical Engineering",
    requesterYear: "2nd Year",
    postedTime: "3 hours ago",
    saves: 2
  },
  {
    id: "req-2",
    itemName: "Gym Dumbbells Pair (5kg or 7.5kg)",
    budget: 900,
    deadline: "Next 2 Weeks",
    description: "Need a pair of rubber-coated or iron dumbbells. Hostel gym is usually crowded during evening hours, so looking to work out in my room in MH-2.",
    requesterId: "user-2",
    requesterName: "Priyansh Verma",
    requesterDept: "Computer Science",
    requesterYear: "4th Year",
    postedTime: "1 day ago",
    saves: 5
  },
  {
    id: "req-3",
    itemName: "Hostel Clothes Drying Stand",
    budget: 400,
    deadline: "End of month",
    description: "Looking for a foldable metal or plastic cloth drying rack. Easily portable so I can keep it inside room during rains.",
    requesterId: "user-3",
    requesterName: "Anjali Nair",
    requesterDept: "Electronics & Communication",
    requesterYear: "3rd Year",
    postedTime: "3 days ago",
    saves: 1
  }
];

// Default Mock Lost & Found
const DEFAULT_LOST_FOUND = [
  {
    id: "lf-1",
    name: "Boat Airdopes 141 (Cyan Blue Case)",
    type: "Lost",
    location: "SJT Block Ground Floor Cafeteria near CCD",
    date: "2026-06-15",
    description: "Lost the charging case of my Boat Airdopes. Cyan blue color. Has a small scratch near the charging port. Please return if found.",
    postedTime: "1 day ago",
    studentId: "user-4",
    studentName: "Sneha Reddy",
    resolved: false
  },
  {
    id: "lf-2",
    name: "Black Leather Wallet containing ID Card",
    type: "Found",
    location: "Central Library 3rd Floor study cubicles",
    date: "2026-06-16",
    description: "Found a black Men's wallet containing some money and a VIT-AP Student ID Card. I've handed it to the library reception, or you can message me here directly.",
    postedTime: "4 hours ago",
    studentId: "user-3",
    studentName: "Anjali Nair",
    resolved: false
  },
  {
    id: "lf-3",
    name: "Campus cycle key with a Red Marvel Keychain",
    type: "Lost",
    location: "Hostel MH-1 Cycle parking",
    date: "2026-06-14",
    description: "Lost a single silver cycle key attached to a circular red Captain America keychain. Most likely fell near MH-1 parking blocks.",
    postedTime: "2 days ago",
    studentId: "user-1",
    studentName: "Rahul Sharma",
    resolved: false
  }
];

// Initial Chats Setup
const DEFAULT_CHATS = [
  {
    id: "chat-user-2",
    recipientId: "user-2",
    recipientName: "Priyansh Verma",
    recipientPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    recipientDept: "Computer Science",
    recipientYear: "4th Year",
    productContext: {
      id: "list-1",
      name: "Herbalife Velo Cycle 26T",
      price: 2800,
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80"
    },
    messages: [
      { senderId: "user-2", text: "Hey! Are you interested in the cycle?", time: "Yesterday, 4:15 PM", read: true },
      { senderId: "user-1", text: "Yes, is the price negotiable?", time: "Yesterday, 4:30 PM", read: true },
      { senderId: "user-2", text: "I can do ₹2,500, but not below that. You can take a test ride at MH-1 parking tonight.", time: "Yesterday, 4:40 PM", read: true },
      { senderId: "user-1", text: "Awesome! I will come around 8:00 PM today.", time: "Yesterday, 5:00 PM", read: true }
    ],
    unreadCount: 0
  },
  {
    id: "chat-user-3",
    recipientId: "user-3",
    recipientName: "Anjali Nair",
    recipientPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    recipientDept: "Electronics & Communication",
    recipientYear: "3rd Year",
    productContext: {
      id: "list-2",
      name: "Casio Scientific Calculator fx-991EX",
      price: 850,
      image: "https://images.unsplash.com/photo-1627914801121-692a7e780447?w=600&auto=format&fit=crop&q=80"
    },
    messages: [
      { senderId: "user-1", text: "Hi Anjali, is the calculator still available?", time: "Today, 10:15 AM", read: true },
      { senderId: "user-3", text: "Yes! It is. I am in SJT block right now if you want to meet.", time: "Today, 10:20 AM", read: false }
    ],
    unreadCount: 1
  }
];

// Initial Notifications
const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "message",
    text: "Anjali Nair sent you a message about Casio Scientific Calculator fx-991EX.",
    time: "Today, 10:20 AM",
    read: false,
    link: "#messages"
  },
  {
    id: "notif-2",
    type: "save",
    text: "Your listing 'Arduino UNO Starter Project Kit' has been saved by 4 students.",
    time: "Yesterday",
    read: true,
    link: "#profile"
  },
  {
    id: "notif-3",
    type: "lostfound",
    text: "Priyansh Verma marked the Lost & Found post 'Black Leather Wallet' as resolved.",
    time: "2 days ago",
    read: true,
    link: "#lostfound"
  }
];

export const AppProvider = ({ children }) => {
  // Try loading initial state from localStorage safely, fallback to mock data
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("vitconnect_user");
      // Prevent parsing empty string or literal "null" as truthy
      if (stored && stored !== "null" && stored !== "") {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
    return MOCK_USERS[0]; // Default logged-in as Rahul
  });

  const [listings, setListings] = useState(() => {
    try {
      const stored = localStorage.getItem("vitconnect_listings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing listings:", e);
    }
    return DEFAULT_LISTINGS;
  });

  const [requests, setRequests] = useState(() => {
    try {
      const stored = localStorage.getItem("vitconnect_requests");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing requests:", e);
    }
    return DEFAULT_REQUESTS;
  });

  const [lostFound, setLostFound] = useState(() => {
    try {
      const stored = localStorage.getItem("vitconnect_lost_found");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing lostFound:", e);
    }
    return DEFAULT_LOST_FOUND;
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const stored = localStorage.getItem("vitconnect_chats");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing chats:", e);
    }
    return DEFAULT_CHATS;
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem("vitconnect_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing notifications:", e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [savedItems, setSavedItems] = useState(() => {
    try {
      const stored = localStorage.getItem("vitconnect_saved");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.listings) && Array.isArray(parsed.requests)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error parsing savedItems:", e);
    }
    return { listings: ["list-1", "list-2"], requests: ["req-1"] };
  });

  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem("vitconnect_users_list");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing users list:", e);
    }
    return MOCK_USERS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("vitconnect_user", currentUser ? JSON.stringify(currentUser) : "");
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("vitconnect_listings", JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem("vitconnect_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("vitconnect_lost_found", JSON.stringify(lostFound));
  }, [lostFound]);

  useEffect(() => {
    localStorage.setItem("vitconnect_chats", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("vitconnect_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("vitconnect_saved", JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    localStorage.setItem("vitconnect_users_list", JSON.stringify(users));
  }, [users]);

  // Actions
  const login = (email, password, method) => {
    // Standard mock authentication
    let matchedUser = users.find(u => u.email === email);
    if (!matchedUser) {
      // Create new student user on the fly
      matchedUser = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
        email: email,
        department: "Computer Science & Engineering (CSE)",
        year: "1st Year",
        photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        bio: "VIT-AP Student. Connect to buy or sell items.",
        rating: 5.0,
        reviewsCount: 0,
        itemsSold: 0,
        joinDate: "June 2026",
        isAdmin: email.includes("admin") || email === "ramana.murthy@vitap.ac.in"
      };
      setUsers(prev => [...prev, matchedUser]);
    }
    setCurrentUser(matchedUser);
    return matchedUser;
  };

  const loginWithGoogle = () => {
    const googleUser = {
      id: "user-google",
      name: "Aditya Vardhan",
      email: "aditya.vardhan2024@vitap.ac.in",
      department: "CSE - Artificial Intelligence",
      year: "2nd Year",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      bio: "Sophomore AI student at VIT-AP. Building gadgets and selling microcontrollers.",
      rating: 4.7,
      reviewsCount: 3,
      itemsSold: 2,
      joinDate: "August 2024",
      isAdmin: false
    };
    // Add to user pool
    if (!users.some(u => u.id === googleUser.id)) {
      setUsers(prev => [...prev, googleUser]);
    }
    setCurrentUser(googleUser);
    return googleUser;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addListing = (listingData) => {
    if (!currentUser) return;
    const newListing = {
      id: `list-${Date.now()}`,
      name: listingData.name,
      price: parseFloat(listingData.price) || 0,
      category: listingData.category,
      condition: listingData.condition,
      description: listingData.description,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerDept: currentUser.department,
      sellerYear: currentUser.year,
      sellerPhoto: currentUser.photo,
      postedTime: "Just now",
      images: listingData.images && listingData.images.length > 0 ? listingData.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
      views: 1,
      saves: 0,
      isReported: false,
      reportReason: ""
    };
    setListings(prev => [newListing, ...prev]);

    // Push system notifications to other users who might match interests (mock)
    addNotification({
      type: "match",
      text: `New item posted in ${listingData.category}: '${listingData.name}' - check it out!`,
      link: "#marketplace"
    });
  };

  const updateListing = (id, updatedListingData) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, ...updatedListingData } : item));
  };

  const deleteListing = (id) => {
    setListings(prev => prev.filter(item => item.id !== id));
    // Clear from saved wishlist
    setSavedItems(prev => ({
      ...prev,
      listings: prev.listings.filter(iId => iId !== id)
    }));
  };

  const addRequest = (requestData) => {
    if (!currentUser) return;
    const newReq = {
      id: `req-${Date.now()}`,
      itemName: requestData.itemName,
      budget: parseFloat(requestData.budget) || 0,
      deadline: requestData.deadline,
      description: requestData.description,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterDept: currentUser.department,
      requesterYear: currentUser.year,
      postedTime: "Just now",
      saves: 0
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const deleteRequest = (id) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    setSavedItems(prev => ({
      ...prev,
      requests: prev.requests.filter(rId => rId !== id)
    }));
  };

  const addLostFound = (lfData) => {
    if (!currentUser) return;
    const newLF = {
      id: `lf-${Date.now()}`,
      name: lfData.name,
      type: lfData.type,
      location: lfData.location,
      date: lfData.date,
      description: lfData.description,
      postedTime: "Just now",
      studentId: currentUser.id,
      studentName: currentUser.name,
      resolved: false
    };
    setLostFound(prev => [newLF, ...prev]);
  };

  const resolveLostFound = (id) => {
    setLostFound(prev => prev.map(item => item.id === id ? { ...item, resolved: true } : item));
  };

  const sendMessage = (recipientId, text, productContext = null) => {
    if (!currentUser) return;

    // Check if recipient is a valid user
    const recipientUser = users.find(u => u.id === recipientId);
    if (!recipientUser) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = `Today, ${timestamp}`;

    setConversations(prev => {
      // Check if conversation exists
      const existingIdx = prev.findIndex(chat => chat.recipientId === recipientId);
      const newMessage = {
        senderId: currentUser.id,
        text,
        time: todayStr,
        read: true
      };

      if (existingIdx > -1) {
        // Update existing chat
        const updated = [...prev];
        const chat = updated[existingIdx];
        chat.messages = [...chat.messages, newMessage];
        if (productContext) chat.productContext = productContext;
        // Move to top
        updated.splice(existingIdx, 1);
        return [chat, ...updated];
      } else {
        // Create new chat
        const newChat = {
          id: `chat-${recipientId}`,
          recipientId: recipientUser.id,
          recipientName: recipientUser.name,
          recipientPhoto: recipientUser.photo,
          recipientDept: recipientUser.department,
          recipientYear: recipientUser.year,
          productContext,
          messages: [newMessage],
          unreadCount: 0
        };
        return [newChat, ...prev];
      }
    });
  };

  const markChatAsRead = (recipientId) => {
    setConversations(prev => prev.map(chat => {
      if (chat.recipientId === recipientId) {
        return {
          ...chat,
          unreadCount: 0,
          messages: chat.messages.map(m => m.senderId !== currentUser?.id ? { ...m, read: true } : m)
        };
      }
      return chat;
    }));
  };

  const toggleSaveItem = (type, itemId) => {
    setSavedItems(prev => {
      const isSaved = prev[type].includes(itemId);
      const updatedList = isSaved
        ? prev[type].filter(id => id !== itemId)
        : [...prev[type], itemId];

      // If saved, update the listing saves count
      if (type === "listings") {
        setListings(lPrev => lPrev.map(item => {
          if (item.id === itemId) {
            return { ...item, saves: item.saves + (isSaved ? -1 : 1) };
          }
          return item;
        }));
      }

      return {
        ...prev,
        [type]: updatedList
      };
    });
  };

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

  const updateProfile = (profileData) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      ...profileData
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...profileData } : u));
  };

  const banUser = (userId) => {
    // Delete user's listings and ban them from users array
    setListings(prev => prev.filter(l => l.sellerId !== userId));
    setRequests(prev => prev.filter(r => r.requesterId !== userId));
    setLostFound(prev => prev.filter(lf => lf.studentId !== userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
    
    // If admin banned their own logged in user (unlikely but possible during testing)
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  const reportItem = (itemType, itemId, reason) => {
    if (itemType === "listings") {
      setListings(prev => prev.map(item => item.id === itemId ? { ...item, isReported: true, reportReason: reason } : item));
    }
    addNotification({
      type: "system",
      text: `Listing report submitted for validation. Reason: ${reason}`,
      link: "#profile"
    });
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
        logout,
        addListing,
        updateListing,
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
