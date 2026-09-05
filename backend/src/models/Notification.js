const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['NEW_OPPORTUNITY', 'DEADLINE', 'RECOMMENDATION', 'APPLICATION_UPDATE', 'SKILL_GAP', 'GENERAL'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ studentId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
