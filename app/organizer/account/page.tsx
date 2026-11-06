"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, BackgroundEffect } from "@/lib/AppContext";
import { ConferenceBranding, EventModel } from "@/lib/types";
import {
  User,
  Palette,
  Sparkles,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Check,
  LogOut,
  Calendar,
  Layers,
  Shield,
  Eye,
  Sliders,
} from "lucide-react";

const PRIMARY_PRESETS = [
  { name: "UN Blue", hex: "#1560BD" },
  { name: "Midnight Navy", hex: "#0F172A" },
  { name: "Emerald Forest", hex: "#059669" },
  { name: "Royal Purple", hex: "#7C3AED" },
  { name: "Crimson Red", hex: "#DC2626" },
  { name: "Deep Teal", hex: "#0D9488" },
  { name: "Charcoal Slate", hex: "#334155" },
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

const CARD_STYLES = [
  {
    id: "solid" as const,
    label: "Crisp Solid",
    desc: "Modern high-contrast white card with sharp definition",
  },
  {
    id: "glass" as const,
    label: "Frosted Glass",
    desc: "Glassmorphism with soft backdrop blur and subtle border",
  },
  {
    id: "minimal" as const,
    label: "Minimal Outline",
    desc: "Elegant translucent dark card with crisp border",
  },
];

export default function OrganizerAccountPage() {
  const router = useRouter();
  const { user, signOut, theme, updateTheme, event, myConferences, updateEventBasics, clearDatabase } = useApp();

  // Profile state
  const [organizerName, setOrganizerName] = useState("Secretary-General");
  const [email, setEmail] = useState(user?.email || "");

  // Workspace appearance state
  const [workspacePrimary, setWorkspacePrimary] = useState(theme.primaryColor);
  const [workspaceSecondary, setWorkspaceSecondary] = useState(theme.secondaryColor);
  const [workspaceEffect, setWorkspaceEffect] = useState<BackgroundEffect>(theme.backgroundEffect);

  // Conference registration link branding state
  const [selectedConfId, setSelectedConfId] = useState<string>(event.id || "");
  const activeConf = myConferences.find((c) => c.id === selectedConfId) || event;

  const initialBranding: ConferenceBranding = activeConf?.branding || {
    primaryColor: theme.primaryColor,
    accentColor: theme.secondaryColor,
    backgroundEffect: theme.backgroundEffect,
    cardStyle: "solid",
    monogram: "UN",
  };

  const [regPrimary, setRegPrimary] = useState(initialBranding.primaryColor || "#1560BD");
  const [regAccent, setRegAccent] = useState(initialBranding.accentColor || "#FFD23F");
  const [regEffect, setRegEffect] = useState<BackgroundEffect>(initialBranding.backgroundEffect || "none");
  const [regCardStyle, setRegCardStyle] = useState<"solid" | "glass" | "minimal">(
    initialBranding.cardStyle || "solid"
  );
  const [regMonogram, setRegMonogram] = useState(initialBranding.monogram || "UN");

  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  // Sync workspace state with active theme
  useEffect(() => {
    setWorkspacePrimary(theme.primaryColor);
    setWorkspaceSecondary(theme.secondaryColor);
    setWorkspaceEffect(theme.backgroundEffect);
  }, [theme]);

  // When conference selection changes, update branding inputs
  useEffect(() => {
    if (activeConf?.branding) {
      setRegPrimary(activeConf.branding.primaryColor || theme.primaryColor);
      setRegAccent(activeConf.branding.accentColor || theme.secondaryColor);
      setRegEffect(activeConf.branding.backgroundEffect || "none");
      setRegCardStyle(activeConf.branding.cardStyle || "solid");
      setRegMonogram(activeConf.branding.monogram || "UN");
    }
  }, [selectedConfId, activeConf]);

  // Live apply workspace appearance as user tweaks it
  const handleWorkspacePrimaryChange = (hex: string) => {
    setWorkspacePrimary(hex);
    updateTheme({ primaryColor: hex });
  };

  const handleWorkspaceSecondaryChange = (hex: string) => {
    setWorkspaceSecondary(hex);
    updateTheme({ secondaryColor: hex });
  };

  const handleWorkspaceEffectChange = (eff: BackgroundEffect) => {
    setWorkspaceEffect(eff);
    updateTheme({ backgroundEffect: eff });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Commit workspace theme
    updateTheme({
      primaryColor: workspacePrimary,
      secondaryColor: workspaceSecondary,
      backgroundEffect: workspaceEffect,
    });

    // 2. Commit conference registration link branding
    const updatedBranding: ConferenceBranding = {
      primaryColor: regPrimary,
      accentColor: regAccent,
      backgroundEffect: regEffect,
      cardStyle: regCardStyle,
      monogram: regMonogram.trim().toUpperCase() || "UN",
    };

    updateEventBasics({
      branding: updatedBranding,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname.replace(/\/organizer.*/, "")}/c/?id=${activeConf.slug || activeConf.id}`
    : `/c/?id=${activeConf.slug || activeConf.id}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-white/90 text-xs font-heading font-extrabold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Account & Appearance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
            Account & Conference Branding
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base font-medium mt-1">
            Personalize your workspace colors, background textures, and public delegate registration links.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/organizer/conferences"
            className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>My Conferences</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* Section 1: Secretariat Profile Details */}
        <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-100 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1560BD] text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-extrabold text-[#0B1B33]">
                  Secretariat Profile
                </h2>
                <p className="text-neutral-500 text-xs sm:text-sm font-medium">
                  Your identity as the organizer and conference administrator.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Organizer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1.5 tracking-wider">
                Secretariat Title / Name
              </label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g. Secretary-General"
                className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm font-bold text-[#0B1B33] outline-none focus:border-[#1560BD] focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1.5 tracking-wider">
                Organizer Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm font-bold text-[#0B1B33] outline-none focus:border-[#1560BD] focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Workspace Appearance (Organizer Dashboard & Sidebar) */}
        <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1560BD] flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-[#0B1B33]">
                Organizer Workspace Theme
              </h2>
              <p className="text-neutral-500 text-xs sm:text-sm font-medium">
                Customizes your personal organizer portal, navigation sidebar, and background effect.
              </p>
            </div>
          </div>

          {/* Primary Workspace Color Picker */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <label className="text-xs uppercase font-extrabold text-neutral-700 tracking-wider block">
                  Primary Workspace Color
                </label>
                <span className="text-xs text-neutral-500">
                  Defines the main background color for your dashboard and workspace.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={workspacePrimary}
                  onChange={(e) => handleWorkspacePrimaryChange(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                  title="Pick custom primary color"
                />
                <span className="text-xs font-mono font-bold text-neutral-600 uppercase bg-neutral-100 px-2.5 py-1 rounded-lg">
                  {workspacePrimary}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {PRIMARY_PRESETS.map((col) => {
                const isSelected = workspacePrimary.toLowerCase() === col.hex.toLowerCase();
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => handleWorkspacePrimaryChange(col.hex)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#0B1B33] bg-neutral-100 ring-2 ring-blue-500/30 scale-102"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-[#0B1B33]">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary / Accent Action Color */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <label className="text-xs uppercase font-extrabold text-neutral-700 tracking-wider block">
                  Accent Action Color
                </label>
                <span className="text-xs text-neutral-500">
                  Used for action buttons, callout indicators, and highlights.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={workspaceSecondary}
                  onChange={(e) => handleWorkspaceSecondaryChange(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                  title="Pick custom accent color"
                />
                <span className="text-xs font-mono font-bold text-neutral-600 uppercase bg-neutral-100 px-2.5 py-1 rounded-lg">
                  {workspaceSecondary}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {SECONDARY_PRESETS.map((col) => {
                const isSelected = workspaceSecondary.toLowerCase() === col.hex.toLowerCase();
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => handleWorkspaceSecondaryChange(col.hex)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#0B1B33] bg-neutral-100 ring-2 ring-yellow-400/40 scale-102"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="text-[#0B1B33]">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Texture & Effect */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs uppercase font-extrabold text-neutral-700 mb-1 tracking-wider">
              Workspace Background Texture
            </label>
            <span className="text-xs text-neutral-500 block mb-3">
              Applies a high-end visual overlay across your entire workspace screen.
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BACKGROUND_EFFECTS.map((eff) => {
                const isSelected = workspaceEffect === eff.id;
                return (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => handleWorkspaceEffectChange(eff.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#1560BD] bg-blue-50/80 shadow-sm"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading font-extrabold text-sm text-[#0B1B33]">
                        {eff.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#1560BD]" />}
                    </div>
                    <span className="text-xs text-neutral-500 block">
                      {eff.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Registration Link Branding & Styling (For Delegates) */}
        <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-extrabold text-[#0B1B33]">
                  Registration Link Branding
                </h2>
                <p className="text-neutral-500 text-xs sm:text-sm font-medium">
                  Style the public page delegates see when opening your conference registration link.
                </p>
              </div>
            </div>

            {/* Conference Selector */}
            {myConferences.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Conference:
                </label>
                <select
                  value={selectedConfId}
                  onChange={(e) => setSelectedConfId(e.target.value)}
                  className="p-2 rounded-xl border border-neutral-300 text-xs font-bold text-[#0B1B33] outline-none"
                >
                  {myConferences.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || "Untitled Conference"}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Shareable Link Pill Banner */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-heading font-extrabold text-neutral-500 uppercase tracking-wider">
                Public Delegate URL for: <strong>{activeConf.name || "Your Conference"}</strong>
              </div>
              <div className="text-sm font-mono font-bold text-[#0B1B33] truncate mt-0.5">
                {shareUrl}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-xs font-bold text-[#0B1B33] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
              <Link
                href={`/c/?id=${activeConf.slug || activeConf.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#1560BD] hover:bg-[#0F4C96] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Link</span>
              </Link>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Left: Styling Controls */}
            <div className="space-y-5">
              {/* Monogram Badge */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-700 mb-1 tracking-wider">
                  Header Monogram / Acronym
                </label>
                <span className="text-xs text-neutral-500 block mb-2">
                  2-4 letters shown inside the round circular badge on the delegate page.
                </span>
                <input
                  type="text"
                  maxLength={5}
                  value={regMonogram}
                  onChange={(e) => setRegMonogram(e.target.value.toUpperCase())}
                  placeholder="e.g. UN, YMUN, DYS"
                  className="w-36 p-3 rounded-xl border border-neutral-200 text-base font-heading font-extrabold text-[#0B1B33] text-center tracking-widest outline-none focus:border-[#1560BD]"
                />
              </div>

              {/* Portal Primary Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase font-extrabold text-neutral-700 tracking-wider">
                    Portal Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={regPrimary}
                      onChange={(e) => setRegPrimary(e.target.value)}
                      className="w-7 h-7 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono font-bold text-neutral-500">
                      {regPrimary}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRIMARY_PRESETS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setRegPrimary(col.hex)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        regPrimary.toLowerCase() === col.hex.toLowerCase()
                          ? "border-[#0B1B33] bg-neutral-100 ring-2 ring-blue-500/20"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.hex }} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button Accent Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase font-extrabold text-neutral-700 tracking-wider">
                    Action / Button Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={regAccent}
                      onChange={(e) => setRegAccent(e.target.value)}
                      className="w-7 h-7 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono font-bold text-neutral-500">
                      {regAccent}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SECONDARY_PRESETS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setRegAccent(col.hex)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        regAccent.toLowerCase() === col.hex.toLowerCase()
                          ? "border-[#0B1B33] bg-neutral-100 ring-2 ring-yellow-400/30"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.hex }} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delegate Page Background Effect */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-700 mb-2 tracking-wider">
                  Delegate Page Background Effect
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_EFFECTS.map((eff) => (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => setRegEffect(eff.id)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        regEffect === eff.id
                          ? "border-[#1560BD] bg-blue-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="font-heading font-extrabold text-xs text-[#0B1B33]">
                        {eff.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Aesthetic Style */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-700 mb-2 tracking-wider">
                  Card Aesthetic Style
                </label>
                <div className="space-y-2">
                  {CARD_STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setRegCardStyle(st.id)}
                      className={`w-full p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        regCardStyle === st.id
                          ? "border-[#1560BD] bg-blue-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-extrabold text-sm text-[#0B1B33]">
                          {st.label}
                        </span>
                        {regCardStyle === st.id && <Check className="w-4 h-4 text-[#1560BD]" />}
                      </div>
                      <span className="text-xs text-neutral-500 block mt-0.5">
                        {st.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Real-time Live Preview Simulator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-extrabold text-neutral-600 tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#1560BD]" />
                  <span>Live Delegate Portal Simulator</span>
                </span>
                <span className="text-[11px] text-neutral-400 font-bold">
                  Matches your custom branding
                </span>
              </div>

              {/* Simulator Outer Frame */}
              <div
                className="rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300 border-2 border-black/10 min-h-[460px] flex flex-col justify-between"
                style={{ backgroundColor: regPrimary }}
                data-bg-effect={regEffect}
              >
                {/* Simulator Header */}
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-extrabold text-sm shadow-md transition-colors"
                      style={{ backgroundColor: "#FFFFFF", color: regPrimary }}
                    >
                      {regMonogram || "UN"}
                    </div>
                    <div>
                      <div className="text-[10px] text-white/80 font-bold uppercase tracking-wider">
                        Official Delegate Portal
                      </div>
                      <div className="text-xl font-heading font-extrabold text-white leading-tight">
                        {activeConf.name || "Yamuna Model UN 2026"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-white/90">
                    <span className="bg-white/15 px-2.5 py-1 rounded-lg border border-white/10">
                      📅 {activeConf.dates || "Nov 14-16, 2026"}
                    </span>
                    <span className="bg-white/15 px-2.5 py-1 rounded-lg border border-white/10">
                      📍 {activeConf.venue || "Main Auditorium"}
                    </span>
                  </div>
                </div>

                {/* Simulator Content Card based on cardStyle */}
                <div
                  className={`p-5 rounded-2xl space-y-4 my-4 relative z-10 transition-all ${
                    regCardStyle === "glass"
                      ? "bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl"
                      : regCardStyle === "minimal"
                      ? "bg-[#0B1B33]/80 border border-white/20 text-white shadow-lg"
                      : "bg-white text-[#0B1B33] shadow-xl"
                  }`}
                >
                  <div>
                    <div
                      className={`text-xs font-bold uppercase tracking-wider ${
                        regCardStyle === "solid" ? "text-neutral-500" : "text-white/70"
                      }`}
                    >
                      Delegate Registration
                    </div>
                    <div
                      className={`text-base font-heading font-extrabold leading-tight ${
                        regCardStyle === "solid" ? "text-[#0B1B33]" : "text-white"
                      }`}
                    >
                      Select Committee & Preference
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                      regCardStyle === "solid"
                        ? "bg-neutral-50 border-neutral-200 text-neutral-800"
                        : "bg-white/10 border-white/15 text-white"
                    }`}
                  >
                    <span>Individual Delegate Fee</span>
                    <span className="text-sm font-extrabold">
                      ₹{(activeConf.fee || 2500).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="w-full py-3 px-4 rounded-xl font-heading font-extrabold text-xs sm:text-sm text-[#0B1B33] shadow-md transition-all flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: regAccent }}
                  >
                    <span>Register for this MUN →</span>
                  </button>
                </div>

                {/* Simulator Footer */}
                <div className="text-center text-[11px] text-white/70 relative z-10 font-medium">
                  Powered by Delegate MUN Platform
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Confirmation Message */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-bold flex items-center gap-2.5 animate-fadeIn">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>All appearance preferences & conference registration branding saved successfully!</span>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Link
            href="/organizer"
            className="px-5 py-3 rounded-xl text-white hover:bg-white/10 font-heading font-bold text-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl font-heading font-extrabold text-sm sm:text-base text-[#0B1B33] shadow-lg active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: workspaceSecondary }}
          >
            Save All Branding & Settings
          </button>
        </div>
      </form>

      {/* Danger Zone: Wipe Database & Reset */}
      <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 shadow-xl border border-red-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-heading font-extrabold text-red-600">
              Danger Zone: Wipe All Data & Reset
            </h3>
            <p className="text-neutral-500 text-xs sm:text-sm font-medium mt-1">
              Purges all conferences, committees, portfolios, and delegate registrations from your database and local storage.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (
                confirm(
                  "Are you sure you want to completely wipe all conference and registration data from database and storage? This cannot be undone."
                )
              ) {
                await clearDatabase();
                alert("Database and storage have been completely wiped.");
                router.push("/organizer/conferences");
              }
            }}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-heading font-extrabold text-sm transition-colors cursor-pointer shrink-0"
          >
            Wipe Database Now
          </button>
        </div>
      </div>
    </div>
  );
}
