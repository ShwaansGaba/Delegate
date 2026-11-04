import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Yamuna MUN 2026 | Student Events Platform",
  description: "Official registration and allotment portal for Yamuna Model United Nations 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1560BD] text-white font-body selection:bg-[#FFD23F] selection:text-[#0B1B33]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
