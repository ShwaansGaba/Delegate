"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { User, Settings, Layers, LogOut, X, Check } from "lucide-react";

export function AccountMenu() {
  const router = useRouter();
  const { user, signOut } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [organizerName, setOrganizerName] = useState("Secretary-General");
  const [email, setEmail] = useState(user?.email || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowSettingsModal(false);
    }, 1200);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Round Account Button - NO email displayed */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Organizer Account"
        className="w-10 h-10 rounded-full bg-[#0F4C96] hover:bg-[#0c3c77] border-2 border-white/20 text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 active:scale-95 shadow-sm"
      >
        <User className="w-5 h-5 text-white" />
      </button>

      {/* Dropdown Menu - NO email displayed in button or header */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white text-[#0B1B33] rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 animate-pop">
          <div className="px-4 py-2 border-b border-neutral-100">
            <span className="text-xs font-heading font-extrabold text-neutral-500 uppercase tracking-wider block">
              Organizer Account
            </span>
          </div>

          <Link
            href="/organizer/conferences"
            onClick={() => setIsOpen(false)}
            className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 text-sm font-heading font-bold text-[#0B1B33] flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#1560BD]" />
            <span>My conferences</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setShowSettingsModal(true);
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 text-sm font-heading font-bold text-[#0B1B33] flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-neutral-600" />
            <span>Account settings</span>
          </button>

          <div className="border-t border-neutral-100 my-1"></div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm font-heading font-bold text-red-600 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Sign out</span>
          </button>
        </div>
      )}

      {/* Account Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-[#0B1B33] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                Account Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                  Organizer / Secretariat Title
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-neutral-200 text-base font-bold outline-none focus:border-[#1560BD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-neutral-200 text-base font-bold outline-none focus:border-[#1560BD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                  Update Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (optional)"
                  className="w-full p-3.5 rounded-xl border border-neutral-200 text-base font-bold outline-none focus:border-[#1560BD]"
                />
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Settings saved successfully
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1560BD] hover:bg-[#0F4C96] text-white px-5 py-2.5 rounded-xl font-heading font-extrabold text-sm transition-colors cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
