const Department = require('../models/Department');
const User = require('../models/User');

exports.listDepartments = async (req, res) => {
  try {
    const items = await Department.find().sort({ name: 1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, slug, contact_email, sla_config } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: 'name and slug required' });
    const doc = await Department.create({ name, slug, contact_email, sla_config: sla_config || {} });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Create failed' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { sla_config, staff_ids, name, contact_email } = req.body;
    const doc = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(sla_config && { sla_config }), ...(staff_ids && { staff_ids }), ...(name && { name }), ...(contact_email && { contact_email }) } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
};

exports.listStaffForDepartment = async (req, res) => {
  try {
    if (req.user.role === 'admin' && req.user.department?.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const users = await User.find({ department: req.params.id, role: 'staff' }).select('name email staff_id').lean();
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
};
