/**
 * opportunityService.js
 * Opportunity querying, filtering, searching, and sorting.
 * Uses the OPPORTUNITIES array from opportunities.js as the data source.
 * Replace with fetch() calls when a real API is available.
 */

const OpportunityService = (() => {

  /**
   * getAll()
   * Returns all opportunities.
   */
  function getAll() {
    return [...OPPORTUNITIES];
  }

  /**
   * getById(id)
   */
  function getById(id) {
    return OPPORTUNITIES.find((o) => o.id === id) || null;
  }

  /**
   * getByCategory(category)
   */
  function getByCategory(category) {
    if (!category || category === "All") return getAll();
    return OPPORTUNITIES.filter((o) => o.category === category);
  }

  /**
   * search(query, filters, sortBy)
   * Main search + filter function used by the Explore page.
   *
   * @param {string} query - text search
   * @param {Object} filters - { category, mode, paid, domain, difficulty, educationLevel, minYear }
   * @param {string} sortBy - 'latest' | 'deadline' | 'popular' | 'reward' | 'match'
   * @param {Object} profile - student profile (needed for 'match' sort)
   */
  function search(query = "", filters = {}, sortBy = "latest", profile = null) {
    let results = getAll();

    // ── Text search ──────────────────────────────────────────────────────
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter((o) => {
        return (
          o.title.toLowerCase().includes(q) ||
          o.organization.toLowerCase().includes(q) ||
          o.domain.toLowerCase().includes(q) ||
          (o.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          (o.requiredSkills || []).some((s) => s.toLowerCase().includes(q)) ||
          o.description.toLowerCase().includes(q)
        );
      });
    }

    // ── Category filter ───────────────────────────────────────────────────
    if (filters.category && filters.category !== "All") {
      results = results.filter((o) => o.category === filters.category);
    }

    // ── Mode filter ───────────────────────────────────────────────────────
    if (filters.mode && filters.mode !== "All") {
      results = results.filter((o) => o.mode === filters.mode);
    }

    // ── Paid filter ───────────────────────────────────────────────────────
    if (filters.paid === true) {
      results = results.filter((o) => !!o.stipend);
    }

    // ── Domain filter ─────────────────────────────────────────────────────
    if (filters.domain && filters.domain !== "All") {
      results = results.filter((o) =>
        o.domain.toLowerCase().includes(filters.domain.toLowerCase())
      );
    }

    // ── Difficulty filter ─────────────────────────────────────────────────
    if (filters.difficulty && filters.difficulty !== "All") {
      results = results.filter((o) => o.difficulty === filters.difficulty);
    }

    // ── Deadline: exclude expired ─────────────────────────────────────────
    if (filters.hideExpired !== false) {
      const today = new Date();
      results = results.filter((o) => new Date(o.deadline) >= today);
    }

    // ── Sort ──────────────────────────────────────────────────────────────
    switch (sortBy) {
      case "latest":
        results.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        break;
      case "deadline":
        results.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      case "popular":
        results.sort((a, b) => (b.applicants || 0) - (a.applicants || 0));
        break;
      case "reward": {
        // Sort by stipend presence, then stipend amount (crude but effective)
        results.sort((a, b) => {
          const aHas = !!(a.stipend || a.prize);
          const bHas = !!(b.stipend || b.prize);
          return (bHas ? 1 : 0) - (aHas ? 1 : 0);
        });
        break;
      }
      case "match": {
        if (profile) {
          results = RecommendationEngine.rank(profile, results, { includeIneligible: true });
        }
        break;
      }
      default:
        break;
    }

    return results;
  }

  /**
   * getCategories()
   * Returns list of all unique categories.
   */
  function getCategories() {
    return ["All", ...new Set(OPPORTUNITIES.map((o) => o.category))];
  }

  /**
   * getDomains()
   */
  function getDomains() {
    return ["All", ...new Set(OPPORTUNITIES.map((o) => o.domain))];
  }

  /**
   * getUpcomingDeadlines(days, profile)
   * Returns opportunities with deadlines in the next N days,
   * sorted by deadline ascending.
   */
  function getUpcomingDeadlines(days = 30, profile = null) {
    const today = new Date();
    const cutoff = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    let opps = OPPORTUNITIES.filter((o) => {
      const d = new Date(o.deadline);
      return d >= today && d <= cutoff;
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (profile) {
      opps = opps.map((o) => ({
        ...o,
        recommendation: RecommendationEngine.scoreOne(profile, o),
      }));
    }

    return opps;
  }

  return {
    getAll,
    getById,
    getByCategory,
    search,
    getCategories,
    getDomains,
    getUpcomingDeadlines,
  };
})();
