"use client";

import { useGame } from "@/context/GameContext";
import { motion } from "motion/react";

export function ChoiceDisplay() {
  const { activeChoice, selectChoice } = useGame();

  if (!activeChoice) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `.choice-btn:hover { border-color: var(--accent) !important; }` }} />
      <div
        className="fade-in"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: "auto",
          maxHeight: "50vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "var(--space-sm)",
          padding: "var(--space-md)",
          paddingBottom: "calc(var(--space-md) + env(safe-area-inset-bottom, 0px))",
          background:
            "linear-gradient(to top, var(--black) 60%, transparent)",
        }}
      >
        {activeChoice.options.map((option, i) => (
          <motion.button
            key={option.id}
            className="choice-btn"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            onClick={() => selectChoice(activeChoice.beatId, option.id)}
            style={{
              width: "100%",
              maxWidth: 400,
              minHeight: "var(--touch-min)",
              padding: "var(--space-sm) var(--space-md)",
              border: "1px solid var(--muted)",
              borderRadius: 0,
              color: "var(--white)",
              fontSize: "var(--type-body)",
              fontFamily: "var(--font-literary)",
              backgroundColor: "transparent",
              textAlign: "left",
              transition: "var(--transition-normal)",
              cursor: "pointer",
            }}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </>
  );
}
