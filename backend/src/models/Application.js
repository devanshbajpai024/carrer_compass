const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: {
    type: String,
    enum: ['SAVED', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'],
    default: 'SAVED'
  },
  appliedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

applicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
