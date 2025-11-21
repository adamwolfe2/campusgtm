import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Campus GTM - AI-Powered Campus Marketing",
  description: "Track ambassadors, grow your campus presence, and build your student network with AI-powered tools.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
