"use client";

import { useEffect, useRef } from "react";
import type { AgentStep } from "@/lib/types/research";

interface AgentTerminalProps {
  steps: AgentStep[];
  isRunning: boolean;
}

export default function AgentTerminal({ steps, isRunning }: AgentTerminalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new lines appear
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [steps]);

  // All steps have a message now, except maybe some malformed ones
  const logs = steps.filter(s => s.type !== "complete" && s.type !== "progress" && 'message' in s && s.message);
  
  const progress = steps.findLast((s) => s.type === "progress") as Extract<AgentStep, { type: "progress" }> | undefined;
  const hasError = steps.some((s) => s.type === "error");
  const isDone = steps.some((s) => s.type === "complete");

  const statusClass = hasError ? "error" : isDone ? "done" : "running";
  const statusLabel = hasError ? "Error" : isDone ? "Complete" : "Running";

  const getStepIcon = (step: any) => {
    if (step.type === "error" || step.level === "error") return "✗";
    if (step.type === "complete" || step.level === "success") return "✓";
    if (step.level === "warn") return "!";
    if (step.type === "start") return "🚀";
    if (step.type === "agents_started") return "🤖";
    if (step.type === "judge_completed") return "⚖️";
    return "›";
  };

  const getStepLevel = (step: any) => {
    if (step.type === "error" || step.level === "error") return "error";
    if (step.type === "complete" || step.level === "success") return "success";
    if (step.level === "warn") return "warn";
    if (step.type === "agents_started" || step.type === "judge_completed") return "success";
    return "info";
  };

  return (
    <div className="terminal-card">
      {/* Header */}
      <div className="terminal-header">
        <div className="terminal-dots">
          <div className="terminal-dot red" />
          <div className="terminal-dot yellow" />
          <div className="terminal-dot green" />
        </div>
        <span className="terminal-title">invest-ai — advanced research engine</span>
        <div className={`terminal-status ${statusClass}`}>
          <div className="terminal-status-dot" />
          {statusLabel}
          {progress && !isDone && !hasError && (
            <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>
              ({progress.current}/{progress.total})
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {progress && (
        <div style={{ padding: "0 16px" }}>
          <div
            style={{
              height: 2,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(progress.current / progress.total) * 100}%`,
                background: isDone
                  ? "var(--accent-green)"
                  : hasError
                  ? "var(--accent-red)"
                  : "var(--gradient-primary)",
                borderRadius: 99,
                transition: "width 0.5s ease, background 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="terminal-body" ref={bodyRef}>
        {logs.length === 0 && (
          <div style={{ color: "var(--text-muted)" }}>
            Initializing agent swarm...
          </div>
        )}
        {logs.map((step: any, i) => {
          const level = getStepLevel(step);
          const icon = getStepIcon(step);
          
          return (
            <div key={i} className={`terminal-line ${level}`}>
              <span className="terminal-line-prompt">{icon}</span>
              <span className="terminal-line-text">{step.message}</span>
            </div>
          );
        })}
        {isRunning && !isDone && !hasError && (
          <div className="terminal-line info">
            <span className="terminal-line-prompt">›</span>
            <span className="terminal-line-text">
              <span className="typing-indicator">
                <span /><span /><span />
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
