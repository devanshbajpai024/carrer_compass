const Application = require('../models/Application');

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id }).populate('opportunityId');
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, studentId: req.user._id }).populate('opportunityId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const { opportunityId, status, notes } = req.body;
    
    let application = await Application.findOne({ studentId: req.user._id, opportunityId });
    if (application) {
      // update if exists
      if (status) application.status = status;
      if (notes) application.notes = notes;
      application.appliedAt = status === 'APPLIED' && !application.appliedAt ? new Date() : application.appliedAt;
      await application.save();
    } else {
      application = await Application.create({
        studentId: req.user._id,
        opportunityId,
        status: status || 'SAVED',
        notes,
        appliedAt: status === 'APPLIED' ? new Date() : null
      });
    }

    res.status(201).json({ success: true, data: application, message: 'Application saved/applied' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findOne({ _id: req.params.id, studentId: req.user._id });
    
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (status) application.status = status;
    if (notes) application.notes = notes;
    
    await application.save();
    res.json({ success: true, data: application, message: 'Application updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, studentId: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, message: 'Application removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
