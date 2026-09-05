/**
 * trackerService.js
 * Manages student application tracking (Kanban pipeline).
 *
 * Pipeline stages: Interested → Applied → Shortlisted → Interview → Selected
 * Rejection is also a valid terminal state.
 */

const TrackerService = (() => {
  const KEY = "soe_applications";

  const STAGES = ["Interested", "Applied", "Shortlisted", "Interview", "Selected", "Rejected"];

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

  function getUserApps(userId) {
    return getData()[userId] || [];
  }

  /**
   * addApplication(userId, opportunityId, status)
   * Adds a new application or updates an existing one.
   */
  function addApplication(userId, opportunityId, status = "Interested") {
    const data = getData();
    if (!data[userId]) data[userId] = [];

    const existing = data[userId].find((a) => a.opportunityId === opportunityId);
    if (existing) {
      existing.status = status;
      existing.updatedAt = new Date().toISOString();
    } else {
      data[userId].push({
        id: "app_" + Date.now() + "_" + Math.random().toString(36).slice(2),
        opportunityId,
        status,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: "",
      });
    }
    saveData(data);
    return { success: true };
  }

  /**
   * updateStatus(userId, opportunityId, newStatus)
   */
  function updateStatus(userId, opportunityId, newStatus) {
    if (!STAGES.includes(newStatus)) return { success: false, error: "Invalid status" };
    return addApplication(userId, opportunityId, newStatus);
  }

  /**
   * removeApplication(userId, opportunityId)
   */
  function removeApplication(userId, opportunityId) {
    const data = getData();
    if (!data[userId]) return;
    data[userId] = data[userId].filter((a) => a.opportunityId !== opportunityId);
    saveData(data);
  }

  /**
   * getApplicationStatus(userId, opportunityId)
   * Returns status string or null.
   */
  function getApplicationStatus(userId, opportunityId) {
    const apps = getUserApps(userId);
    const app = apps.find((a) => a.opportunityId === opportunityId);
    return app ? app.status : null;
  }

  /**
   * getAllApplications(userId)
   * Returns all application records with full opportunity objects.
   */
  function getAllApplications(userId) {
    const apps = getUserApps(userId);
    return apps.map((app) => ({
      ...app,
      opportunity: OpportunityService.getById(app.opportunityId),
    })).filter((a) => a.opportunity !== null);
  }

  /**
   * getByStage(userId, stage)
   */
  function getByStage(userId, stage) {
    return getAllApplications(userId).filter((a) => a.status === stage);
  }

  /**
   * getStats(userId)
   * Returns count per stage for analytics.
   */
  function getStats(userId) {
    const apps = getAllApplications(userId);
    const stats = {};
    for (const stage of STAGES) {
      stats[stage] = apps.filter((a) => a.status === stage).length;
    }
    stats.total = apps.length;
    return stats;
  }

  /**
   * updateNotes(userId, opportunityId, notes)
   */
  function updateNotes(userId, opportunityId, notes) {
    const data = getData();
    if (!data[userId]) return;
    const app = data[userId].find((a) => a.opportunityId === opportunityId);
    if (app) {
      app.notes = notes;
      app.updatedAt = new Date().toISOString();
      saveData(data);
    }
  }

  return {
    STAGES,
    addApplication,
    updateStatus,
    removeApplication,
    getApplicationStatus,
    getAllApplications,
    getByStage,
    getStats,
    updateNotes,
  };
})();
