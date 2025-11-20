import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // Temporarily disabled for build in sandbox
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "sonner";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });

export const metadata: Metadata = {
  title: "Campus GTM - AI-Powered Student Ambassador Platform",
  description: "A Notion-style AI Copilot that automates Student Ambassador programs using Google Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased tracking-[-0.01em]">
          {children}
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
