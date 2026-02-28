import type { Metadata } from "next";
import "@/styles/globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
