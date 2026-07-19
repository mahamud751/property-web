import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Compare homes",
  description: "Side-by-side property comparison with room alignment and AI-style insights.",
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="container-page pt-32 text-fog">Loading compare…</div>}>{children}</Suspense>;
}
