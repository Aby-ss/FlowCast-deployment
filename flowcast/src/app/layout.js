import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FlowCast",
  description:
    "FlowCast is an AI-powered tool that turns long-form YouTube videos into high-performing posts for LinkedIn, Instagram, X, and Threads — in seconds. Paste your video link, and FlowCast automatically transcribes, detects key moments, and generates platform-native content like tweet threads, captions, and carousels.\n\nNo more manual repurposing — just fast, scroll-stopping content. Ideal for creators, coaches, and marketers looking to grow with less work.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
