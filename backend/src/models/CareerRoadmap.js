const mongoose = require('mongoose');

const roadmapNodeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['SKILL', 'PROJECT', 'OPPORTUNITY'] },
  status: { type: String, enum: ['completed', 'in progress', 'skill gap', 'not started'], default: 'not started' },
  description: { type: String }
}, { _id: false });

const careerRoadmapSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetCareer: { type: String, required: true },
  nodes: [roadmapNodeSchema],
  generatedAt: { type: Date, default: Date.now }
});

careerRoadmapSchema.index({ studentId: 1, targetCareer: 1 }, { unique: true });

module.exports = mongoose.model('CareerRoadmap', careerRoadmapSchema);
