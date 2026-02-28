"use client";

// ─────────────────────────────────────────────────────────────────────────────
// MINIMAL ElevenLabs mic diagnostic page
//
// PURPOSE: Isolate whether the mic issue is in game code or ElevenLabs/LiveKit.
//
// This page uses ONLY: agentId + connectionType: "webrtc"
// No game logic, no sound engine, no polling, no silence timer,
// no customLlmExtraBody, no firstMessage override, no getUserMedia,
// no permissions.query.
//
// Test result:
//   - User messages appear here AND on game page → bug is NOT mic/ElevenLabs
//   - User messages appear HERE but not game page → bug IS in game code
//   - User messages DO NOT appear here either    → bug is ElevenLabs/LiveKit
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from "react";
import { useConversation } from "@elevenlabs/react";

interface LogEntry {
  ts: string;
  level: "info" | "warn" | "error" | "user" | "ai";
  text: string;
}

function ts(): string {
  return new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
}

export default function MicTestPage() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { ts: ts(), level: "info", text: "Page loaded. Press Connect to start." },
  ]);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [lastAiMessage, setLastAiMessage] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((level: LogEntry["level"], text: string) => {
    const entry: LogEntry = { ts: ts(), level, text };
    console.log(`[MIC-TEST][${level.toUpperCase()}] ${text}`);
    setLogs((prev) => {
      const next = [...prev, entry];
      // Keep last 200 entries
      return next.length > 200 ? next.slice(next.length - 200) : next;
    });
    // Scroll to bottom on next paint
    requestAnimationFrame(() => {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  const conversation = useConversation({
    onConnect: useCallback(() => {
      addLog("info", "onConnect fired — WebRTC connected to ElevenLabs");
    }, [addLog]),

    onDisconnect: useCallback(() => {
      addLog("warn", "onDisconnect fired — session ended");
    }, [addLog]),

    onMessage: useCallback(
      ({ message, source }: { message: string; source: string }) => {
        if (source === "user") {
          addLog("user", `USER MESSAGE: "${message}"`);
          setLastUserMessage(message);
        } else if (source === "ai") {
          addLog("ai", `AI MESSAGE: "${message.slice(0, 120)}${message.length > 120 ? "…" : ""}"`);
          setLastAiMessage(message.slice(0, 200));
        } else {
          addLog("info", `onMessage [source=${source}]: "${message.slice(0, 100)}"`);
        }
      },
      [addLog],
    ),

    onModeChange: useCallback(
      ({ mode }: { mode: string }) => {
        addLog("info", `onModeChange → mode="${mode}"`);
      },
      [addLog],
    ),

    onError: useCallback(
      (message: string) => {
        addLog("error", `onError: ${message}`);
        setErrorText(message);
      },
      [addLog],
    ),
  });

  const handleConnect = useCallback(async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    if (!agentId) {
      addLog("error", "NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not set — check .env.local");
      setErrorText("Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID");
      return;
    }

    addLog("info", `Calling startSession — agentId=${agentId.slice(0, 8)}…, connectionType=webrtc`);
    addLog("info", "No getUserMedia, no permissions.query, no overrides, no customLlmExtraBody");

    try {
      const cid = await conversation.startSession({
        agentId,
        connectionType: "webrtc",
      });
      addLog("info", `startSession resolved — conversationId=${cid ?? "(null)"}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog("error", `startSession threw: ${msg}`);
      setErrorText(msg);
    }
  }, [addLog, conversation]);

  const handleDisconnect = useCallback(async () => {
    addLog("warn", "Calling endSession...");
    try {
      await conversation.endSession();
      addLog("info", "endSession resolved");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog("error", `endSession threw: ${msg}`);
    }
  }, [addLog, conversation]);

  // Derive display values
  const statusText = conversation.status ?? "unknown";
  const isSpeakingText = conversation.isSpeaking ? "YES (AI is talking)" : "no";

  const levelColors: Record<LogEntry["level"], string> = {
    info: "#aaa",
    warn: "#f5a623",
    error: "#e74c3c",
    user: "#2ecc71",
    ai: "#7bc8f6",
  };

  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        background: "#0d0d0d",
        color: "#ddd",
        minHeight: "100dvh",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ color: "#fff", fontSize: 18, marginBottom: 4 }}>
        ElevenLabs Mic Diagnostic
      </h1>
      <p style={{ color: "#666", fontSize: 12, marginTop: 0, marginBottom: 20 }}>
        MINIMAL config — no game logic, no overrides. Tests raw mic capture only.
      </p>

      {/* Status panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatusBox label="conversation.status" value={statusText} />
        <StatusBox label="isSpeaking" value={isSpeakingText} />
        <StatusBox
          label="Last USER message"
          value={lastUserMessage || "(none yet — speak into mic)"}
          highlight={!!lastUserMessage}
        />
        <StatusBox
          label="Last AI message"
          value={lastAiMessage || "(none yet)"}
        />
      </div>

      {errorText && (
        <div
          style={{
            background: "#3a0000",
            border: "1px solid #e74c3c",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 16,
            color: "#e74c3c",
          }}
        >
          ERROR: {errorText}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => void handleConnect()}
          disabled={statusText === "connected" || statusText === "connecting"}
          style={{
            background: "#1a4a1a",
            color: "#2ecc71",
            border: "1px solid #2ecc71",
            borderRadius: 6,
            padding: "8px 20px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 13,
            opacity:
              statusText === "connected" || statusText === "connecting" ? 0.4 : 1,
          }}
        >
          Connect
        </button>
        <button
          onClick={() => void handleDisconnect()}
          disabled={statusText !== "connected"}
          style={{
            background: "#3a0000",
            color: "#e74c3c",
            border: "1px solid #e74c3c",
            borderRadius: 6,
            padding: "8px 20px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 13,
            opacity: statusText !== "connected" ? 0.4 : 1,
          }}
        >
          Disconnect
        </button>
        <button
          onClick={() => setLogs([])}
          style={{
            background: "#1a1a1a",
            color: "#666",
            border: "1px solid #333",
            borderRadius: 6,
            padding: "8px 20px",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 13,
          }}
        >
          Clear logs
        </button>
      </div>

      {/* Live log */}
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 6,
          padding: 12,
          height: 400,
          overflowY: "auto",
        }}
      >
        {logs.map((entry, i) => (
          <div key={i} style={{ marginBottom: 2, lineHeight: 1.5 }}>
            <span style={{ color: "#444" }}>{entry.ts} </span>
            <span
              style={{
                color: levelColors[entry.level],
                fontWeight:
                  entry.level === "user" || entry.level === "error"
                    ? "bold"
                    : "normal",
              }}
            >
              {entry.text}
            </span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <p style={{ color: "#444", fontSize: 11, marginTop: 12 }}>
        All events are also logged to browser console as [MIC-TEST][...].
        <br />
        Green = user speech detected. Blue = AI message. Orange = warning.
        Red = error.
        <br />
        KEY TEST: if you speak and see a green USER MESSAGE line, mic capture works.
      </p>
    </div>
  );
}

function StatusBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: highlight ? "#0d2a0d" : "#111",
        border: `1px solid ${highlight ? "#2ecc71" : "#222"}`,
        borderRadius: 6,
        padding: "8px 12px",
      }}
    >
      <div style={{ color: "#555", fontSize: 11, marginBottom: 2 }}>{label}</div>
      <div
        style={{
          color: highlight ? "#2ecc71" : "#bbb",
          fontWeight: highlight ? "bold" : "normal",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}
