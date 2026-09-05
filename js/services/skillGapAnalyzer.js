// Skill Gap Analyzer – pure function module
// Input: studentSkills (array of strings), requiredSkills (array of strings)
// Output: object containing matched, missing, matchPercentage, priorityMissing

export function analyzeSkillGap(studentSkills = [], requiredSkills = []) {
  // Normalize to lower-case for case-insensitive comparison
  const studentSet = new Set(studentSkills.map(s => s.trim().toLowerCase()));
  const requiredSet = new Set(requiredSkills.map(s => s.trim().toLowerCase()));

  const matched = [];
  const missing = [];

  requiredSet.forEach(req => {
    if (studentSet.has(req)) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const matchPercentage = requiredSet.size === 0 ? 100 : Math.round((matched.length / requiredSet.size) * 100);

  // Simple priority: missing skills that appear earlier in the required list are higher priority.
  const priorityMissing = missing.slice(); // keep order as defined in requiredSkills (already normalized order)

  // Return values preserving original casing (optional – here we return lower-case for simplicity)
  return {
    matched,
    missing,
    matchPercentage,
    priorityMissing
  };
}
