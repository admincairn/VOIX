import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getWorkspaceState } from "@/lib/voix/workspace-repository";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voix",
  description:
    "Voix helps US B2B SaaS teams collect customer proof and publish it where it lifts conversion.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = await getWorkspaceState();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-950">
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
