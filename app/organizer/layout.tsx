"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { Menu, X, Plus } from "lucide-react";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { event, myConferences, selectConference, createNewConference } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  const isSetup = currentPath.includes("/organizer/setup");
  const isConferencesHub = currentPath.includes("/organizer/conferences");
  const isStandalone = isConferencesHub || isSetup;

  React.useEffect(() => {
    const pageName =
      pathname === "/organizer"
        ? "Dashboard"
        : pathname === "/organizer/conferences"
        ? "My Conferences"
        : pathname === "/organizer/setup"
        ? "Conference Setup"
        : pathname === "/organizer/account"
        ? "Account & Branding"
        : pathname.split("/").pop() || "Organizer";
    const capitalized = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${capitalized} - ${event.name || "Delegate"}`;
  }, [pathname, event.name]);

  const navLinks = [
    { name: "Dashboard", href: "/organizer" },
    { name: "Registrations", href: "/organizer/registrations" },
    { name: "Allotment", href: "/organizer/allotment" },
    { name: "Setup", href: "/organizer/setup?step=basics" },
    { name: "Account", href: "/organizer/account" },
  ];

  const isLinkActive = (href: string) => {
    const cleanHref = href.split("?")[0];
    if (cleanHref === "/organizer") {
      return pathname === "/organizer" || pathname === "/Delegate/organizer";
    }
    return pathname.includes(cleanHref);
  };

  // If on My Conferences hub OR during Setup: NO SIDEBAR IS SHOWN
  if (isStandalone) {
    return (
      <div className="min-h-screen theme-bg-primary flex flex-col text-white transition-colors duration-300">
        <header className="theme-bg-sidebar border-b border-white/10 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {isSetup && (
              <Link
                href="/organizer/conferences"
                className="text-xs sm:text-sm font-heading font-extrabold text-yellow-300 hover:text-yellow-200 uppercase tracking-wider py-1.5 px-3 rounded-xl border border-yellow-300/40 hover:border-yellow-300/80 transition-colors flex items-center gap-1.5 mr-1"
                title="Return to My Conferences"
              >
                <span>← My Conferences</span>
              </Link>
            )}
            <Link href="/organizer/conferences" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white text-[#1560BD] font-heading font-extrabold flex items-center justify-center text-lg shadow-sm">
                UN
              </div>
              <div>
                <div className="text-xl font-heading font-extrabold text-white leading-tight">
                  Delegate
                </div>
                <div className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">
                  {isSetup ? "Conference Setup" : "My Conferences"}
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <AccountMenu />
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto page-transition">
          {children}
        </main>
      </div>
    );
  }

  // Inside an entered conference workspace: SIDEBAR APPEARS
  return (
    <div className="min-h-screen theme-bg-primary flex flex-col lg:flex-row text-white transition-colors duration-300">
      {/* Mobile & Tablet Top Bar */}
      <div className="lg:hidden theme-bg-sidebar p-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-3 truncate mr-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="truncate">
            <div className="text-lg font-heading font-extrabold text-white truncate">
              {event.name || "Conference Workspace"}
            </div>
            <Link
              href="/organizer/conferences"
              className="text-[11px] text-yellow-300 uppercase tracking-wider font-bold hover:underline"
            >
              ← My Conferences
            </Link>
          </div>
        </div>

        {/* Account Menu Button in top right of mobile header */}
        <div className="shrink-0 flex items-center">
          <AccountMenu />
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden theme-bg-sidebar p-4 space-y-2 border-b border-white/20 animate-slideDown">
          <Link
            href="/organizer/conferences"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2 text-sm text-yellow-300 font-bold uppercase tracking-wider border-b border-white/10 mb-2"
          >
            ← Back to all conferences
          </Link>

          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-5 py-3 rounded-2xl text-lg font-heading font-extrabold transition-colors ${
                  active ? "bg-white text-[#0B1B33]" : "text-white hover:bg-white/10"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Darker Blue Sidebar (#0F4C96) with Active Conference Name on Top */}
      <aside className="hidden lg:flex flex-col w-64 lg:w-72 theme-bg-sidebar p-6 lg:p-8 flex-shrink-0 min-h-screen transition-colors duration-300">
        {/* Back to My Conferences Button */}
        <Link
          href="/organizer/conferences"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-300 hover:text-yellow-200 uppercase tracking-wider mb-4 transition-colors"
        >
          ← My Conferences
        </Link>

        {/* Active Conference Name Prominently Displayed on Top */}
        <div className="mb-6 pb-4 border-b border-white/10">
          <Link href="/organizer" className="block">
            <h2 className="text-2xl font-heading font-extrabold text-white leading-tight break-words">
              {event.name || "Conference"}
            </h2>
          </Link>
          {event.status === "published" && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Published
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items styled as white active pills */}
        <nav className="space-y-2.5 flex-1">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-5 py-3.5 rounded-2xl text-lg font-heading font-extrabold transition-all duration-200 hover:translate-x-1.5 active:scale-95 select-none ${
                  active
                    ? "bg-white text-[#0B1B33]"
                    : "text-white hover:bg-white/10 active:bg-white/20"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sidebar Footer: Public Registration Link ONLY IF PUBLISHED */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          {event.status === "published" ? (
            <Link
              href={`/c/?id=${event.slug || event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-yellow-300 hover:underline font-bold"
            >
              ↗ Open public registration portal
            </Link>
          ) : (
            <div className="text-xs text-yellow-200/90 font-bold bg-yellow-500/15 p-2.5 rounded-xl border border-yellow-500/25">
              Registration link locked until published
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto page-transition relative">
        {/* Desktop Top-Right Overlay Account Button */}
        <div className="hidden lg:flex justify-end mb-4">
          <AccountMenu />
        </div>

        {children}
      </main>
    </div>
  );
}
