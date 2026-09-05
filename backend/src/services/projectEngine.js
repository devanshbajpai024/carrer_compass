const Project = require('../models/Project');

// Simple mockup engine: normally this would query a larger DB of projects based on missing skills
const getRecommendedProjects = async (student, skillGaps) => {
  // Extract names of missing skills
  const missingSkillNames = skillGaps.map(g => g.name.toLowerCase());
  
  // Find projects that teach at least one missing skill
  const allProjects = await Project.find();
  const recommended = [];

  for (const proj of allProjects) {
    let matchCount = 0;
    if (proj.learningOutcomes) {
      proj.learningOutcomes.forEach(outcome => {
        if (missingSkillNames.includes(outcome.toLowerCase())) {
          matchCount++;
        }
      });
    }
    
    // Also check if any career domains match
    let domainMatch = false;
    if (proj.careerDomains && student.careerGoals) {
      domainMatch = proj.careerDomains.some(d => 
        student.careerGoals.some(g => g.toLowerCase().includes(d.toLowerCase()))
      );
    }

    if (matchCount > 0 || domainMatch) {
      recommended.push({
        project: proj,
        reasons: [`This project helps you build: ${missingSkillNames.join(', ')}`]
      });
    }
  }

  return recommended;
};

module.exports = {
  getRecommendedProjects
};
