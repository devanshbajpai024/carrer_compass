// Simple manual tests for recommendationEngine and skillGapAnalyzer
import { getRecommendations, DEFAULT_WEIGHTS } from '../services/recommendationEngine.js';
import { analyzeSkillGap } from '../services/skillGapAnalyzer.js';
import { mockStudent } from '../data/mockStudent.js';
import { opportunities } from '../data/opportunities.js';

function log(title, obj) { console.log('\n=== ' + title + ' ==='); console.log(JSON.stringify(obj, null, 2)); }

// 1. Strong match (student already defined) – should see high scores for related opps
log('All Recommendations (default weights)', getRecommendations(mockStudent, opportunities));

// 2. Partial match – modify student to miss some skills
const partialStudent = { ...mockStudent, skills: ['HTML', 'CSS'] };
log('Partial match student', getRecommendations(partialStudent, opportunities));

// 3. Poor match – change interests and career goal
const poorStudent = { ...mockStudent, interests: ['Data Analysis'], careerGoal: 'Data Scientist' };
log('Poor match student', getRecommendations(poorStudent, opportunities));

// 4. Different career goal – see ranking change
const devOpsStudent = { ...mockStudent, careerGoal: 'DevOps Engineer', interests: ['Infrastructure'] };
log('DevOps student', getRecommendations(devOpsStudent, opportunities));

// 5. Skill gap analysis directly
log('Skill gap for opportunity 1', analyzeSkillGap(mockStudent.skills, opportunities[0].requiredSkills));