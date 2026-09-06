const Notification = require('../models/Notification');

/**
 * Creates a notification for a student. Fire-and-forget — never throws.
 */
const createNotification = async (studentId, type, title, message, opportunityId = null) => {
  try {
    const doc = { studentId, type, title, message };
    if (opportunityId) doc.opportunityId = opportunityId;
    await Notification.create(doc);
  } catch (err) {
    console.error('createNotification failed:', err.message);
  }
};

module.exports = { createNotification };
