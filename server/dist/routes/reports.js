"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../lib/db"));
const Report_1 = __importDefault(require("../models/Report"));
const router = express_1.default.Router();
// GET /api/reports — list all saved reports (most recent first)
router.get('/', async (req, res) => {
    try {
        await (0, db_1.default)();
        const reports = await Report_1.default.find({})
            .sort({ createdAt: -1 })
            .select("company ticker verdict confidence createdAt")
            .limit(50)
            .lean();
        res.json({ reports });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});
// DELETE /api/reports?id=xxx — delete a single report
router.delete('/', async (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: "Missing id" });
    }
    try {
        await (0, db_1.default)();
        await Report_1.default.findByIdAndDelete(id);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete report" });
    }
});
exports.default = router;
