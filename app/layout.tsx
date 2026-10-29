
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Henry's Store | Skincare & Wellness",
    template: "%s | Henry's Store",
  },
  description:
    "Discover skincare and wellness essentials at Henry's Store. Explore products for your daily skincare routine.",
  applicationName: "Henry's Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
  <CartProvider>
    <Header />
    {children}
    <Footer />
  </CartProvider>
</body>
    </html>
  );
}
