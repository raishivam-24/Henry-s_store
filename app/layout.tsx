import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Henry's Store | Skincare & Wellness",
  description:
    "Discover effective skincare and wellness essentials at Henry's Store.",
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