const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true, min: 0, max: 100 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  education: {
    college: { type: String },
    degree: { type: String },
    branch: { type: String },
    year: { type: Number },
    cgpa: { type: Number },
    graduationYear: { type: Number }
  },
  skills: [skillSchema],
  interests: [{ type: String }],
  careerGoals: [{ type: String }],
  certifications: [{ type: String }],
  projects: [{
    title: { type: String },
    description: { type: String },
    technologies: [{ type: String }]
  }],
  experience: [{
    title: { type: String },
    company: { type: String },
    description: { type: String },
    duration: { type: String }
  }],
  preferences: {
    locations: [{ type: String }],
    remote: { type: Boolean, default: false },
    preferredOpportunityTypes: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
