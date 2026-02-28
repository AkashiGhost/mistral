"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

interface StoryCard {
  id: string;
  title: string;
  hook: string;
  image: string;
}

const STORIES: StoryCard[] = [
  {
    id: "the-lighthouse",
    title: "The Lighthouse",
    hook: "A storm. A radio. A voice that knows your name.",
    image: "/images/stories/the-lighthouse/card.webp",
  },
  {
    id: "room-4b",
    title: "Room 4B",
    hook: "The door won't stay locked. The chart has your name.",
    image: "/images/stories/room-4b/card.webp",
  },
  {
    id: "the-last-session",
    title: "The Last Session",
    hook: "Your last patient has arrived. She knows too much.",
    image: "/images/stories/the-last-session/card.webp",
  },
];

export default function Home() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelect = (storyId: string) => {
    setLoadingId(storyId);
    router.push(`/play?story=${storyId}`);
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100dvh",
        padding: "var(--space-6) var(--space-4)",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "var(--space-8)",
          marginTop: "var(--space-8)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--font-size-2xl)",
            fontWeight: 400,
            letterSpacing: "0.05em",
            marginBottom: "var(--space-2)",
            color: "var(--color-text-primary)",
          }}
        >
          InnerPlay
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-sm)",
            fontFamily: "var(--font-ui)",
            letterSpacing: "0.04em",
          }}
        >
          close your eyes. listen.
        </p>
      </div>

      {/* Story Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          width: "100%",
          maxWidth: 440,
        }}
      >
        {STORIES.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={() => handleSelect(story.id)}
            disabled={loadingId !== null}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-bg-elevated)",
              background: "var(--color-bg-elevated)",
              cursor: loadingId ? "wait" : "pointer",
              padding: 0,
              textAlign: "left",
              transition: "var(--transition-normal)",
              opacity: loadingId && loadingId !== story.id ? 0.4 : 1,
            }}
          >
            {/* Card Image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                overflow: "hidden",
              }}
            >
              <Image
                src={story.image}
                alt={story.title}
                fill
                sizes="(max-width: 440px) 100vw, 440px"
                style={{ objectFit: "cover" }}
                priority
              />
              {/* Gradient overlay for text readability */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                }}
              />
              {/* Title + hook over image */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "var(--space-4)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: 400,
                    color: "var(--color-text-primary)",
                    margin: 0,
                    marginBottom: "var(--space-1)",
                  }}
                >
                  {story.title}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  {story.hook}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p
        style={{
          marginTop: "var(--space-8)",
          color: "var(--color-text-muted)",
          fontSize: "var(--font-size-xs)",
          fontFamily: "var(--font-ui)",
          opacity: 0.4,
          letterSpacing: "0.04em",
        }}
      >
        headphones recommended
      </p>
    </main>
  );
}
