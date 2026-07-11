"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyClaimsAndBuildAuditTrail = verifyClaimsAndBuildAuditTrail;
function verifyClaimsAndBuildAuditTrail(agentOutputs, evidenceStore) {
    const auditTrail = [];
    const evidenceMap = new Map();
    for (const item of evidenceStore) {
        evidenceMap.set(item.id, item);
    }
    for (const [agentName, output] of Object.entries(agentOutputs)) {
        if (!output || !output.arguments)
            continue;
        for (const arg of output.arguments) {
            if (arg.evidenceIds && arg.evidenceIds.length > 0) {
                let matched = false;
                for (const eId of arg.evidenceIds) {
                    const evidence = evidenceMap.get(eId);
                    if (evidence) {
                        matched = true;
                        auditTrail.push({
                            claim: arg.claim,
                            supportingEvidence: `${evidence.title}: ${evidence.value}`,
                            source: evidence.source,
                            metric: evidence.relatedMetric || "General",
                            confidence: arg.confidence >= 80 ? "high" : arg.confidence >= 50 ? "medium" : "low",
                            agent: agentName,
                        });
                    }
                }
                if (!matched) {
                    // Unsupported claim found!
                    console.warn(`[ClaimVerifier] Agent ${agentName} made claim without valid evidence: "${arg.claim}"`);
                    arg.confidence = Math.min(arg.confidence, 40); // Penalty for unsupported
                    auditTrail.push({
                        claim: arg.claim,
                        supportingEvidence: "UNSUPPORTED (Invalid Evidence ID)",
                        source: "Unknown",
                        metric: "Unknown",
                        confidence: "low",
                        agent: agentName,
                    });
                }
            }
            else {
                // No evidence provided
                console.warn(`[ClaimVerifier] Agent ${agentName} made claim without any evidence: "${arg.claim}"`);
                arg.confidence = Math.min(arg.confidence, 30);
                auditTrail.push({
                    claim: arg.claim,
                    supportingEvidence: "UNSUPPORTED (No Evidence Provided)",
                    source: "AI Synthesized",
                    metric: "Unknown",
                    confidence: "low",
                    agent: agentName,
                });
            }
        }
    }
    return auditTrail;
}
