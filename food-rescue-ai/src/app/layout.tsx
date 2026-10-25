import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Food Rescue AI — Good food. Better futures.",
  description:
    "Connect surplus food with the people who need it. Restaurant donations, community pickups, and measurable impact.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
