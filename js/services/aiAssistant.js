/**
 * aiAssistant.js
 * Mock AI assistant service.
 * Provides intelligent, profile-aware responses without an external API.
 *
 * TO CONNECT A REAL LLM:
 *   Replace the `generateResponse()` function body with a fetch() to your
 *   backend proxy endpoint (e.g. /api/chat). Never put API keys here.
 */

const AIAssistant = (() => {

  // ─── Intent detection ─────────────────────────────────────────────────────
  function detectIntent(message) {
    const m = message.toLowerCase();
    if (m.match(/internship|intern/)) return "find_internship";
    if (m.match(/hackathon|hack/)) return "find_hackathon";
    if (m.match(/scholarship/)) return "find_scholarship";
    if (m.match(/competition|contest/)) return "find_competition";
    if (m.match(/research/)) return "find_research";
    if (m.match(/course|learn|tutorial/)) return "find_course";
    if (m.match(/freelance|remote work|gig/)) return "find_freelance";
    if (m.match(/skill gap|missing skill|should i learn|what skill/)) return "skill_gap";
    if (m.match(/profile|improve.*profile|complete.*profile/)) return "profile_advice";
    if (m.match(/deadline|due.*date|closing.*soon/)) return "deadlines";
    if (m.match(/recommend|best.*for me|suit.*me|match/)) return "recommendations";
    if (m.match(/apply.*first|priority|which.*first/)) return "apply_order";
    if (m.match(/why.*recommend|reason|why.*match/)) return "explain_rec";
    if (m.match(/hello|hi|hey|hiya|howdy/)) return "greeting";
    if (m.match(/help|what can you|capabilities/)) return "help";
    return "general";
  }

  // ─── Extract skill/domain from message ────────────────────────────────────
  function extractKeyword(message) {
    const skills = [
      "python", "javascript", "react", "machine learning", "deep learning",
      "java", "c++", "sql", "node.js", "flutter", "kotlin", "ai", "blockchain",
      "cybersecurity", "cloud", "devops", "figma", "ui/ux", "data science",
    ];
    const m = message.toLowerCase();
    return skills.find((s) => m.includes(s)) || null;
  }

  // ─── Response generators ──────────────────────────────────────────────────
  function generateGreeting(profile) {
    const name = profile?.name?.split(" ")[0] || "there";
    return `Hey ${name}! 👋 I'm Opportunity AI, your personal career assistant. I can help you:
- **Find internships, hackathons, scholarships, and more** matching your skills
- **Explain why** a specific opportunity was recommended
- **Identify skill gaps** for your career goal
- **Prioritize** which opportunities to apply to first
- **Remind you** about upcoming deadlines

What would you like to explore today?`;
  }

  function generateHelp() {
    return `Here's what you can ask me:

🔍 **Find opportunities:**
- "Find internships for Python developers"
- "Which hackathons are suitable for me?"
- "Show me remote research opportunities"

📊 **Understand recommendations:**
- "Why are these opportunities recommended for me?"
- "Which opportunity should I apply to first?"

🎯 **Skill development:**
- "What skills should I learn for AI internships?"
- "Show my skill gap for Data Scientist"

⏰ **Deadlines:**
- "Show opportunities with deadlines this week"
- "What's closing soon?"

💡 **Profile:**
- "How can I improve my profile?"
- "What's my profile completion score?"`;
  }

  function generateFindOpportunities(category, keyword, profile) {
    const allOpps = OPPORTUNITIES;
    let filtered = allOpps;

    if (category) {
      const catMap = {
        find_internship: "Internship",
        find_hackathon: "Hackathon",
        find_scholarship: "Scholarship",
        find_competition: "Competition",
        find_research: "Research",
        find_course: "Course",
        find_freelance: "Freelance",
      };
      const cat = catMap[category];
      if (cat) filtered = filtered.filter((o) => o.category === cat);
    }

    if (keyword) {
      filtered = filtered.filter((o) =>
        (o.requiredSkills || []).some((s) => s.toLowerCase().includes(keyword)) ||
        (o.preferredSkills || []).some((s) => s.toLowerCase().includes(keyword)) ||
        o.domain.toLowerCase().includes(keyword) ||
        (o.tags || []).some((t) => t.toLowerCase().includes(keyword))
      );
    }

    // Score and rank if profile available
    if (profile) {
      filtered = RecommendationEngine.rank(profile, filtered, { includeIneligible: true }).slice(0, 5);
    } else {
      filtered = filtered.slice(0, 5);
    }

    if (filtered.length === 0) {
      return `I couldn't find ${category ? "any " + category.replace("find_", "") + "s" : "opportunities"} matching that criteria. Try broadening your search or adding more skills to your profile.`;
    }

    const catName = category ? category.replace("find_", "").replace("_", " ") + "s" : "opportunities";
    let response = `Here are the top ${catName}${keyword ? " for **" + keyword + "**" : ""}${profile ? " based on your profile" : ""}:\n\n`;

    filtered.forEach((o, i) => {
      const score = o.recommendation?.score;
      response += `**${i + 1}. ${o.title}** — ${o.organization}\n`;
      if (score !== undefined) response += `   📊 ${score}% match | `;
      response += `${o.mode} | `;
      response += o.stipend ? `💰 ${o.stipend}` : o.prize ? `🏆 ${o.prize}` : "Unpaid";
      response += ` | Deadline: ${formatDate(o.deadline)}\n\n`;
    });

    response += `_Click any opportunity card to see full details and apply._`;
    return response;
  }

  function generateSkillGapAdvice(profile) {
    if (!profile) {
      return "Please complete your profile first so I can analyse your skill gaps. Go to the **Profile** page to get started.";
    }
    const goal = (profile.careerGoals || [])[0] || "your career goal";
    const gap = RecommendationEngine.computeSkillGap(profile, goal, OPPORTUNITIES);

    if (gap.missing.length === 0) {
      return `Great news! Your current skills cover almost everything needed for **${goal}**. Keep building on your ${gap.present.map(p => p.skill).slice(0, 3).join(", ")} skills.`;
    }

    const topMissing = gap.missing.slice(0, 4);
    let response = `🎯 **Skill Gap Analysis for ${goal}:**\n\n`;
    response += `**You have:** ${gap.present.map(p => p.skill).join(", ") || "No matching skills yet"}\n\n`;
    response += `**Missing (most important first):**\n`;
    topMissing.forEach((s) => {
      response += `- **${s.skill}** — appears in ${s.importance}% of relevant opportunities. Learning this could unlock ~${s.unlocks}% more roles.\n`;
    });

    response += `\n💡 **Recommended learning path:**\nStart with ${topMissing[0].skill} → then ${topMissing[1]?.skill || ""}. Both have free resources on Coursera and YouTube.`;

    return response;
  }

  function generateProfileAdvice(profile) {
    if (!profile) return "Please log in to view your profile advice.";
    const score = RecommendationEngine.getProfileCompletionScore(profile);
    const suggestions = [];

    if (!profile.basic?.college) suggestions.push("Add your college/university name");
    if ((profile.skills || []).length < 5) suggestions.push("Add at least 5 skills to get better recommendations");
    if ((profile.interests || []).length < 3) suggestions.push("Add more interests (aim for 3–5)");
    if ((profile.careerGoals || []).length === 0) suggestions.push("Add your career goal — this is the most important field for matching");
    if (!profile.preferences?.mode) suggestions.push("Set your work mode preference (Remote/On-site/Hybrid)");

    if (suggestions.length === 0) {
      return `Your profile is **${score}% complete** — excellent! 🎉 The recommendation engine is working with full data. Keep applying to opportunities and track them in the Application Tracker.`;
    }

    return `Your profile is **${score}% complete**. To get better recommendations:\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n_Higher profile completion = more accurate recommendations._`;
  }

  function generateDeadlineAdvice(profile) {
    const opps = OpportunityService.getUpcomingDeadlines(14, profile);
    if (opps.length === 0) {
      return "No opportunities closing in the next 14 days. Check the **Deadline Tracker** page for the full list.";
    }

    let response = `⏰ **Deadlines in the next 14 days:**\n\n`;
    opps.slice(0, 6).forEach((o) => {
      const today = new Date();
      const diff = Math.ceil((new Date(o.deadline) - today) / (1000 * 60 * 60 * 24));
      const urgency = diff <= 3 ? "🔴" : diff <= 7 ? "🟡" : "🟢";
      response += `${urgency} **${o.title}** — ${diff} days left (${formatDate(o.deadline)})\n`;
      if (o.recommendation) response += `   📊 ${o.recommendation.score}% match for you\n`;
      response += "\n";
    });

    return response;
  }

  function generateApplyOrder(profile) {
    if (!profile) return "Please complete your profile so I can prioritise recommendations for you.";
    const topOpps = RecommendationEngine.getTopRecommendations(profile, OPPORTUNITIES, 5);
    const today = new Date();

    // Score considering deadline urgency too
    let response = `📋 **Apply in this order (best match + deadline urgency):**\n\n`;
    topOpps.forEach((o, i) => {
      const diff = Math.ceil((new Date(o.deadline) - today) / (1000 * 60 * 60 * 24));
      response += `**${i + 1}. ${o.title}** at ${o.organization}\n`;
      response += `   📊 ${o.recommendation.score}% match | ⏰ ${diff} days left\n\n`;
    });

    response += `\n💡 Start with the top match that has the soonest deadline. Go to the **Explore** page to apply.`;
    return response;
  }

  function generateExplainRec(profile) {
    if (!profile) return "Log in and view the Dashboard to see your personalised recommendations and their explanations.";
    const top = RecommendationEngine.getTopRecommendations(profile, OPPORTUNITIES, 1)[0];
    if (!top) return "I couldn't find a strong match for your profile right now. Try adding more skills and interests.";

    const rec = top.recommendation;
    let response = `🔍 **Why "${top.title}" is your top recommendation:**\n\n`;
    response += `**Overall match: ${rec.score}%**\n\n`;
    response += `**Score breakdown:**\n`;
    response += `- Skill Match: ${rec.breakdown.skillMatch}% (weight: 35%)\n`;
    response += `- Interest Match: ${rec.breakdown.interestMatch}% (weight: 20%)\n`;
    response += `- Career Goal Match: ${rec.breakdown.careerGoalMatch}% (weight: 20%)\n`;
    response += `- Education Match: ${rec.breakdown.educationMatch}% (weight: 10%)\n`;
    response += `- Preference Match: ${rec.breakdown.preferenceMatch}% (weight: 10%)\n`;
    response += `- Deadline Urgency: ${rec.breakdown.deadlineUrgency}% (weight: 5%)\n\n`;
    response += `**Specific reasons:**\n`;
    rec.reasons.forEach((r) => {
      response += `${r.icon} ${r.text}\n`;
    });

    return response;
  }

  function generateGeneral(message, profile) {
    const name = profile?.name?.split(" ")[0] || "there";
    return `I'm not sure I understood that, ${name}. Try asking me something like:
- "Find internships for Python"
- "What skills am I missing for AI Engineer?"
- "Which opportunity should I apply to first?"
- "Show deadlines this week"
- "Why are these recommended to me?"

Type **help** to see all my capabilities.`;
  }

  // ─── Format helpers ───────────────────────────────────────────────────────
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  // ─── Main public API ──────────────────────────────────────────────────────

  /**
   * generateResponse(message, profile)
   * Returns a response string (supports markdown).
   * Replace this function body with a real API call for production.
   */
  async function generateResponse(message, profile) {
    // Simulate network latency for realism
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const intent = detectIntent(message);
    const keyword = extractKeyword(message);

    switch (intent) {
      case "greeting": return generateGreeting(profile);
      case "help": return generateHelp();
      case "find_internship":
      case "find_hackathon":
      case "find_scholarship":
      case "find_competition":
      case "find_research":
      case "find_course":
      case "find_freelance":
        return generateFindOpportunities(intent, keyword, profile);
      case "skill_gap": return generateSkillGapAdvice(profile);
      case "profile_advice": return generateProfileAdvice(profile);
      case "deadlines": return generateDeadlineAdvice(profile);
      case "apply_order": return generateApplyOrder(profile);
      case "explain_rec": return generateExplainRec(profile);
      default: return generateGeneral(message, profile);
    }
  }

  return { generateResponse };
})();
