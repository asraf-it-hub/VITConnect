export const formatRelativeTime = (createdAt, fallback) => {
  if (!createdAt) return fallback || "Just now";
  const date = new Date(createdAt);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return fallback || "Just now";
  }

  const now = new Date();
  const diffMs = now - date;
  
  // Handle server/client clock drift
  if (diffMs < 0) {
    return "Just now";
  }

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const formatNotificationTime = (notif) => {
  if (!notif) return "";
  
  let timestamp = notif.createdAt;
  if (!timestamp && notif.id && notif.id.startsWith("notif-")) {
    const parsed = parseInt(notif.id.replace("notif-", ""), 10);
    if (!isNaN(parsed)) {
      timestamp = parsed;
    }
  }

  if (!timestamp) {
    return notif.time || "";
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return notif.time || "";
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeStr}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeStr}`;
  } else {
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr}, ${timeStr}`;
  }
};

