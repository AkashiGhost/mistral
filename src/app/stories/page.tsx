"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { FogLayer } from "@/components/ui/FogLayer";
import { NavigationChrome } from "@/components/ui/NavigationChrome";
import { FullScreenMenu } from "@/components/ui/FullScreenMenu";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { STORIES, COMING_SOON_COUNT, getFeaturedStory } from "@/lib/story-data";

const CARD_HOVER_CSS = [
  ".story-card { border: 1px solid transparent; transition: border-color 0.3s ease; }",
  ".story-card:hover { border-color: var(--accent); }",
  ".story-card .card-hover { opacity: 0; transition: opacity 0.3s ease; }",
  ".story-card:hover .card-hover { opacity: 1; }",
  "@media (max-width: 1023px) { .story-card .card-hover { opacity: 1; } }",
  "@media (min-width: 1024px) { .stories-grid { grid-template-columns: repeat(2, 1fr) !important; } }",
  "@media (max-width: 1023px) { .stories-section { padding-left: var(--space-sm) !important; padding-right: var(--space-sm) !important; } }",
  "@media (max-width: 767px) { .hero-content { padding: var(--space-md) !important; } }",
  "@media (max-width: 767px) { .story-card { max-height: 65vh; } }",
].join("\n");

export default function StoriesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const featured = getFeaturedStory();
  const stories = STORIES.filter((s) => !s.comingSoon);

  return (
    <>
      {/* Card hover styles */}
      <style dangerouslySetInnerHTML={{ __html: CARD_HOVER_CSS }} />

      <main id="main-content">

        {/* Featured Hero (100dvh) */}
        <section
          style={{
            position: "relative",
            width: "100%",
            height: "100dvh",
            overflow: "hidden",
            background: "var(--black)",
          }}
        >
          <Image
            src={featured.image}
            alt={featured.title}
            fill
            sizes="100vw"
            style={{ objectFit: "cover", opacity: 0.4 }}
            priority
          />

          <FogLayer />

          <div
            className="hero-content"
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              padding: "var(--space-lg)",
            }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              style={{
                fontFamily: "var(--font-literary)",
                fontSize: "var(--type-lead)",
                color: "var(--white)",
                fontWeight: 300,
                lineHeight: 1.3,
                maxWidth: "20ch",
                margin: 0,
              }}
            >
              {featured.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontFamily: "var(--font-literary)",
                fontSize: "var(--type-body)",
                color: "var(--muted)",
                fontStyle: "italic",
                marginTop: "var(--space-sm)",
                marginBottom: 0,
                maxWidth: "32ch",
              }}
            >
              {featured.hook}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "var(--type-caption)",
                color: "var(--muted)",
                marginTop: "var(--space-xs)",
                marginBottom: 0,
              }}
            >
              {featured.genre} · {featured.duration}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              style={{ marginTop: "var(--space-md)" }}
            >
              <TransitionLink
                href={`/play?story=${featured.id}`}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--type-ui)",
                  color: "var(--accent)",
                  letterSpacing: "3px",
                  display: "inline-block",
                  textDecoration: "none",
                }}
              >
                PLAY
              </TransitionLink>
            </motion.div>
          </div>
        </section>

        {/* Stories Grid */}
        <section
          className="stories-section"
          style={{
            padding: "var(--space-lg)",
            background: "var(--black)",
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
                      aspectRatio: "2 / 3",
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
                        background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, transparent)",
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
                  aspectRatio: "2 / 3",
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

      <NavigationChrome
        variant="catalogue"
        onMenuToggle={() => setMenuOpen((prev) => !prev)}
        menuOpen={menuOpen}
      />
      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
