import express from 'express';
import dbConnect from '../config/db';
import Report from '../models/Report';

const router = express.Router();

// Retrieves a paginated list of historical reports.
// Sorted descending to ensure the latest insights are surfaced first in the UI history panel.
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
    console.error("[Reports API] Failed to fetch historical reports:", err);
    res.status(500).json({ error: "Failed to fetch reports. Please check database connectivity." });
  }
});
// Fetches the fully populated report document by its Mongo ID.
// This is used to re-hydrate the ReportViewer when a user clicks a history card.
router.get('/:id', async (req, res) => {
  try {
    await dbConnect();
    const report = await Report.findById(req.params.id).lean();
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ report });
  } catch (err) {
    console.error(`[Reports API] Failed to fetch report ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch the specific report." });
  }
});

// Hard-delete a report from the database.
// Typically invoked when a user wants to clear inaccurate or outdated runs from their local history.
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
    console.error(`[Reports API] Failed to delete report ${id}:`, err);
    res.status(500).json({ error: "Failed to delete the requested report." });
  }
});

export default router;
