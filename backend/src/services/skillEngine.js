const Opportunity = require('../models/Opportunity');

// A simple mock mapping of career goals to required skills for MVP purposes.
// In a real application, this might come from a dedicated Database collection or external API.
const CAREER_SKILLS_MAP = {
  'AI/ML Engineer': [
    { name: 'Python', required: 80 },
    { name: 'Machine Learning', required: 70 },
    { name: 'Deep Learning', required: 60 },
    { name: 'SQL', required: 50 },
    { name: 'Data Structures', required: 60 }
  ],
  'Data Scientist': [
    { name: 'Python', required: 80 },
    { name: 'Statistics', required: 70 },
    { name: 'SQL', required: 70 },
    { name: 'Machine Learning', required: 60 },
    { name: 'Data Visualization', required: 60 }
  ],
  'Software Developer': [
    { name: 'Data Structures', required: 80 },
    { name: 'Algorithms', required: 80 },
    { name: 'Java', required: 60 },
    { name: 'System Design', required: 50 }
  ],
  'Web Developer': [
    { name: 'HTML/CSS', required: 80 },
    { name: 'JavaScript', required: 80 },
    { name: 'React', required: 60 },
    { name: 'Node.js', required: 60 }
  ]
};

const analyzeGaps = (studentSkills, targetSkills) => {
  return targetSkills.map(target => {
    const studentSkill = studentSkills.find(s => s.name.toLowerCase() === target.name.toLowerCase());
    const current = studentSkill ? studentSkill.level : 0;
    const status = current >= target.required ? 'READY' : 'GAP';

    return {
      name: target.name,
      current,
      required: target.required,
      status
    };
  });
};

const getSkillGapsForCareer = (student) => {
  const gaps = [];
  if (student.careerGoals && student.careerGoals.length > 0) {
    student.careerGoals.forEach(goal => {
      // Find a matching key in our map
      const key = Object.keys(CAREER_SKILLS_MAP).find(k => k.toLowerCase() === goal.toLowerCase());
      if (key) {
        gaps.push({
          career: key,
          skills: analyzeGaps(student.skills || [], CAREER_SKILLS_MAP[key])
        });
      }
    });
  }
  return gaps;
};

module.exports = {
  getSkillGapsForCareer,
  CAREER_SKILLS_MAP
};
