import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Email Routing Manager - Kelola Email Cloudflare",
  description: "Aplikasi modern untuk mengelola email routing Cloudflare dengan mudah dan aman",
  keywords: ["Email Routing", "Cloudflare", "Email Manager", "Next.js", "TypeScript"],
  authors: [{ name: "Email Routing Manager" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Email Routing Manager",
    description: "Kelola email routing Cloudflare dengan antarmuka modern",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Email Routing Manager",
    description: "Kelola email routing Cloudflare dengan antarmuka modern",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
          <SonnerToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
