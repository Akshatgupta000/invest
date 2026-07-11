"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchRequestSchema = exports.riskProfiles = void 0;
const zod_1 = require("zod");
exports.riskProfiles = ["conservative", "balanced", "aggressive"];
exports.ResearchRequestSchema = zod_1.z.object({
    query: zod_1.z
        .string()
        .min(2, "Query must be at least 2 characters")
        .max(80, "Query must not exceed 80 characters")
        .trim(),
    riskProfile: zod_1.z
        .enum(exports.riskProfiles)
        .default("balanced"),
});
