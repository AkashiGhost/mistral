"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FogLayer } from "@/components/ui/FogLayer";
import { NavigationChrome } from "@/components/ui/NavigationChrome";
import { FullScreenMenu } from "@/components/ui/FullScreenMenu";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main
      id="main-content"
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--black)",
      }}
    >
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.3,
          zIndex: 0,
        }}
      >
        <source src="/video/landing-bg.mp4" type="video/mp4" />
      </video>

      {/* Fog overlay */}
      <FogLayer />

      {/* Center content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
          padding: "var(--space-sm)",
        }}
      >
        <style>{`@media(max-width:400px){.landing-title{letter-spacing:2px!important}}`}</style>
        <motion.h1
          className="landing-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--type-hero)",
            color: "var(--white)",
            lineHeight: 1,
            letterSpacing: "6px",
            margin: 0,
          }}
        >
          INNERPLAY
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
          style={{
            fontFamily: "var(--font-literary)",
            fontSize: "var(--type-body)",
            color: "var(--muted)",
            fontStyle: "italic",
            margin: 0,
            marginBlockStart: "var(--space-sm)",
          }}
        >
          close your eyes
        </motion.p>
      </div>

      {/* Navigation chrome */}
      <NavigationChrome
        variant="landing"
        onMenuToggle={() => setMenuOpen((prev) => !prev)}
        menuOpen={menuOpen}
      />

      {/* Full-screen menu */}
      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </main>
  );
}
