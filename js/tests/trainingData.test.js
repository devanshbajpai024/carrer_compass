// trainingData.test.js – validates the synthetic training dataset
// Run with: npm test (or node js/tests/trainingData.test.js)

import { strict as assert } from 'assert';
import { readFileSync } from 'fs';
import path from 'path';

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const values = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        values.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur);
    const obj = {};
    header.forEach((col, idx) => {
      obj[col] = values[idx];
    });
    return obj;
  });
  return { header, rows };
}

function loadCsv(fileName) {
  const filePath = path.resolve(__dirname, '../../data', fileName);
  const content = readFileSync(filePath, 'utf8');
  return parseCsv(content);
}

// Load datasets
const train = loadCsv('recommendation_training.csv');
const val = loadCsv('recommendation_validation.csv');
const test = loadCsv('recommendation_test.csv');

// 1. Basic sanity checks
assert.ok(train.rows.length > 0, 'Training set should contain rows');
assert.ok(val.rows.length > 0, 'Validation set should contain rows');
assert.ok(test.rows.length > 0, 'Test set should contain rows');

// 2. Column presence – ensure all expected columns exist
const expectedColumns = [
  'student_id', 'student_skills', 'student_interests', 'career_goal', 'education', 'experience',
  'location_preference', 'eligibility', 'opportunity_id', 'required_skills', 'opportunity_interests',
  'career_field', 'opportunity_type', 'opportunity_location', 'experience_required',
  'opportunity_eligibility', 'skill_match_percentage', 'number_of_matched_skills',
  'number_of_missing_skills', 'interest_match', 'career_goal_match',
  'eligibility_match', 'location_match', 'experience_match', 'label'
];
expectedColumns.forEach(col => {
  assert.ok(train.header.includes(col), `Training header missing column ${col}`);
  assert.ok(val.header.includes(col), `Validation header missing column ${col}`);
  assert.ok(test.header.includes(col), `Test header missing column ${col}`);
});

// 3. No student_id leakage across splits
function ids(set) { return new Set(set.map(r => r.student_id)); }
const trainIds = ids(train.rows);
const valIds = ids(val.rows);
const testIds = ids(test.rows);
const intersectTrainVal = [...trainIds].filter(id => valIds.has(id));
const intersectTrainTest = [...trainIds].filter(id => testIds.has(id));
const intersectValTest = [...valIds].filter(id => testIds.has(id));
assert.equal(intersectTrainVal.length, 0, 'Student IDs overlap between train and validation');
assert.equal(intersectTrainTest.length, 0, 'Student IDs overlap between train and test');
assert.equal(intersectValTest.length, 0, 'Student IDs overlap between validation and test');

// 4. Label distribution – at least one example of each class (0‑4) across the whole dataset
function gatherLabels(rows) {
  const set = new Set();
  rows.forEach(r => set.add(Number(r.label)));
  return set;
}
const allLabels = new Set([...train.rows, ...val.rows, ...test.rows].map(r => Number(r.label)));
for (let i = 0; i <= 4; i++) {
  assert.ok(allLabels.has(i), `Dataset should contain at least one example of label ${i}`);
}

// 5. Basic sanity on numeric fields – ensure they are numbers and within expected ranges
function checkNumeric(row, field, min, max) {
  const val = Number(row[field]);
  assert.ok(!Number.isNaN(val), `${field} should be numeric`);
  if (min !== undefined) assert.ok(val >= min, `${field} should be >= ${min}`);
  if (max !== undefined) assert.ok(val <= max, `${field} should be <= ${max}`);
}
[train, val, test].forEach(dataset => {
  dataset.rows.forEach(row => {
    checkNumeric(row, 'experience', 0);
    checkNumeric(row, 'experience_required', 0);
    checkNumeric(row, 'skill_match_percentage', 0, 100);
    checkNumeric(row, 'number_of_matched_skills', 0);
    checkNumeric(row, 'number_of_missing_skills', 0);
    checkNumeric(row, 'interest_match', 0, 1);
    checkNumeric(row, 'career_goal_match', 0, 1);
    checkNumeric(row, 'eligibility_match', 0, 1);
    checkNumeric(row, 'location_match', 0, 1);
    checkNumeric(row, 'experience_match', 0, 1);
    checkNumeric(row, 'label', 0, 4);
  });
});

console.log('All training data validation tests passed.');
