// baselinePredict.js – generate baseline 0‑4 predictions for the test set
// Uses the same feature extraction as generateTrainingData.js and the
// documented labelFromFeatures() rules.

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync'); // built‑in sync parser (already a dependency in the repo)
const { opportunities } = require('../data/opportunities.js');
const { analyzeSkillGap } = require('../services/skillGapAnalyzer.js');

// ----------- Feature extraction (copied from generateTrainingData.js) ------------
function computeDerived(student, opp) {
  const skillInfo = analyzeSkillGap(student.student_skills, opp.requiredSkills);
  const skill_match_percentage = skillInfo.matchPercentage;
  const interest_match = opp.interests.some(i => student.student_interests.includes(i)) ? 1 : 0;
  const career_goal_match =
    student.career_goal.toLowerCase() === (opp.careerField || '').toLowerCase() ? 1 : 0;
  const eligibility_match = opp.eligibility === 'Open' || opp.eligibility.toLowerCase() === student.eligibility.toLowerCase() ? 1 : 0;
  const location_match =
    (student.location_preference === 'Remote' && opp.location === 'Remote') ||
    (student.location_preference !== 'Remote' && opp.location !== 'Remote' && student.location_preference === opp.location)
      ? 1
      : 0;
  const experience_match = student.experience >= opp.experienceRequired ? 1 : 0;
  return { skill_match_percentage, interest_match, career_goal_match, eligibility_match, location_match, experience_match };
}

// ------------------ 0‑4 label rules (identical to generateTrainingData.js) ------------------
function labelFromFeatures(f) {
  if (!f.eligibility_match) return 0;
  const expOk = f.experience_match === 1;
  if (f.skill_match_percentage >= 80 && f.interest_match && f.career_goal_match && expOk) return 4;
  if (f.skill_match_percentage >= 60 && f.interest_match + f.career_goal_match + expOk >= 2) return 3;
  if (f.skill_match_percentage >= 40) return 2;
  if (f.skill_match_percentage >= 20) return 1;
  return 0;
}

// ------------------ CSV handling ------------------
const testCsvPath = path.resolve(__dirname, '../../data/recommendation_test.csv');
const outCsvPath = path.resolve(__dirname, '../../data/baseline_predictions.csv');

const raw = fs.readFileSync(testCsvPath, 'utf8');
const records = csv.parse(raw, { columns: true, skip_empty_lines: true });

// each record already contains the flattened student and opportunity fields
// reconstruct minimal student / opportunity objects expected by computeDerived
function reconstructStudent(rec) {
  return {
    student_id: Number(rec.student_id),
    student_skills: rec.student_skills.split(';').filter(Boolean),
    student_interests: rec.student_interests.split(';').filter(Boolean),
    career_goal: rec.career_goal,
    education: rec.education,
    experience: Number(rec.experience),
    location_preference: rec.location_preference,
    eligibility: rec.eligibility,
  };
}

function reconstructOpportunity(rec) {
  // find the opportunity object by id – opportunities array contains the full definition
  const opp = opportunities.find(o => o.id === Number(rec.opportunity_id));
  if (!opp) throw new Error('Opportunity not found for id ' + rec.opportunity_id);
  return opp;
}

const outRows = [];
for (const rec of records) {
  const student = reconstructStudent(rec);
  const opp = reconstructOpportunity(rec);
  const derived = computeDerived(student, opp);
  const baseline_pred = labelFromFeatures(derived);
  outRows.push({
    student_id: rec.student_id,
    opportunity_id: rec.opportunity_id,
    baseline_prediction: baseline_pred,
    label: rec.label // ground‑truth
  });
}

// write CSV header + rows
const header = ['student_id','opportunity_id','baseline_prediction','label'];
const lines = [header.join(',')];
for (const r of outRows) {
  lines.push(`${r.student_id},${r.opportunity_id},${r.baseline_prediction},${r.label}`);
}
fs.writeFileSync(outCsvPath, lines.join('\n'), 'utf8');
console.log('Baseline predictions written to', outCsvPath, '(', outRows.length, 'rows)');
