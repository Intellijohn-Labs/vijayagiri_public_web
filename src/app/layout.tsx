import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Vijayagiri Auto Agencies – Authorized Yamaha Dealer Network, Ernakulam",
  description:
    "Vijayagiri Auto Agencies, authorized Yamaha dealer network with 6 showrooms across Ernakulam since 1991. Explore the R15M, MT-15 and Aerox, book a test ride and find your nearest showroom.",
};

export const viewport: Viewport = { themeColor: "#04060c", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${barlow.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
