// Recommendation Engine – calculates deterministic match scores
// Uses configurable weights and the skill-gap analyzer for transparency

import { analyzeSkillGap } from './skillGapAnalyzer.js';

// Default weighting – can be overridden by passing a config object
export const DEFAULT_WEIGHTS = {
  skillMatch: 0.40,
  interestMatch: 0.20,
  careerGoalMatch: 0.20,
  eligibilityMatch: 0.10,
  locationMatch: 0.10
};

// Helper – case-insensitive set creation
const toSet = arr => new Set((arr || []).map(v => (v || '').trim().toLowerCase()));

// Compute individual component scores (0-100)
function computeSkillScore(studentSkills, requiredSkills) {
  const { matchPercentage } = analyzeSkillGap(studentSkills, requiredSkills);
  return matchPercentage; // already 0-100
}

function computeInterestScore(studentInterests, opportunityInterests) {
  if (!opportunityInterests || opportunityInterests.length === 0) return 100; // no interest filter -> full match
  const studentSet = toSet(studentInterests);
  const oppSet = toSet(opportunityInterests);
  const intersect = [...oppSet].filter(i => studentSet.has(i));
  return Math.round((intersect.length / oppSet.size) * 100);
}

function computeCareerGoalScore(careerGoal, opportunityCareerField) {
  if (!careerGoal) return 0;
  return careerGoal.trim().toLowerCase() === (opportunityCareerField || '').trim().toLowerCase() ? 100 : 0;
}

function computeEligibilityScore(studentEligibility, opportunityEligibility) {
  // Simple rule: if opportunity eligibility is  Open or matches student eligibility string
  if (!opportunityEligibility) return 100;
  const opp = opportunityEligibility.trim().toLowerCase();
  const stu = (studentEligibility || '').trim().toLowerCase();
  return opp === 'open' || opp === stu ? 100 : 0;
}

function computeLocationScore(studentLocationPref, opportunityLocation) {
  if (!studentLocationPref) return 0;
  const pref = studentLocationPref.trim().toLowerCase();
  const loc = (opportunityLocation || '').trim().toLowerCase();
  // Remote preference matches Remote or any remote-friendly location
  if (pref === 'remote') {
    return loc === 'remote' ? 100 : 0;
  }
  // Exact match for onsite / specific city
  return pref === loc ? 100 : 0;
}

/**
 * Main function – returns ranked recommendations.
 * @param {Object} student – student profile object.
 * @param {Array} opportunities – array of opportunity objects.
 * @param {Object} [weights] – optional custom weighting (sums to 1).
 * @returns {Array} sorted list of recommendation objects.
 */
export function getRecommendations(student, opportunities, weights = DEFAULT_WEIGHTS) {
  if (!student || !Array.isArray(opportunities)) return [];

  const results = opportunities.map(opp => {
    // Skill analysis
    const skillInfo = analyzeSkillGap(student.skills, opp.requiredSkills);
    const skillScore = skillInfo.matchPercentage;

    const interestScore = computeInterestScore(student.interests, opp.interests);
    const careerScore = computeCareerGoalScore(student.careerGoal, opp.careerField);
    const eligibilityScore = computeEligibilityScore(student.eligibility, opp.eligibility);
    const locationScore = computeLocationScore(student.locationPreference, opp.location);

    // Weighted aggregate – each component already 0-100
    const matchScore = Math.round(
      skillScore * weights.skillMatch +
      interestScore * weights.interestMatch +
      careerScore * weights.careerGoalMatch +
      eligibilityScore * weights.eligibilityMatch +
      locationScore * weights.locationMatch
    );

    const reasons = [];
    if (skillScore >= 80) reasons.push('Strong skill match');
    else if (skillScore > 0) reasons.push('Partial skill match');
    else reasons.push('No matching skills');

    if (interestScore === 100) reasons.push('Matches your interests');
    if (careerScore === 100) reasons.push('Matches your career goal');
    if (eligibilityScore === 100) reasons.push('You are eligible');
    if (locationScore === 100) reasons.push('Preferred location matches');

    return {
      opportunityId: opp.id,
      title: opp.title,
      organization: opp.organization,
      matchScore,
      matchedSkills: skillInfo.matched,
      missingSkills: skillInfo.missing,
      reasons,
      // expose raw component scores for debugging if needed
      _details: {
        skillScore,
        interestScore,
        careerScore,
        eligibilityScore,
        locationScore
      }
    };
  });

  // Sort descending by matchScore, break ties by higher skillScore then experienceRequired
  results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (b._details.skillScore !== a._details.skillScore) return b._details.skillScore - a._details.skillScore;
    // fallback: lower experience required first
    const expA = opportunities.find(o => o.id === a.opportunityId).experienceRequired || 0;
    const expB = opportunities.find(o => o.id === b.opportunityId).experienceRequired || 0;
    return expA - expB;
  });

  return results;
}
