"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { User } from "lucide-react";

export function AccountMenu() {
  const pathname = usePathname();
  const { user } = useApp();

  if (!user) return null;

  const isActive = pathname === "/organizer/account";

  return (
    <Link
      href="/organizer/account"
      aria-label="Organizer Account Settings"
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 active:scale-95 shadow-sm border-2 ${
        isActive
          ? "bg-white text-[#0B1B33] border-white ring-2 ring-yellow-400"
          : "theme-bg-sidebar hover:opacity-90 border-white/20 text-white"
      }`}
      title="Account & Branding Settings"
    >
      <User className={`w-5 h-5 ${isActive ? "text-[#0B1B33]" : "text-white"}`} />
    </Link>
  );
}
