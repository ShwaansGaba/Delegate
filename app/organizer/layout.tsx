"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Menu, X } from "lucide-react";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { event, user, signOut } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const pageName =
      pathname === "/organizer"
        ? "Dashboard"
        : pathname.split("/").pop() || "Organizer";
    const capitalized = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${capitalized} - ${event.name || "Delegate"}`;
  }, [pathname, event.name]);

  const navLinks = [
    { name: "Dashboard", href: "/organizer" },
    { name: "Registrations", href: "/organizer/registrations" },
    { name: "Allotment", href: "/organizer/allotment" },
    { name: "Setup", href: "/organizer/setup" },
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
      <div className="lg:hidden bg-[#0F4C96] p-4 flex items-center justify-between border-b border-white/10">
        <div>
          <div className="text-xl font-heading font-extrabold text-white">
            {event.name}
          </div>
          <div className="text-xs text-white/70 uppercase tracking-wider font-bold">
            Organizer Portal
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile & Tablet Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F4C96] p-4 space-y-2 border-b border-white/20">
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
          <div className="pt-2 border-t border-white/10 space-y-2">
            {user && (
              <div className="px-5 py-2 text-sm text-white/90">
                Signed in as <span className="font-bold text-white">{user.email}</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="block text-yellow-300 font-bold underline mt-1"
                >
                  Sign out
                </button>
              </div>
            )}
            <Link
              href="/"
              className="block px-5 py-2 text-base text-white/80 hover:text-white font-medium"
            >
              ← Back to conference setup
            </Link>
          </div>
        </div>
      )}

      {/* Desktop Darker Blue Sidebar (#0F4C96) matching Page 22-28 */}
      <aside className="hidden lg:flex flex-col w-64 lg:w-72 bg-[#0F4C96] p-6 lg:p-8 flex-shrink-0 min-h-screen">
        {/* Conference Title */}
        <div className="mb-10">
          <Link href="/organizer" className="block">
            <h2 className="text-3xl font-heading font-extrabold text-white leading-tight">
              {event.name.split(" ")[0]} <br />
              {event.name.split(" ").slice(1).join(" ")}
            </h2>
          </Link>
        </div>

        {/* Navigation Items styled as white active pills */}
        <nav className="space-y-3 flex-1">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-6 py-4 rounded-2xl text-xl font-heading font-extrabold transition-all duration-200 hover:translate-x-1.5 active:scale-95 select-none ${
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

        {/* Footer info & link */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          {user && (
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-xs text-white/70 font-semibold uppercase">Signed in as</div>
              <div className="text-sm text-white font-bold truncate">{user.email}</div>
              <button
                type="button"
                onClick={signOut}
                className="text-xs text-yellow-300 hover:underline mt-1 font-bold"
              >
                Sign out
              </button>
            </div>
          )}
          <Link
            href="/"
            className="block text-base text-white/80 hover:text-white underline font-medium hover:translate-x-1 transition-transform"
          >
            ← View conference setup
          </Link>
          <div className="text-sm text-white/60 font-medium">
            Delegate Conference Suite v1.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto page-transition">
        {children}
      </main>
    </div>
  );
}
