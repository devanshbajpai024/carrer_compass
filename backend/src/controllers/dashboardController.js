const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const CareerRoadmap = require('../models/CareerRoadmap');
const { getSkillGapsForCareer } = require('../services/skillEngine');
const { getRecommendedProjects } = require('../services/projectEngine');

exports.getDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const user = await User.findById(studentId);

    // 1. Profile Completion (basic mock logic)
    let profileCompletion = 0;
    if (user.name) profileCompletion += 20;
    if (user.education && user.education.degree) profileCompletion += 20;
    if (user.skills && user.skills.length > 0) profileCompletion += 20;
    if (user.careerGoals && user.careerGoals.length > 0) profileCompletion += 20;
    if (user.interests && user.interests.length > 0) profileCompletion += 20;

    // 2. Top Recommendations (limit 5)
    const topRecommendations = await Recommendation.find({ studentId })
      .populate('opportunityId')
      .sort({ matchScore: -1 })
      .limit(5);

    // 3. Upcoming Deadlines (from saved/applied or high recommendations)
    // For simplicity, just get top recommendations that have deadlines coming up
    const upcomingDeadlines = topRecommendations
      .filter(r => r.opportunityId && r.opportunityId.deadline)
      .map(r => r.opportunityId)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 3);

    // 4. Skill Gaps
    const allGaps = getSkillGapsForCareer(user);
    const skillGaps = [];
    allGaps.forEach(g => {
      g.skills.filter(s => s.status === 'GAP').forEach(s => skillGaps.push(s));
    });

    // 5. Application Summary
    const apps = await Application.find({ studentId });
    const applicationSummary = {
      saved: apps.filter(a => a.status === 'SAVED').length,
      applied: apps.filter(a => a.status === 'APPLIED').length,
      shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
      selected: apps.filter(a => a.status === 'SELECTED').length,
    };

    // 6. Recommended Projects (limit 3)
    const allRecommendedProjects = await getRecommendedProjects(user, skillGaps);
    const recommendedProjects = allRecommendedProjects.slice(0, 3);

    // 7. Roadmap Progress
    const roadmaps = await CareerRoadmap.find({ studentId });
    let roadmapProgress = 0;
    if (roadmaps.length > 0) {
      const nodes = roadmaps[0].nodes;
      const completed = nodes.filter(n => n.status === 'completed').length;
      roadmapProgress = Math.round((completed / nodes.length) * 100);
    }

    // 8. Notifications (unread)
    const notifications = await Notification.find({ studentId, read: false }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        profileCompletion,
        topRecommendations,
        upcomingDeadlines,
        skillGaps: skillGaps.slice(0, 5), // top 5 gaps
        applicationSummary,
        recommendedProjects,
        roadmapProgress,
        notifications
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
