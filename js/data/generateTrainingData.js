// generateTrainingData.js – creates a synthetic training dataset for the ML recommendation model
// Run with: node js/data/generateTrainingData.js
// Deterministic generation using a fixed seed.

const { writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');
const { opportunities } = require('./opportunities');
const { analyzeSkillGap } = require('../services/skillGapAnalyzer');

// Simple deterministic PRNG (mulberry32)
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = 123456; // fixed seed for reproducibility
const rand = mulberry32(SEED);
function choice(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ----- Pools derived from opportunities -----
const skillPool = Array.from(new Set(opportunities.flatMap((o) => o.requiredSkills)));
const interestPool = Array.from(new Set(opportunities.flatMap((o) => o.interests)));
const careerFieldPool = Array.from(new Set(opportunities.map((o) => o.careerField)));
const educationPool = ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BS Computer Science'];
const eligibilityPool = ['Open', 'Restricted'];
const locationPool = ['Remote', 'Onsite'];

// ----- Determine required student counts per split -----
const oppCount = opportunities.length; // 10 in current data
const TRAIN_ROWS = 1000;
const VAL_ROWS = 200;
const TEST_ROWS = 200;
const TRAIN_STUDENTS = Math.ceil(TRAIN_ROWS / oppCount); // 100
const VAL_STUDENTS = Math.ceil(VAL_ROWS / oppCount); // 20
const TEST_STUDENTS = Math.ceil(TEST_ROWS / oppCount); // 20
const TOTAL_STUDENTS = TRAIN_STUDENTS + VAL_STUDENTS + TEST_STUDENTS; // 140

let nextStudentId = 1;
function generateStudent() {
  // Choose a career goal that matches at least one opportunity
  const careerGoal = choice(careerFieldPool);
  const relatedOpp = opportunities.find((o) => o.careerField === careerGoal) || choice(opportunities);

  // Base skills come from the related opportunity, keep ~60% of them
  const baseSkills = relatedOpp.requiredSkills;
  const keptSkills = baseSkills.filter(() => rand() < 0.6);

  // Add a few random extra skills (0‑2)
  const extraSkills = [];
  const extraCount = Math.floor(rand() * 3);
  for (let i = 0; i < extraCount; i++) {
    const s = choice(skillPool);
    if (!keptSkills.includes(s) && !extraSkills.includes(s)) extraSkills.push(s);
  }
  const skills = keptSkills.concat(extraSkills);

  // Interests – often align with related opportunity, sometimes random
  const interests = [];
  if (rand() < 0.7) {
    interests.push(...relatedOpp.interests);
  } else {
    interests.push(choice(interestPool));
  }

  return {
    student_id: nextStudentId++,
    student_skills: skills,
    student_interests: Array.from(new Set(interests)),
    career_goal: careerGoal,
    education: choice(educationPool),
    experience: Math.floor(rand() * 5), // 0‑4 years
    location_preference: choice(locationPool),
    eligibility: choice(eligibilityPool),
  };
}

// ----- Create students -----
const students = [];
for (let i = 0; i < TOTAL_STUDENTS; i++) {
  students.push(generateStudent());
}

// ----- Derive features for a student‑opportunity pair -----
function computeDerived(student, opp) {
  const skillInfo = analyzeSkillGap(student.student_skills, opp.requiredSkills);
  const skill_match_percentage = skillInfo.matchPercentage;
  const number_of_matched_skills = skillInfo.matched.length;
  const number_of_missing_skills = skillInfo.missing.length;
  const interest_match = opp.interests.some((i) => student.student_interests.includes(i)) ? 1 : 0;
  const career_goal_match =
    student.career_goal.toLowerCase() === (opp.careerField || '').toLowerCase() ? 1 : 0;
  const eligibility_match = opp.eligibility === 'Open' || opp.eligibility.toLowerCase() === student.eligibility.toLowerCase() ? 1 : 0;
  const location_match =
    (student.location_preference === 'Remote' && opp.location === 'Remote') ||
    (student.location_preference !== 'Remote' && opp.location !== 'Remote' && student.location_preference === opp.location)
      ? 1
      : 0;
  const experience_match = student.experience >= opp.experienceRequired ? 1 : 0;
  return {
    skill_match_percentage,
    number_of_matched_skills,
    number_of_missing_skills,
    interest_match,
    career_goal_match,
    eligibility_match,
    location_match,
    experience_match,
  };
}

// ----- Labeling rules (same as previous version) -----
function labelFromFeatures(f) {
  // Ineligible candidates get label 0 immediately
  if (!f.eligibility_match) return 0;
  const expOk = f.experience_match === 1;
  if (f.skill_match_percentage >= 80 && f.interest_match && f.career_goal_match && expOk) return 4;
  if (f.skill_match_percentage >= 60 && f.interest_match + f.career_goal_match + expOk >= 2) return 3;
  if (f.skill_match_percentage >= 40) return 2;
  if (f.skill_match_percentage >= 20) return 1;
  return 0;
}

// ----- Split students into groups (student‑level) -----
const shuffledStudents = shuffle(students);
const trainStudents = shuffledStudents.slice(0, TRAIN_STUDENTS);
const valStudents = shuffledStudents.slice(TRAIN_STUDENTS, TRAIN_STUDENTS + VAL_STUDENTS);
const testStudents = shuffledStudents.slice(TRAIN_STUDENTS + VAL_STUDENTS);

function buildRows(studentSet) {
  const rows = [];
  studentSet.forEach((student) => {
    opportunities.forEach((opp) => {
      const derived = computeDerived(student, opp);
      const label = labelFromFeatures(derived);
      rows.push({
        student_id: student.student_id,
        student_skills: student.student_skills.join(';'),
        student_interests: student.student_interests.join(';'),
        career_goal: student.career_goal,
        education: student.education,
        experience: student.experience,
        location_preference: student.location_preference,
        eligibility: student.eligibility,
        opportunity_id: opp.id,
        required_skills: opp.requiredSkills.join(';'),
        opportunity_interests: opp.interests.join(';'),
        career_field: opp.careerField,
        opportunity_type: opp.category,
        opportunity_location: opp.location,
        experience_required: opp.experienceRequired,
        opportunity_eligibility: opp.eligibility,
        skill_match_percentage: derived.skill_match_percentage,
        number_of_matched_skills: derived.number_of_matched_skills,
        number_of_missing_skills: derived.number_of_missing_skills,
        interest_match: derived.interest_match,
        career_goal_match: derived.career_goal_match,
        eligibility_match: derived.eligibility_match,
        location_match: derived.location_match,
        experience_match: derived.experience_match,
        label,
      });
    });
  });
  return rows;
}

const trainRows = buildRows(trainStudents);
const valRows = buildRows(valStudents);
const testRows = buildRows(testStudents);

// ----- CSV helpers -----
function escapeCsv(v) {
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
function rowsToCsv(rows) {
  const header = Object.keys(rows[0]);
  const lines = rows.map((r) => header.map((c) => escapeCsv(r[c])).join(','));
  return header.join(',') + '\n' + lines.join('\n');
}

// ----- Write CSV files -----
const dataDir = path.resolve(__dirname, '../../data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
writeFileSync(path.join(dataDir, 'recommendation_training.csv'), rowsToCsv(trainRows), 'utf8');
writeFileSync(path.join(dataDir, 'recommendation_validation.csv'), rowsToCsv(valRows), 'utf8');
writeFileSync(path.join(dataDir, 'recommendation_test.csv'), rowsToCsv(testRows), 'utf8');

// ----- Metadata -----
const allLabels = [...trainRows, ...valRows, ...testRows].map((r) => r.label);
const classDist = {};
for (let i = 0; i <= 4; i++) classDist[i] = allLabels.filter((l) => l === i).length;
const metadata = {
  dataset_version: '1.0',
  random_seed: SEED,
  total_examples: allLabels.length,
  training_examples: trainRows.length,
  validation_examples: valRows.length,
  test_examples: testRows.length,
  unique_student_count: TOTAL_STUDENTS,
  opportunity_count: opportunities.length,
  feature_names: Object.keys(trainRows[0]),
  target_label: 'label',
  label_meanings: {
    '0': 'Poor Match',
    '1': 'Weak Match',
    '2': 'Moderate Match',
    '3': 'Good Match',
    '4': 'Excellent Match',
  },
  class_distribution: classDist,
  split_method: 'Student-level split (train/validation/test)',
  generation_method: 'Synthetic based on opportunity pool with expert rule labeling.',
  synthetic_data: true,
  notes: [
    'Student profiles are generated independently with realistic variation.',
    'Labels are derived from multi‑factor expert rules, not from the baseline recommendation score.',
  ],
};
writeFileSync(path.join(dataDir, 'dataset_metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');

// ----- Report -----
let report = '# Dataset Report\n\n';
report += `**Total examples:** ${metadata.total_examples}\n\n`;
report += `**Training:** ${metadata.training_examples}\n**Validation:** ${metadata.validation_examples}\n**Test:** ${metadata.test_examples}\n\n`;
report += '## Class distribution\n';
for (let i = 0; i <= 4; i++) {
  const cnt = classDist[i];
  const pct = ((cnt / metadata.total_examples) * 100).toFixed(2);
  report += `- Label ${i}: ${cnt} (${pct} %)\n`;
}
report += '\nGenerated on: ' + new Date().toISOString() + '\n';
writeFileSync(path.join(dataDir, 'DATASET_REPORT.md'), report, 'utf8');

console.log('Dataset generation complete.');
