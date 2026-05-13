const Permit = require('../models/Permit');

exports.listMyPermits = async (req, res) => {
  try {
    const items = await Permit.find({ applicant: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to list permits' });
  }
};

exports.createPermitDraft = async (req, res) => {
  try {
    const { permit_type, wizard_step, data = {}, department } = req.body;
    if (!permit_type) return res.status(400).json({ success: false, message: 'permit_type required' });
    const doc = await Permit.create({
      permit_type,
      applicant: req.user._id,
      department: department || null,
      data: { ...data, wizard_step: wizard_step || 1 },
      status: 'draft',
      draft: true,
      fee_simulated: req.body.fee_simulated ?? 25
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Create failed' });
  }
};

exports.updatePermitWizard = async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);
    if (!permit || permit.applicant.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    permit.data = { ...permit.data, ...req.body.data, wizard_step: req.body.wizard_step };
    if (req.body.attachments) permit.attachments = req.body.attachments;
    await permit.save();
    return res.json({ success: true, data: permit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
};

exports.submitPermit = async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);
    if (!permit || permit.applicant.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    permit.status = 'submitted';
    permit.draft = false;
    await permit.save();
    return res.json({ success: true, data: permit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Submit failed' });
  }
};

exports.reviewPermit = async (req, res) => {
  try {
    const { status, certificate_pdf_url } = req.body;
    const permit = await Permit.findById(req.params.id);
    if (!permit) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user.role === 'admin' && permit.department && permit.department.toString() !== req.user.department?.toString()) {
      return res.status(403).json({ success: false, message: 'Wrong department' });
    }

    if (!['approved', 'rejected', 'verification', 'inspection'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    permit.status = status;
    if (certificate_pdf_url) permit.certificate_pdf_url = certificate_pdf_url;
    if (status === 'approved' && !permit.certificate_pdf_url) {
      permit.certificate_pdf_url = `https://civicconnect.demo/permits/${permit._id}/certificate.pdf`;
    }
    await permit.save();
    return res.json({ success: true, data: permit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Review failed' });
  }
};
