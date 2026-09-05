/**
 * savedService.js
 * Manages saved/bookmarked opportunities per student.
 */

const SavedService = (() => {
  const KEY = "soe_saved";

  function getData() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveData(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function getUserSaved(userId) {
    return getData()[userId] || [];
  }

  /**
   * toggle(userId, opportunityId)
   * Saves if not saved, removes if already saved.
   * Returns { saved: boolean }
   */
  function toggle(userId, opportunityId) {
    const data = getData();
    if (!data[userId]) data[userId] = [];
    const idx = data[userId].indexOf(opportunityId);
    if (idx === -1) {
      data[userId].push(opportunityId);
      saveData(data);
      return { saved: true };
    } else {
      data[userId].splice(idx, 1);
      saveData(data);
      return { saved: false };
    }
  }

  /**
   * isSaved(userId, opportunityId)
   */
  function isSaved(userId, opportunityId) {
    return getUserSaved(userId).includes(opportunityId);
  }

  /**
   * getSavedOpportunities(userId)
   * Returns full opportunity objects for all saved IDs.
   */
  function getSavedOpportunities(userId) {
    const ids = getUserSaved(userId);
    return ids.map((id) => OpportunityService.getById(id)).filter(Boolean);
  }

  /**
   * getSavedCount(userId)
   */
  function getSavedCount(userId) {
    return getUserSaved(userId).length;
  }

  return {
    toggle,
    isSaved,
    getSavedOpportunities,
    getSavedCount,
    getUserSaved,
  };
})();
