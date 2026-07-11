import express from 'express';
import dbConnect from '../lib/db';
import Report from '../models/Report';

const router = express.Router();

// GET /api/reports — list all saved reports (most recent first)
router.get('/', async (req, res) => {
  try {
    await dbConnect();
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .select("company ticker verdict confidence createdAt")
      .limit(50)
      .lean();
    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});
// GET /api/reports/:id — fetch a single report by ID
router.get('/:id', async (req, res) => {
  try {
    await dbConnect();
    const report = await Report.findById(req.params.id).lean();
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// DELETE /api/reports?id=xxx — delete a single report
router.delete('/', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }
  try {
    await dbConnect();
    await Report.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
