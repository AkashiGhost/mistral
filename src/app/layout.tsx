import type { Metadata } from "next";
import { Bebas_Neue, Cormorant_Garamond } from "next/font/google";
import "@/styles/globals.css";
import { TransitionProvider } from "@/context/TransitionContext";
import { CustomCursor } from "@/components/ui/CustomCursor";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InnerPlay — Voice-Based Immersive Games",
  description:
    "Close your eyes. Speak. Play. Real-time AI narration meets cinematic sound design in a voice-only immersive horror game powered by Mistral AI + ElevenLabs.",
  openGraph: {
    title: "InnerPlay",
    description:
      "An AI therapist who knows too much. A lighthouse keeper at sea. A locked hospital room. Pick a story. Close your eyes.",
    url: "https://mistral-lac.vercel.app",
    siteName: "InnerPlay",
    type: "website",
    images: [
      {
        url: "https://mistral-lac.vercel.app/images/stories/the-last-session/card.webp",
        width: 1200,
        height: 675,
        alt: "InnerPlay — The Last Session",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InnerPlay — Close Your Eyes. Speak. Play.",
    description:
      "Voice-only immersive horror games powered by Mistral AI. No screen. No UI. Just you, headphones, and your imagination.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${cormorantGaramond.variable}`}>
      <body>
        <a
          href="#main-content"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
          onFocus={(e) => {
            e.currentTarget.style.position = "static";
            e.currentTarget.style.width = "auto";
            e.currentTarget.style.height = "auto";
          }}
        >
          Skip to content
        </a>
        <TransitionProvider>
          <CustomCursor />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
