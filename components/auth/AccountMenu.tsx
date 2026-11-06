"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, BackgroundEffect } from "@/lib/AppContext";
import { User, Settings, Layers, LogOut, X, Check, Palette, Sparkles } from "lucide-react";

const PRIMARY_PRESETS = [
  { name: "UN Blue", hex: "#1560BD" },
  { name: "Midnight Navy", hex: "#0F172A" },
  { name: "Emerald Forest", hex: "#059669" },
  { name: "Royal Purple", hex: "#7C3AED" },
  { name: "Crimson Red", hex: "#DC2626" },
  { name: "Deep Teal", hex: "#0D9488" },
  { name: "Charcoal", hex: "#334155" },
];

const SECONDARY_PRESETS = [
  { name: "Yellow Gold", hex: "#FFD23F" },
  { name: "Sky Blue", hex: "#38BDF8" },
  { name: "Coral Rose", hex: "#F43F5E" },
  { name: "Sunset Amber", hex: "#F59E0B" },
  { name: "Electric Lime", hex: "#84CC16" },
  { name: "Neon Cyan", hex: "#06B6D4" },
];

const BACKGROUND_EFFECTS: { id: BackgroundEffect; label: string; desc: string }[] = [
  { id: "none", label: "Clean Solid", desc: "Minimalist solid background" },
  { id: "polka-dots", label: "Polka Dots", desc: "Classic dotted coordinate pattern" },
  { id: "lines", label: "Diagonal Lines", desc: "Subtle dynamic striped texture" },
  { id: "grid", label: "Blueprint Grid", desc: "Structured architectural grid" },
  { id: "blur", label: "Luminous Blur", desc: "Ambient soft glowing gradients" },
];

export function AccountMenu() {
  const router = useRouter();
  const { user, signOut, theme, updateTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [organizerName, setOrganizerName] = useState("Secretary-General");
  const [email, setEmail] = useState(user?.email || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Theme editing state
  const [tempPrimary, setTempPrimary] = useState(theme.primaryColor);
  const [tempSecondary, setTempSecondary] = useState(theme.secondaryColor);
  const [tempEffect, setTempEffect] = useState<BackgroundEffect>(theme.backgroundEffect);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    setTempPrimary(theme.primaryColor);
    setTempSecondary(theme.secondaryColor);
    setTempEffect(theme.backgroundEffect);
  }, [theme, showSettingsModal]);

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
    updateTheme({
      primaryColor: tempPrimary,
      secondaryColor: tempSecondary,
      backgroundEffect: tempEffect,
    });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-[#0B1B33] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                  Account & Appearance
                </h3>
                <p className="text-neutral-500 text-sm font-medium mt-0.5">
                  Customize your organizer profile, theme colors, and visual effects.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-full cursor-pointer text-2xl font-bold"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Profile Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-heading font-extrabold text-[#0B1B33] uppercase tracking-wider">
                  Profile Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                      Secretariat Title
                    </label>
                    <input
                      type="text"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-bold outline-none focus:border-[#1560BD]"
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
                      className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-bold outline-none focus:border-[#1560BD]"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Customization */}
              <div className="space-y-5 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#1560BD]" />
                  <h4 className="text-sm font-heading font-extrabold text-[#0B1B33] uppercase tracking-wider">
                    Theme Colors & Visuals
                  </h4>
                </div>

                {/* Primary Color Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase font-extrabold text-neutral-600 tracking-wider">
                      Primary Workspace Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tempPrimary}
                        onChange={(e) => setTempPrimary(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                        title="Choose custom primary color"
                      />
                      <span className="text-xs font-mono font-bold text-neutral-500 uppercase">
                        {tempPrimary}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRIMARY_PRESETS.map((col) => {
                      const isSelected = tempPrimary.toLowerCase() === col.hex.toLowerCase();
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setTempPrimary(col.hex)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#0B1B33] bg-neutral-100 ring-2 ring-blue-500/30"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary / Accent Color Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase font-extrabold text-neutral-600 tracking-wider">
                      Secondary / Accent Button Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={tempSecondary}
                        onChange={(e) => setTempSecondary(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                        title="Choose custom secondary color"
                      />
                      <span className="text-xs font-mono font-bold text-neutral-500 uppercase">
                        {tempSecondary}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_PRESETS.map((col) => {
                      const isSelected = tempSecondary.toLowerCase() === col.hex.toLowerCase();
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setTempSecondary(col.hex)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#0B1B33] bg-neutral-100 ring-2 ring-yellow-400/40"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Background Effects */}
                <div>
                  <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-2 tracking-wider">
                    Background Texture & Effect
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {BACKGROUND_EFFECTS.map((eff) => {
                      const isSelected = tempEffect === eff.id;
                      return (
                        <button
                          key={eff.id}
                          type="button"
                          onClick={() => setTempEffect(eff.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#1560BD] bg-blue-50/70"
                              : "border-neutral-200 hover:border-neutral-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-extrabold text-sm text-[#0B1B33]">
                              {eff.label}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-[#1560BD]" />}
                          </div>
                          <span className="text-xs text-neutral-500 block mt-0.5">
                            {eff.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview Card */}
                <div>
                  <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1.5 tracking-wider">
                    Live Appearance Preview
                  </label>
                  <div
                    className="p-5 rounded-2xl relative overflow-hidden transition-colors border border-black/10 text-white space-y-3"
                    style={{ backgroundColor: tempPrimary }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <div className="text-lg font-heading font-extrabold leading-tight">
                          Yamuna MUN 2026
                        </div>
                        <div className="text-xs text-white/80 font-bold uppercase tracking-wider mt-0.5">
                          Theme Preview
                        </div>
                      </div>
                      <span
                        className="text-xs font-heading font-extrabold px-3 py-1.5 rounded-xl shadow-sm text-[#0B1B33]"
                        style={{ backgroundColor: tempSecondary }}
                      >
                        Action Button
                      </span>
                    </div>
                    <div className="text-xs text-white/90 bg-black/20 p-2.5 rounded-xl border border-white/10 relative z-10">
                      Background effect active: <strong>{tempEffect}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Settings & Appearance saved successfully
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1560BD] hover:bg-[#0F4C96] text-white px-6 py-2.5 rounded-xl font-heading font-extrabold text-sm transition-colors cursor-pointer"
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
