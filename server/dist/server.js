"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./lib/db"));
const reports_1 = __importDefault(require("./routes/reports"));
const research_1 = __importDefault(require("./routes/research"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to DB
(0, db_1.default)().catch(err => console.error("Database connection failed:", err));
app.use('/api/reports', reports_1.default);
app.use('/api/research', research_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
