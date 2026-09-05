const mongoose = require('mongoose');

const skillReqSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  importance: { type: String, enum: ['required', 'preferred'], required: true }
}, { _id: false });

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['INTERNSHIP', 'JOB', 'HACKATHON', 'COMPETITION', 'SCHOLARSHIP', 'WORKSHOP', 'PROJECT', 'FELLOWSHIP', 'OTHER'],
    required: true
  },
  organization: { type: String, required: true },
  skills: [skillReqSchema],
  eligibility: {
    degrees: [{ type: String }],
    branches: [{ type: String }],
    minimumYear: { type: Number },
    maximumYear: { type: Number },
    minimumCGPA: { type: Number }
  },
  careerDomains: [{ type: String }],
  location: { type: String },
  remote: { type: Boolean, default: false },
  applicationUrl: { type: String },
  deadline: { type: Date },
  stipend: { type: String },
  tags: [{ type: String }],
  source: { type: String },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'CLOSED'], default: 'ACTIVE' }
}, { timestamps: true });

// Add indexes for efficient querying
opportunitySchema.index({ type: 1 });
opportunitySchema.index({ deadline: 1 });
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ 'skills.skill': 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
