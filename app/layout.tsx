import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Delegate",
    default: "Delegate | Student Events & MUN Platform",
  },
  description: "Official registration, allotment, and conference management platform for student events and Model United Nations.",
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
