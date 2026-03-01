"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { FogLayer } from "@/components/ui/FogLayer";
import { NavigationChrome } from "@/components/ui/NavigationChrome";
import { FullScreenMenu } from "@/components/ui/FullScreenMenu";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { STORIES, COMING_SOON_COUNT } from "@/lib/story-data";

const CARD_HOVER_CSS = [
  ".story-card { border: 1px solid transparent; transition: border-color 0.3s ease; }",
  ".story-card:hover { border-color: var(--accent); }",
  ".story-card .card-hover { opacity: 0; transition: opacity 0.3s ease; }",
  ".story-card:hover .card-hover { opacity: 1; }",
  "@media (max-width: 1023px) { .story-card .card-hover { opacity: 1; } }",
  "@media (min-width: 1024px) { .stories-grid { grid-template-columns: repeat(2, 1fr) !important; } }",
  "@media (max-width: 1023px) { .stories-section { padding-left: var(--space-sm) !important; padding-right: var(--space-sm) !important; } }",
  "@media (max-width: 767px) { .story-card { max-height: 65vh; } }",
  "@keyframes scroll-hint { 0%, 100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 0.6; transform: translateY(6px); } }",
  ".scroll-hint { animation: scroll-hint 2.5s ease-in-out infinite; }",
].join("\n");

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const stories = STORIES.filter((s) => !s.comingSoon);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: CARD_HOVER_CSS,
        }}
      />

      <main id="main-content">
        {/* Section 1: Hero — full viewport */}
        <section
          style={{
            position: "relative",
            width: "100%",
            height: "100dvh",
            overflow: "hidden",
            background: "var(--black)",
          }}
        >
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

          <FogLayer />

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
            <style
              dangerouslySetInnerHTML={{
                __html:
                  "@media(max-width:400px){.landing-title{letter-spacing:2px!important}}",
              }}
            />
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

          {/* Scroll-down indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.4 }}
            className="scroll-hint"
            style={{
              position: "absolute",
              bottom: "var(--space-lg)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-xs)",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            onClick={() => {
              document
                .getElementById("stories")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <svg
              width="20"
              height="12"
              viewBox="0 0 20 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M1 1L10 10L19 1"
                stroke="var(--muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </section>

        {/* Section 2: Stories Catalogue */}
        <section
          id="stories"
          className="stories-section"
          style={{
            padding: "var(--space-xl) var(--space-lg)",
            background: "var(--black)",
            minHeight: "100dvh",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--type-section)",
              color: "var(--white)",
              letterSpacing: "1px",
              lineHeight: 1,
              marginTop: 0,
              marginBottom: "var(--space-md)",
            }}
          >
            STORIES
          </h2>

          <div
            className="stories-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, 1fr)",
              gap: "var(--space-md)",
            }}
          >
            {stories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <TransitionLink
                  href={`/play?story=${story.id}`}
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <div
                    className="story-card"
                    style={{
                      position: "relative",
                      aspectRatio:
                        story.imageOrientation === "portrait"
                          ? "2 / 3"
                          : "16 / 9",
                      overflow: "hidden",
                      borderRadius: 0,
                      background: "var(--black)",
                    }}
                  >
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, transparent)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "var(--space-md)",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-literary)",
                          fontSize: "var(--type-title)",
                          color: "var(--white)",
                          fontWeight: 400,
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {story.title}
                      </h3>
                      <p
                        className="card-hover"
                        style={{
                          fontFamily: "var(--font-literary)",
                          fontSize: "var(--type-body)",
                          color: "var(--muted)",
                          fontStyle: "italic",
                          margin: 0,
                          marginTop: "var(--space-xs)",
                        }}
                      >
                        {story.hook}
                      </p>
                      <p
                        className="card-hover"
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: "var(--type-caption)",
                          color: "var(--muted)",
                          margin: 0,
                          marginTop: "var(--space-xs)",
                        }}
                      >
                        {story.genre} · {story.duration}
                      </p>
                    </div>
                  </div>
                </TransitionLink>
              </motion.div>
            ))}

            {/* Coming Soon placeholders */}
            {Array.from({ length: COMING_SOON_COUNT }).map((_, i) => (
              <div
                key={`coming-soon-${i}`}
                style={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  borderRadius: 0,
                  border: "1px dashed var(--muted)",
                  background: "var(--black)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-sm)",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ opacity: 0.4 }}
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="1"
                    stroke="var(--muted)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="var(--muted)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16" r="1.5" fill="var(--muted)" />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "var(--type-caption)",
                    color: "var(--muted)",
                    letterSpacing: "1px",
                  }}
                >
                  more darkness coming
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: "var(--space-xl) 0",
            textAlign: "center",
            background: "var(--black)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--type-ui)",
              color: "var(--muted)",
              opacity: 0.3,
              letterSpacing: "3px",
            }}
          >
            INNERPLAY
          </span>
        </footer>
      </main>

      {/* Navigation chrome */}
      <NavigationChrome
        variant="landing"
        onMenuToggle={() => setMenuOpen((prev) => !prev)}
        menuOpen={menuOpen}
      />

      {/* Full-screen menu */}
      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
