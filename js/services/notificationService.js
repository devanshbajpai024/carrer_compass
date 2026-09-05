/**
 * notificationService.js
 * In-app notification management.
 * Notifications are stored in localStorage.
 */

const NotificationService = (() => {
  const KEY = "soe_notifications";

  function getData() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveData(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function getUserNotifications(userId) {
    return getData()[userId] || [];
  }

  /**
   * add(userId, notification)
   * notification: { type, title, body, icon, link }
   */
  function add(userId, notification) {
    const data = getData();
    if (!data[userId]) data[userId] = [];
    data[userId].unshift({
      id: "notif_" + Date.now(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    });
    // Keep only 50 notifications per user
    if (data[userId].length > 50) data[userId] = data[userId].slice(0, 50);
    saveData(data);
  }

  function markRead(userId, notifId) {
    const data = getData();
    if (!data[userId]) return;
    const notif = data[userId].find((n) => n.id === notifId);
    if (notif) {
      notif.read = true;
      saveData(data);
    }
  }

  function markAllRead(userId) {
    const data = getData();
    if (!data[userId]) return;
    data[userId].forEach((n) => (n.read = true));
    saveData(data);
  }

  function getUnreadCount(userId) {
    return getUserNotifications(userId).filter((n) => !n.read).length;
  }

  function clear(userId) {
    const data = getData();
    data[userId] = [];
    saveData(data);
  }

  /**
   * generateRecommendationNotifications(userId, profile, topOpps)
   * Auto-generates notifications based on new high-match opportunities.
   */
  function generateRecommendationNotifications(userId, profile, topOpps) {
    const existing = getUserNotifications(userId).map((n) => n.opportunityId).filter(Boolean);
    const newHighMatch = topOpps.filter(
      (o) => o.recommendation?.score >= 80 && !existing.includes(o.id)
    );

    for (const opp of newHighMatch.slice(0, 3)) {
      add(userId, {
        type: "recommendation",
        icon: "🎯",
        title: `New ${opp.recommendation.score}% match!`,
        body: `${opp.title} at ${opp.organization} — perfect for your profile`,
        link: `opportunity.html?id=${opp.id}`,
        opportunityId: opp.id,
      });
    }

    // Deadline notifications
    const today = new Date();
    const soon = topOpps.filter((o) => {
      const d = new Date(o.deadline);
      const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= 5;
    });

    for (const opp of soon.slice(0, 2)) {
      const diff = Math.ceil((new Date(opp.deadline) - today) / (1000 * 60 * 60 * 24));
      if (!existing.includes("deadline_" + opp.id)) {
        add(userId, {
          type: "deadline",
          icon: "⏰",
          title: "Deadline approaching!",
          body: `${opp.title} closes in ${diff} day${diff === 1 ? "" : "s"}`,
          link: `opportunity.html?id=${opp.id}`,
          opportunityId: "deadline_" + opp.id,
        });
      }
    }
  }

  return {
    getUserNotifications,
    add,
    markRead,
    markAllRead,
    getUnreadCount,
    clear,
    generateRecommendationNotifications,
  };
})();
