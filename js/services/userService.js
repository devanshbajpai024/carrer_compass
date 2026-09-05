/**
 * userService.js
 * Student profile CRUD using localStorage.
 * Replace localStorage calls with API fetch() when backend is ready.
 */

const UserService = (() => {
  const PROFILES_KEY = "soe_profiles";

  function getAllProfiles() {
    try {
      return JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveAllProfiles(profiles) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  /**
   * getProfile(userId)
   * Returns the full student profile or null.
   */
  function getProfile(userId) {
    if (!userId) return null;
    const profiles = getAllProfiles();
    return profiles[userId] || null;
  }

  /**
   * saveProfile(userId, profileData)
   * Upserts the profile.
   */
  function saveProfile(userId, profileData) {
    const profiles = getAllProfiles();
    profiles[userId] = { ...profileData, updatedAt: new Date().toISOString() };
    saveAllProfiles(profiles);
    return profiles[userId];
  }

  /**
   * updateProfile(userId, partial)
   * Merges partial data into existing profile.
   */
  function updateProfile(userId, partial) {
    const profiles = getAllProfiles();
    const existing = profiles[userId] || { id: userId };
    profiles[userId] = deepMerge(existing, { ...partial, updatedAt: new Date().toISOString() });
    saveAllProfiles(profiles);
    return profiles[userId];
  }

  /**
   * createEmptyProfile(userId, name, email)
   * Creates a blank profile for a new signup.
   */
  function createEmptyProfile(userId, name, email) {
    const profile = {
      id: userId,
      name,
      email,
      avatar: null,
      basic: {
        age: null,
        college: "",
        degree: "",
        branch: "",
        year: null,
        semester: null,
        location: "",
        cgpa: null,
      },
      skills: [],
      interests: [],
      careerGoals: [],
      preferences: {
        opportunityTypes: [],
        mode: "",
        locationPreference: "",
        paid: false,
        durationPreference: "",
        domains: [],
        deadlinePreference: "flexible",
      },
      savedOpportunities: [],
      applications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(userId, profile);
    return profile;
  }

  /**
   * getOrCreateProfile(userId, name, email)
   */
  function getOrCreateProfile(userId, name, email) {
    return getProfile(userId) || createEmptyProfile(userId, name, email);
  }

  /**
   * getProfileCompletionScore(profile)
   * Delegates to the recommendation engine.
   */
  function getProfileCompletionScore(profile) {
    return RecommendationEngine.getProfileCompletionScore(profile);
  }

  // ─── Deep merge helper ────────────────────────────────────────────────────
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  return {
    getProfile,
    saveProfile,
    updateProfile,
    createEmptyProfile,
    getOrCreateProfile,
    getProfileCompletionScore,
  };
})();
