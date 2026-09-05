/**
 * recommendationEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * PS2 Core: Weighted opportunity recommendation algorithm.
 *
 * FORMULA:
 *   Score = (skillMatch × 0.35) + (interestMatch × 0.20) +
 *           (careerGoalMatch × 0.20) + (educationMatch × 0.10) +
 *           (preferenceMatch × 0.10) + (deadlineUrgency × 0.05)
 *
 * All factors are in range [0, 1]. Final score is normalised to [0, 100].
 *
 * HOW TO PLUG IN A REAL BACKEND:
 *   Replace the module-level call to `scoreOpportunity(profile, opp)` with
 *   a fetch() to your ranking API. The input/output contract stays identical.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const RecommendationEngine = (() => {
  // ─── Weights ──────────────────────────────────────────────────────────────
  const WEIGHTS = {
    skillMatch: 0.35,
    interestMatch: 0.20,
    careerGoalMatch: 0.20,
    educationMatch: 0.10,
    preferenceMatch: 0.10,
    deadlineUrgency: 0.05,
  };

  // ─── Helper: Normalise string for comparison ───────────────────────────────
  function norm(str) {
    return (str || "").toLowerCase().trim();
  }

  // ─── Helper: Jaccard-style set overlap ────────────────────────────────────
  // Returns fraction of setB that is covered by setA (0–1).
  function setOverlap(setA, setB) {
    if (!setB || setB.length === 0) return 1; // No requirement → full score
    if (!setA || setA.length === 0) return 0;
    const normA = setA.map(norm);
    const matched = setB.filter((b) => normA.includes(norm(b)));
    return matched.length / setB.length;
  }

  // ─── Helper: Any-match (does the student list contain any item from query) ──
  function anyMatch(studentList, queryList) {
    if (!queryList || queryList.length === 0) return 0.5; // Neutral
    if (!studentList || studentList.length === 0) return 0;
    const sNorm = studentList.map(norm);
    return queryList.some((q) => sNorm.includes(norm(q))) ? 1 : 0;
  }

  // ─── Factor 1: Skill Match (weight 0.35) ─────────────────────────────────
  // How well student skills cover the opportunity's required skills.
  // Preferred skills add a bonus up to 0.15 on top of required skill score.
  function computeSkillMatch(profile, opp) {
    const studentSkills = profile.skills || [];
    const requiredScore = setOverlap(studentSkills, opp.requiredSkills);
    const preferredScore = setOverlap(studentSkills, opp.preferredSkills || []);
    // Weighted: required matters more, preferred is a bonus
    const raw = requiredScore * 0.85 + preferredScore * 0.15;
    return Math.min(1, raw);
  }

  // ─── Factor 2: Interest Match (weight 0.20) ───────────────────────────────
  // Does the opportunity domain overlap with the student's interests?
  function computeInterestMatch(profile, opp) {
    const interests = profile.interests || [];
    const domain = opp.domain || "";
    const tags = opp.tags || [];

    // Keyword mapping: interest → keywords that appear in domain/tags
    const interestKeywords = {
      "artificial intelligence": ["ai", "machine learning", "deep learning", "nlp", "artificial intelligence"],
      "machine learning": ["machine learning", "ml", "deep learning", "ai", "data science"],
      "data science": ["data science", "data analysis", "analytics", "ml", "statistics"],
      "web development": ["web development", "web dev", "react", "javascript", "full stack", "frontend"],
      "app development": ["android", "ios", "mobile", "app development"],
      "cybersecurity": ["cybersecurity", "security", "ctf", "hacking", "infosec"],
      "competitive programming": ["competitive programming", "icpc", "algorithms", "dsa"],
      "blockchain": ["blockchain", "web3", "solidity", "crypto", "defi"],
      "cloud computing": ["cloud", "aws", "azure", "devops", "kubernetes"],
      "research": ["research", "academic", "iisc", "iit", "fellowship"],
      "entrepreneurship": ["startup", "entrepreneurship", "founder", "equity"],
      "design": ["ui/ux", "design", "figma", "ux", "user research"],
      "open source": ["open source", "gsoc", "mlh", "github"],
      "finance": ["finance", "fintech", "quant", "trading"],
      "hackathons": ["hackathon", "hack", "build"],
    };

    const domainLower = norm(domain);
    const tagLower = tags.map(norm).join(" ");
    const combined = domainLower + " " + tagLower;

    let maxScore = 0;
    for (const interest of interests) {
      const keywords = interestKeywords[norm(interest)] || [norm(interest)];
      const hit = keywords.some((kw) => combined.includes(kw));
      if (hit) maxScore = 1;
    }

    // Partial: domain substring match with any interest word
    if (maxScore === 0) {
      for (const interest of interests) {
        const words = norm(interest).split(/\s+/);
        if (words.some((w) => w.length > 3 && combined.includes(w))) {
          maxScore = Math.max(maxScore, 0.4);
        }
      }
    }

    return maxScore;
  }

  // ─── Factor 3: Career Goal Match (weight 0.20) ────────────────────────────
  // Does the opportunity category/domain align with the student's career goals?
  function computeCareerGoalMatch(profile, opp) {
    const goals = (profile.careerGoals || []).map(norm);
    const domain = norm(opp.domain);
    const category = norm(opp.category);
    const tags = (opp.tags || []).map(norm).join(" ");

    const goalKeywordMap = {
      "ai engineer": ["artificial intelligence", "machine learning", "deep learning", "ai", "nlp"],
      "data scientist": ["data science", "machine learning", "analytics", "statistics", "ai"],
      "software engineer": ["web development", "full stack", "backend", "java", "python", "javascript"],
      "full stack developer": ["web development", "react", "node.js", "full stack", "javascript"],
      "product manager": ["product", "management", "a/b testing", "user research"],
      "researcher": ["research", "academic", "paper", "iit", "iisc", "fellowship"],
      "entrepreneur": ["startup", "entrepreneurship", "founder"],
      "ui/ux designer": ["design", "ui/ux", "figma", "user research", "ux"],
      "product designer": ["design", "ui/ux", "product", "figma"],
      "cybersecurity engineer": ["cybersecurity", "security", "ctf", "penetration"],
      "penetration tester": ["cybersecurity", "ctf", "kali", "security"],
      "security researcher": ["cybersecurity", "security", "research"],
      "cloud engineer": ["cloud", "aws", "azure", "devops", "kubernetes"],
    };

    const combined = domain + " " + category + " " + tags;

    let bestScore = 0;
    for (const goal of goals) {
      const keywords = goalKeywordMap[goal] || [goal];
      const hitCount = keywords.filter((kw) => combined.includes(kw)).length;
      const score = Math.min(1, hitCount / Math.max(keywords.length * 0.4, 1));
      bestScore = Math.max(bestScore, score);
    }

    return bestScore;
  }

  // ─── Factor 4: Education Match (weight 0.10) ──────────────────────────────
  // Is the student eligible based on education level and year?
  function computeEducationMatch(profile, opp) {
    const studentYear = profile.basic?.year || 1;
    const degree = profile.basic?.degree || "B.Tech";
    const oppMinYear = opp.minYear || 1;
    const oppEduLevels = opp.educationLevel || [];

    // Map student degree to category
    const levelMap = {
      "B.Tech": "Undergraduate",
      "B.E.": "Undergraduate",
      "B.Sc": "Undergraduate",
      "B.Des": "Undergraduate",
      "B.Com": "Undergraduate",
      "M.Tech": "Postgraduate",
      "M.Sc": "Postgraduate",
      "MBA": "Postgraduate",
      "MCA": "Postgraduate",
      "PhD": "PhD",
    };
    const studentLevel = levelMap[degree] || "Undergraduate";

    // Education level check
    const levelOk =
      oppEduLevels.length === 0 || oppEduLevels.includes(studentLevel) || oppEduLevels.includes("All");

    // Year check
    const yearOk = studentYear >= oppMinYear;

    if (!levelOk && !yearOk) return 0;
    if (!levelOk || !yearOk) return 0.4;
    return 1;
  }

  // ─── Factor 5: Preference Match (weight 0.10) ─────────────────────────────
  // Does the opportunity match work mode, paid preference, and category preference?
  function computePreferenceMatch(profile, opp) {
    const prefs = profile.preferences || {};
    let score = 0;
    let totalChecks = 0;

    // Mode preference
    if (prefs.mode) {
      totalChecks++;
      const modeMap = {
        Remote: ["Remote"],
        "On-site": ["On-site"],
        Hybrid: ["Hybrid", "Remote", "On-site"],
        Any: ["Remote", "On-site", "Hybrid"],
      };
      const acceptable = modeMap[prefs.mode] || [];
      if (acceptable.includes(opp.mode) || !prefs.mode) score++;
    }

    // Paid preference
    if (prefs.paid !== undefined) {
      totalChecks++;
      const oppIsPaid = !!(opp.stipend && opp.stipend !== null);
      if (!prefs.paid || oppIsPaid) score++; // If student doesn't require paid, always pass
    }

    // Opportunity type preference
    if (prefs.opportunityTypes && prefs.opportunityTypes.length > 0) {
      totalChecks++;
      if (prefs.opportunityTypes.includes(opp.category)) score++;
    }

    // Domain preference
    if (prefs.domains && prefs.domains.length > 0) {
      totalChecks++;
      const domainMatch = prefs.domains.some(
        (d) => norm(d) === norm(opp.domain) || norm(opp.domain).includes(norm(d)) || norm(d).includes(norm(opp.domain))
      );
      if (domainMatch) score++;
    }

    return totalChecks > 0 ? score / totalChecks : 0.5;
  }

  // ─── Factor 6: Deadline Urgency (weight 0.05) ─────────────────────────────
  // Opportunities whose deadlines are approaching get slightly higher scores.
  // Expired deadlines score 0. Far future deadlines score ~0.3.
  function computeDeadlineUrgency(opp) {
    if (!opp.deadline) return 0.5; // safe default if missing
    const today = new Date();
    const deadline = new Date(opp.deadline);
    if (isNaN(deadline.getTime())) return 0.5; // invalid date
    
    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 0; // Expired
    if (diffDays <= 7) return 1.0; // Very urgent
    if (diffDays <= 14) return 0.85;
    if (diffDays <= 30) return 0.7;
    if (diffDays <= 60) return 0.5;
    if (diffDays <= 90) return 0.35;
    return 0.2; // Far future
  }

  // ─── Main: Score a single opportunity for a student ───────────────────────
  function scoreOpportunity(profile, opp) {
    if (!profile) profile = {};
    if (!opp) return null;

    const skillMatch = computeSkillMatch(profile, opp) || 0;
    const interestMatch = computeInterestMatch(profile, opp) || 0;
    const careerGoalMatch = computeCareerGoalMatch(profile, opp) || 0;
    const educationMatch = computeEducationMatch(profile, opp) || 0;
    const preferenceMatch = computePreferenceMatch(profile, opp) || 0;
    const deadlineUrgency = computeDeadlineUrgency(opp) || 0;

    const rawScore =
      skillMatch * WEIGHTS.skillMatch +
      interestMatch * WEIGHTS.interestMatch +
      careerGoalMatch * WEIGHTS.careerGoalMatch +
      educationMatch * WEIGHTS.educationMatch +
      preferenceMatch * WEIGHTS.preferenceMatch +
      deadlineUrgency * WEIGHTS.deadlineUrgency;

    // Normalise to 0–100, round to nearest integer, and clamp
    let score = Math.round(rawScore * 100);
    score = Math.max(0, Math.min(100, score || 0));

    // ── Generate Explainable Reasons ──────────────────────────────────────
    const reasons = generateReasons(profile, opp, {
      skillMatch,
      interestMatch,
      careerGoalMatch,
      educationMatch,
      preferenceMatch,
      deadlineUrgency,
    });

    return {
      opportunityId: opp.id,
      score,
      breakdown: {
        skillMatch: Math.round(skillMatch * 100),
        interestMatch: Math.round(interestMatch * 100),
        careerGoalMatch: Math.round(careerGoalMatch * 100),
        educationMatch: Math.round(educationMatch * 100),
        preferenceMatch: Math.round(preferenceMatch * 100),
        deadlineUrgency: Math.round(deadlineUrgency * 100),
      },
      reasons,
      isEligible: educationMatch > 0,
    };
  }

  // ─── Reason Generator ─────────────────────────────────────────────────────
  function generateReasons(profile, opp, factors) {
    const reasons = [];

    // Skill reasons
    if (factors.skillMatch > 0) {
      const studentSkills = (profile.skills || []).map(norm);
      const matchedRequired = (opp.requiredSkills || []).filter((s) =>
        studentSkills.includes(norm(s))
      );
      const matchedPreferred = (opp.preferredSkills || []).filter((s) =>
        studentSkills.includes(norm(s))
      );
      const missingRequired = (opp.requiredSkills || []).filter(
        (s) => !studentSkills.includes(norm(s))
      );

      if (matchedRequired.length > 0) {
        reasons.push({
          type: "skill",
          icon: "⚡",
          text: `You have ${matchedRequired.length} of ${opp.requiredSkills.length} required skills: ${matchedRequired.slice(0, 3).join(", ")}`,
          positive: true,
        });
      }
      if (matchedPreferred.length > 0) {
        reasons.push({
          type: "skill_bonus",
          icon: "✨",
          text: `Bonus: You also have preferred skills — ${matchedPreferred.slice(0, 2).join(", ")}`,
          positive: true,
        });
      }
      if (missingRequired.length > 0 && missingRequired.length <= 2) {
        reasons.push({
          type: "skill_gap",
          icon: "📚",
          text: `You're missing ${missingRequired.join(", ")} — learning these will make you a stronger candidate`,
          positive: false,
        });
      }
    }

    // Interest reasons
    if (factors.interestMatch >= 0.5) {
      reasons.push({
        type: "interest",
        icon: "🎯",
        text: `Matches your interest in ${opp.domain}`,
        positive: true,
      });
    }

    // Career goal reasons
    if (factors.careerGoalMatch >= 0.5) {
      const goals = profile.careerGoals || [];
      reasons.push({
        type: "career",
        icon: "🚀",
        text: `Directly aligned with your career goal: ${goals[0] || "your chosen path"}`,
        positive: true,
      });
    }

    // Education match
    if (factors.educationMatch >= 0.8) {
      const year = profile.basic?.year || "";
      reasons.push({
        type: "education",
        icon: "🎓",
        text: `Suitable for your current education level and year${year ? ` (Year ${year})` : ""}`,
        positive: true,
      });
    } else if (factors.educationMatch > 0 && factors.educationMatch < 0.8) {
      reasons.push({
        type: "education",
        icon: "🎓",
        text: `You partially meet the education requirements — check eligibility carefully`,
        positive: false,
      });
    }

    // Mode/preference reasons
    if (factors.preferenceMatch >= 0.7) {
      const mode = opp.mode;
      const prefs = profile.preferences || {};
      if (mode === prefs.mode) {
        reasons.push({
          type: "preference",
          icon: "📍",
          text: `Matches your ${mode} work preference`,
          positive: true,
        });
      }
      if (opp.stipend && prefs.paid) {
        reasons.push({
          type: "stipend",
          icon: "💰",
          text: `Paid opportunity: ${opp.stipend}`,
          positive: true,
        });
      }
    }

    // Deadline urgency reasons
    const today = new Date();
    const deadline = new Date(opp.deadline);
    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 7) {
      reasons.push({
        type: "deadline",
        icon: "⏰",
        text: `Deadline in ${diffDays} day${diffDays === 1 ? "" : "s"} — apply soon!`,
        positive: false,
      });
    } else if (diffDays > 7 && diffDays <= 14) {
      reasons.push({
        type: "deadline",
        icon: "📅",
        text: `Deadline approaching — ${diffDays} days left`,
        positive: true,
      });
    }

    // Default reason if none generated
    if (reasons.length === 0) {
      const isGoodMatch = factors.skillMatch > 0.3 || factors.interestMatch >= 0.5;
      reasons.push({
        type: "general",
        icon: isGoodMatch ? "🔍" : "⚠",
        text: isGoodMatch ? "This opportunity aligns with parts of your profile" : "This opportunity has low alignment with your current skills and career goals",
        positive: isGoodMatch,
      });
    }

    return reasons;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * rank(profile, opportunities, options)
   * Returns all opportunities sorted by score, highest first.
   * Optionally filters out zero-score or ineligible opportunities.
   *
   * @param {Object} profile   - Student profile object
   * @param {Array}  opps      - Array of opportunity objects
   * @param {Object} options   - { includeIneligible: bool, minScore: number, includeExpired: bool }
   * @returns {Array}          - Sorted scored opportunities
   */
  function rank(profile, opps, options = {}) {
    const { includeIneligible = false, includeExpired = false, minScore = 0 } = options;
    const scored = opps.map((opp) => ({
      ...opp,
      recommendation: scoreOpportunity(profile, opp),
    }));

    return scored
      .filter((o) => {
        if (!includeIneligible && !o.recommendation.isEligible) return false;
        if (!includeExpired) {
          const deadline = new Date(o.deadline);
          if (o.deadline && !isNaN(deadline.getTime()) && deadline < new Date()) {
            return false; // exclude expired
          }
        }
        return o.recommendation.score >= minScore;
      })
      .sort((a, b) => b.recommendation.score - a.recommendation.score);
  }

  /**
   * getTopRecommendations(profile, opportunities, n)
   * Returns the top N recommended opportunities.
   */
  function getTopRecommendations(profile, opps, n = 10) {
    return rank(profile, opps, { includeIneligible: false, minScore: 0 }).slice(0, n);
  }

  /**
   * scoreOne(profile, opp)
   * Score a single opportunity against a profile.
   */
  function scoreOne(profile, opp) {
    return scoreOpportunity(profile, opp);
  }

  /**
   * computeSkillGap(profile, targetGoal, opportunities)
   * Identify missing skills for a career goal based on top opportunities.
   */
  function computeSkillGap(profile, targetGoal, opportunities) {
    const studentSkills = (profile.skills || []).map(norm);

    // Find relevant opportunities for the target goal
    const goalKeywords = targetGoal.toLowerCase().split(/\s+/);
    const relevantOpps = opportunities.filter((opp) => {
      const combined = (norm(opp.domain) + " " + (opp.tags || []).map(norm).join(" "));
      return goalKeywords.some((kw) => kw.length > 3 && combined.includes(kw));
    });

    // Count how often each skill appears in required skills of relevant opps
    const skillFrequency = {};
    for (const opp of relevantOpps) {
      for (const skill of opp.requiredSkills || []) {
        const key = norm(skill);
        skillFrequency[key] = (skillFrequency[key] || { skill, count: 0, total: 0 });
        skillFrequency[key].count++;
      }
      for (const skill of opp.preferredSkills || []) {
        const key = norm(skill);
        if (!skillFrequency[key]) skillFrequency[key] = { skill, count: 0, total: 0 };
        skillFrequency[key].total++;
      }
    }

    const allSkillKeys = Object.keys(skillFrequency);
    const totalOpps = Math.max(relevantOpps.length, 1);

    const present = [];
    const missing = [];

    for (const key of allSkillKeys) {
      const { skill, count } = skillFrequency[key];
      const importance = Math.round((count / totalOpps) * 100);
      const has = studentSkills.includes(key);

      if (has) {
        present.push({ skill, importance, has: true });
      } else {
        // How many more opps would be unlocked by learning this skill
        const unlocksCount = relevantOpps.filter((opp) =>
          (opp.requiredSkills || []).map(norm).includes(key)
        ).length;
        const unlockPercent = Math.round((unlocksCount / totalOpps) * 100);
        missing.push({ skill, importance, has: false, unlocks: unlockPercent });
      }
    }

    present.sort((a, b) => b.importance - a.importance);
    missing.sort((a, b) => b.importance - a.importance);

    return {
      targetGoal,
      relevantOppsCount: relevantOpps.length,
      present: present.slice(0, 10),
      missing: missing.slice(0, 10),
    };
  }

  /**
   * getProfileCompletionScore(profile)
   * Returns 0-100 representing profile completeness.
   */
  function getProfileCompletionScore(profile) {
    let score = 0;
    const checks = [
      { key: "basic.name", w: 10, check: () => profile.name },
      { key: "basic.college", w: 10, check: () => profile.basic?.college },
      { key: "basic.degree", w: 5, check: () => profile.basic?.degree },
      { key: "basic.year", w: 5, check: () => profile.basic?.year },
      { key: "skills", w: 25, check: () => (profile.skills || []).length >= 3 },
      { key: "interests", w: 15, check: () => (profile.interests || []).length >= 2 },
      { key: "careerGoals", w: 20, check: () => (profile.careerGoals || []).length >= 1 },
      { key: "preferences.mode", w: 5, check: () => profile.preferences?.mode },
      { key: "preferences.types", w: 5, check: () => (profile.preferences?.opportunityTypes || []).length >= 1 },
    ];

    for (const c of checks) {
      if (c.check()) score += c.w;
    }

    return Math.min(100, score);
  }

  return {
    rank,
    getTopRecommendations,
    scoreOne,
    computeSkillGap,
    getProfileCompletionScore,
    WEIGHTS,
  };
})();
