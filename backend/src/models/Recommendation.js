const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  matchScore: { type: Number, required: true }, // e.g., 92 for 92%
  breakdown: {
    skillsScore: { type: Number },
    careerScore: { type: Number },
    interestsScore: { type: Number },
    educationScore: { type: Number },
    experienceScore: { type: Number },
    preferencesScore: { type: Number }
  },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  reasons: [{ type: String }],
  generatedAt: { type: Date, default: Date.now }
});

recommendationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });
recommendationSchema.index({ studentId: 1, matchScore: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
