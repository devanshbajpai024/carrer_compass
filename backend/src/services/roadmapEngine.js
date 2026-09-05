const CareerRoadmap = require('../models/CareerRoadmap');
const { CAREER_SKILLS_MAP } = require('./skillEngine');

const generateRoadmapForCareer = async (student, targetCareer) => {
  // First, check if a roadmap already exists
  let roadmap = await CareerRoadmap.findOne({ studentId: student._id, targetCareer });
  
  const nodes = [];
  
  // Find required skills for this career
  const careerKey = Object.keys(CAREER_SKILLS_MAP).find(k => k.toLowerCase() === targetCareer.toLowerCase());
  
  if (careerKey) {
    const requiredSkills = CAREER_SKILLS_MAP[careerKey];
    
    requiredSkills.forEach(reqSkill => {
      const studentSkill = (student.skills || []).find(s => s.name.toLowerCase() === reqSkill.name.toLowerCase());
      
      let status = 'not started';
      if (studentSkill) {
        if (studentSkill.level >= reqSkill.required) status = 'completed';
        else if (studentSkill.level > 0) status = 'in progress';
        else status = 'skill gap';
      } else {
        status = 'skill gap';
      }

      nodes.push({
        title: `Learn ${reqSkill.name}`,
        type: 'SKILL',
        status,
        description: `Required level: ${reqSkill.required}`
      });
    });
  }

  // Add standard nodes
  nodes.push({
    title: 'Build Recommended Projects',
    type: 'PROJECT',
    status: 'not started',
    description: 'Apply your skills in real-world scenarios.'
  });
  
  nodes.push({
    title: 'Apply for Internships',
    type: 'OPPORTUNITY',
    status: 'not started',
    description: 'Get industry experience.'
  });

  if (roadmap) {
    // Update nodes
    roadmap.nodes = nodes;
    roadmap.generatedAt = new Date();
    await roadmap.save();
  } else {
    // Create new
    roadmap = await CareerRoadmap.create({
      studentId: student._id,
      targetCareer,
      nodes
    });
  }

  return roadmap;
};

module.exports = {
  generateRoadmapForCareer
};
