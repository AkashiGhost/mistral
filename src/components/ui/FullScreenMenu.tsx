"use client";

import { AnimatePresence, motion } from "motion/react";

interface FullScreenMenuProps {
  open: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { label: "STORIES", href: "/stories", accent: false },
  { label: "ABOUT", href: "/about", accent: false },
  { label: "BEGIN", href: "/play?story=the-last-session", accent: true },
];

export function FullScreenMenu({ open, onClose }: FullScreenMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="menu-items"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--black)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-xl)",
          }}
        >
          {/* Short screen: tighter menu gap */}
          <style>{`@media(max-height:700px){.menu-items{gap:var(--space-lg)!important}}`}</style>

          {/* Close button — top-right */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: "calc(var(--space-sm) + env(safe-area-inset-top, 0px))",
              right: "var(--space-sm)",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--type-ui)",
              color: "var(--white)",
              background: "none",
              border: "none",
              cursor: "pointer",
              letterSpacing: "2px",
              minHeight: "var(--touch-min)",
              minWidth: "var(--touch-min)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            CLOSE
          </button>

          {/* Menu items */}
          {MENU_ITEMS.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={onClose}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--type-hero)",
                color: item.accent ? "var(--accent)" : "var(--white)",
                textDecoration: "none",
                lineHeight: 1,
                letterSpacing: "4px",
              }}
            >
              {item.label}
            </motion.a>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
