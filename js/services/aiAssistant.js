// Simple AI Assistant – placeholder implementation
import { getRecommendations } from './recommendationEngine.js';
export function answerQuestion(question, student, opportunities) {
  const q = question.toLowerCase();
  const recs = getRecommendations(student, opportunities);
  const fmtRec = function(rec) { return rec.title + ' (Score: ' + rec.matchScore + '%)'; };
  if (q.includes('opportunity') && q.includes('best')) {
    const top = recs.slice(0,3).map(fmtRec).join('\n');
    return 'Top recommendations for you:\n' + top;
  }
  if (q.includes('skill') && q.includes('missing')) {
    const top = recs[0];
    if (!top) return 'No opportunities found.';
    const missing = top.missingSkills.length ? top.missingSkills.map(s => '- ' + s).join('\n') : 'None – you match all required skills.';
    return 'For the best‑matched opportunity   + top.title +  , you are missing the following skills:\n' + missing;
  }
  if (q.includes('learn next')) {
    const top = recs[0];
    if (!top) return 'No opportunities to analyse.';
    const missing = top.missingSkills;
    if (missing.length === 0) return 'You already have all required skills for the top opportunity.';
    return 'You should learn ' + missing[0] + ' next to improve your match for   + top.title +  .';
  }
  if (q.includes('why') && q.includes('recommend')) {
    const top = recs[0];
    if (!top) return 'No recommendation available.';
    return '  + top.title +   was recommended because:\n- ' + top.reasons.join('\n- ');
  }
  if (q.includes('career') && q.includes('suitable')) {
    const fields = {};
    recs.forEach(function(r) {
      const opp = opportunities.find(function(o) { return o.id === r.opportunityId; });
      if (opp) {
        fields[opp.careerField] = (fields[opp.careerField] || 0) + r.matchScore;
      }
    });
    var bestField = null, bestScore = -1;
    for (var field in fields) {
      if (fields[field] > bestScore) { bestScore = fields[field]; bestField = field; }
    }
    return bestField ? 'Based on scores, the career field most aligned with you is ' + bestField + '.' : 'Unable to determine a career field.';
  }
  return  Im sorry, I couldnt understand the question. Try asking about opportunities missing skills or career advice.;
}