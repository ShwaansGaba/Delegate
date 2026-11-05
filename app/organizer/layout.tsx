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

  React.useEffect(() => {
    const pageName =
      pathname === "/organizer"
        ? "Dashboard"
        : pathname === "/organizer/conferences"
        ? "My Conferences"
        : pathname.split("/").pop() || "Organizer";
    const capitalized = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${capitalized} - ${event.name || "Delegate"}`;
  }, [pathname, event.name]);

  const navLinks = [
    { name: "Dashboard", href: "/organizer" },
    { name: "Registrations", href: "/organizer/registrations" },
    { name: "Allotment", href: "/organizer/allotment" },
    { name: "Setup", href: "/organizer/setup" },
    { name: "My Conferences", href: "/organizer/conferences" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/organizer") {
      return pathname === "/organizer";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#1560BD] flex flex-col lg:flex-row text-white">
      {/* Mobile & Tablet Top Bar */}
      <div className="lg:hidden bg-[#0F4C96] p-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3 truncate mr-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-1"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="truncate">
            <div className="text-lg font-heading font-extrabold text-white truncate">
              {event.name || "My Conferences"}
            </div>
            <div className="text-[11px] text-white/70 uppercase tracking-wider font-bold">
              Organizer Portal
            </div>
          </div>
        </div>

        {/* Account Menu Button in top right of mobile header */}
        <div className="shrink-0 flex items-center">
          <AccountMenu />
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F4C96] p-4 space-y-2 border-b border-white/20 animate-slideDown">
          {/* Mobile Conference Switcher */}
          {myConferences && myConferences.length > 0 && (
            <div className="mb-3 pb-3 border-b border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block mb-1">
                Active Conference
              </label>
              <select
                value={event.id}
                onChange={async (e) => {
                  if (e.target.value === "__NEW__") {
                    const newC = await createNewConference();
                    if (newC) router.push("/organizer/setup");
                  } else {
                    await selectConference(e.target.value);
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#1560BD] text-white font-heading font-extrabold text-sm rounded-xl p-2.5 outline-none border border-white/30"
              >
                {myConferences.map((ev) => (
                  <option key={ev.id} value={ev.id} className="text-[#0B1B33] bg-white">
                    {ev.name}
                  </option>
                ))}
                <option value="__NEW__" className="text-[#0B1B33] bg-yellow-100 font-bold">
                  + Create New Conference...
                </option>
              </select>
            </div>
          )}

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

      {/* Desktop Darker Blue Sidebar (#0F4C96) */}
      <aside className="hidden lg:flex flex-col w-64 lg:w-72 bg-[#0F4C96] p-6 lg:p-8 flex-shrink-0 min-h-screen">
        {/* Conference Title */}
        <div className="mb-6">
          <Link href="/organizer" className="block">
            <h2 className="text-2xl font-heading font-extrabold text-white leading-tight">
              {event.name || "Delegate MUN"}
            </h2>
          </Link>
          <div className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-1">
            Organizer Portal
          </div>
        </div>

        {/* Conference Switcher for Multi-MUN */}
        {myConferences && myConferences.length > 0 && (
          <div className="mb-6 bg-blue-950/40 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
                Active Conference
              </label>
              <Link
                href="/organizer/conferences"
                className="text-[11px] text-yellow-300 font-bold hover:underline"
              >
                All ({myConferences.length})
              </Link>
            </div>
            <select
              value={event.id}
              onChange={async (e) => {
                if (e.target.value === "__NEW__") {
                  const newC = await createNewConference();
                  if (newC) router.push("/organizer/setup");
                } else {
                  await selectConference(e.target.value);
                }
              }}
              className="w-full bg-[#1560BD] text-white font-heading font-bold text-xs rounded-xl p-2 outline-none border border-white/30 cursor-pointer"
            >
              {myConferences.map((ev) => (
                <option key={ev.id} value={ev.id} className="text-[#0B1B33] bg-white">
                  {ev.name}
                </option>
              ))}
              <option value="__NEW__" className="text-[#0B1B33] bg-yellow-100 font-bold">
                + New Conference...
              </option>
            </select>
          </div>
        )}

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

        {/* Desktop Sidebar Footer */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <Link
            href={`/c/?id=${event.slug || event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-yellow-300 hover:underline font-bold"
          >
            ↗ Open public registration portal
          </Link>
          <div className="text-xs text-white/50 font-medium">
            Multi-Tenant Conference Platform
          </div>
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
