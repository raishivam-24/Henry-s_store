
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


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
