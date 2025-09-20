import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavLayout from "./nav-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegalEase × Gemini - AI-Powered Legal Document Analysis",
  description: "Transform complex legal documents with Google's Gemini AI and Vertex AI ecosystem. Get instant summaries using Google Text-to-Speech, multilingual support with Translation API, and intelligent Q&A powered by the world's most advanced language model.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavLayout>
          {children}
        </NavLayout>
      </body>
    </html>
  );
}
