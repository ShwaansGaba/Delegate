"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { ScrollPop } from "@/components/ui/ScrollPop";
import { getAssetUrl } from "@/lib/registrationLinks";
import { ArrowRight, Check, Globe, Shield, Smartphone } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthLoaded } = useApp();

  useEffect(() => {
    document.title = "Delegato | Run your MUN in one link";
  }, []);

  const handleCreateConferenceClick = () => {
    if (user) {
      router.push("/organizer/conferences");
    } else {
      router.push("/login?mode=signup");
    }
  };

  const handleLoginClick = () => {
    if (user) {
      router.push("/organizer/conferences");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#1560BD] text-white font-body flex flex-col overflow-x-hidden selection:bg-[#FFD23F] selection:text-[#0B1B33] relative">
      {/* Ambient Luminous Glowing Backlights */}
      <div className="absolute top-16 left-1/4 -translate-x-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] rounded-full bg-blue-400/20 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-36 right-10 w-[260px] sm:w-[500px] h-[260px] sm:h-[500px] rounded-full bg-[#FFD23F]/15 blur-[120px] pointer-events-none -z-10" />

      {/* ========================================================
          NAVIGATION BAR
      ======================================================== */}
      <header className="w-full sticky top-0 z-40 backdrop-blur-md bg-[#1560BD]/90 border-b border-white/10 transition-all">
        <div className="max-w-[1120px] mx-auto px-3.5 sm:px-10 h-16 sm:h-24 flex items-center justify-between gap-2">
          {/* Authentic Delegato Brand Logo */}
          <Link
            href="/"
            className="flex items-center select-none group cursor-pointer shrink-0"
            aria-label="Delegato"
          >
            <img
              src={getAssetUrl("/branding/delegato-logo-transparent.png")}
              alt="Delegato"
              className="h-8 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <Link
              href="/conferences"
              className="text-white/80 hover:text-white text-xs sm:text-base font-bold transition-colors hidden md:inline"
            >
              Browse Events
            </Link>

            {user ? (
              <Link
                href="/organizer/conferences"
                className="bg-white/15 hover:bg-white/25 text-white font-heading font-bold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-white/20 transition-all whitespace-nowrap"
              >
                My Conferences →
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-white hover:text-[#FFD23F] font-heading font-bold text-xs sm:text-base transition-colors cursor-pointer px-2 py-1 whitespace-nowrap"
              >
                Log in
              </Link>
            )}

            <button
              type="button"
              onClick={handleCreateConferenceClick}
              className="bg-[#FFD23F] hover:bg-yellow-400 active:scale-95 text-[#0B1B33] font-heading font-extrabold text-xs sm:text-base px-3 sm:px-6 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-[0_4px_20px_rgba(255,210,63,0.35)] transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="sm:hidden">Host MUN</span>
              <span className="hidden sm:inline">Create your conference</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO SECTION
      ======================================================== */}
      <section className="relative pt-6 sm:pt-16 pb-16 sm:pb-24 overflow-hidden">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-10 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 lg:gap-14">
          {/* Main Hero Content (Comes FIRST on mobile!) */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="font-heading font-extrabold text-3xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[1.05] tracking-tight text-white">
              Run your MUN <br className="hidden sm:inline" />
              in one link.
            </h1>

            <p className="text-base sm:text-2xl lg:text-[26px] leading-relaxed text-blue-100 font-medium max-w-[580px] mx-auto lg:mx-0 mt-3 sm:mt-6">
              Open registrations, collect payments, and allot delegates, without spreadsheets. Free to start.
            </p>

            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6">
              <button
                type="button"
                onClick={handleCreateConferenceClick}
                className="w-full sm:w-auto bg-[#FFD23F] hover:bg-yellow-400 active:scale-95 text-[#0B1B33] font-heading font-extrabold text-base sm:text-2xl px-6 sm:px-8 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl shadow-[0_10px_35px_rgba(255,210,63,0.4)] hover:shadow-[0_14px_45px_rgba(255,210,63,0.55)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Create your conference</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
              </button>

              <Link
                href="/status"
                className="text-white hover:text-[#FFD23F] font-bold underline text-sm sm:text-xl transition-colors cursor-pointer py-1.5 text-center"
              >
                Already registered? Check status
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-blue-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#FFD23F]" strokeWidth={3} /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#FFD23F]" strokeWidth={3} /> Instant WhatsApp share
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#FFD23F]" strokeWidth={3} /> Auto preference matching
              </span>
            </div>
          </div>

          {/* Right Hero Mobile Mockup (Comes AFTER on mobile!) */}
          <div className="flex-none relative select-none mt-4 lg:mt-0">
            {/* Luminous Glow Halo around Phone */}
            <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-sky-400/25 via-[#FFD23F]/20 to-blue-400/30 rounded-[54px] blur-2xl -z-10 pointer-events-none" />

            <div className="relative group p-2 rounded-[46px] bg-white/[0.08] backdrop-blur-xl border border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.45)] hover:scale-[1.02] transition-transform duration-500">
              {/* Phone Frame */}
              <div className="w-[260px] h-[520px] sm:w-[274px] sm:h-[548px] rounded-[42px] bg-[#0B1B33] p-2.5 box-border flex-none shadow-2xl relative overflow-hidden border-2 border-neutral-800">
                {/* Dynamic Notch */}
                <div className="w-20 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-blue-900/60" />
                </div>

                {/* Inner Screen */}
                <div className="w-full h-[calc(100%-24px)] rounded-[32px] bg-[#1560BD] p-4 sm:p-5 flex flex-col justify-between text-white relative overflow-hidden">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                      Allotment Confirmation
                    </div>
                    <div className="font-heading font-extrabold text-2xl sm:text-3xl leading-tight mt-1 mb-3 text-white">
                      You are in.
                    </div>

                    {/* Allotment Placard Card */}
                    <div className="bg-white text-[#0B1B33] rounded-2xl text-center py-4 px-2.5 shadow-lg border border-white/60">
                      <div className="text-sm font-heading font-bold text-neutral-600 uppercase tracking-wider">
                        UNSC
                      </div>
                      <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#0B1B33] my-2 tracking-tight">
                        INDIA
                      </div>
                      <div className="border-t-2 border-[#0B1B33] pt-2.5 mt-2">
                        <div className="text-base font-heading font-extrabold text-[#0B1B33]">
                          Aarav Mehta
                        </div>
                        <div className="text-xs text-neutral-500 font-semibold mt-0.5">
                          Delhi Public School
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Placard Action CTA */}
                  <div className="space-y-2 mt-auto">
                    <div className="bg-[#FFD23F] text-[#0B1B33] font-heading font-bold text-sm sm:text-base text-center py-3 px-3 rounded-xl shadow-md cursor-pointer hover:bg-yellow-400 transition-colors">
                      Background guide →
                    </div>
                    <div className="text-center text-[11px] text-blue-200 font-medium">
                      Placard ID: #DEL-8492
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          HOW IT WORKS (WHITE BAND WITH POP ANIMATIONS)
      ======================================================== */}
      <section className="bg-white text-[#0B1B33] py-20 sm:py-28 relative overflow-hidden border-y border-blue-100">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-10">
          <ScrollPop>
            <div className="max-w-2xl">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#1560BD] block mb-2">
                Simple 3-Step Process
              </span>
              <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
                How it works
              </h2>
              <p className="text-base sm:text-xl text-neutral-600 font-medium mt-3">
                From launching your conference to publishing placards in less than five minutes.
              </p>
            </div>
          </ScrollPop>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
            {/* Step 1 */}
            <ScrollPop delayMs={100}>
              <div className="bg-[#EAF1FB]/90 backdrop-blur-sm border border-[#D0E1F9] rounded-3xl p-7 sm:p-9 h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(21,96,189,0.12)] hover:border-[#1560BD]/40 group">
                <div>
                  <div className="font-heading font-extrabold text-5xl sm:text-6xl text-[#1560BD] group-hover:scale-105 transition-transform duration-200">
                    1
                  </div>
                  <h3 className="text-2xl sm:text-[30px] font-heading font-extrabold text-[#0B1B33] mt-4 mb-3 leading-tight">
                    Create your conference
                  </h3>
                  <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium">
                    Add your committees and portfolios, or start from a ready template. Set your fee and registration deadline.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#D0E1F9]/60 text-xs font-bold text-[#1560BD] flex items-center gap-1">
                  <span>UNSC, DISEC, AIPPM ready</span>
                </div>
              </div>
            </ScrollPop>

            {/* Step 2 */}
            <ScrollPop delayMs={200}>
              <div className="bg-[#EAF1FB]/90 backdrop-blur-sm border border-[#D0E1F9] rounded-3xl p-7 sm:p-9 h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(21,96,189,0.12)] hover:border-[#1560BD]/40 group">
                <div>
                  <div className="font-heading font-extrabold text-5xl sm:text-6xl text-[#1560BD] group-hover:scale-105 transition-transform duration-200">
                    2
                  </div>
                  <h3 className="text-2xl sm:text-[30px] font-heading font-extrabold text-[#0B1B33] mt-4 mb-3 leading-tight">
                    Share one link
                  </h3>
                  <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium">
                    Send it on WhatsApp. Delegates register in about two minutes on any phone, alone or as a school delegation.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#D0E1F9]/60 text-xs font-bold text-[#1560BD] flex items-center gap-1">
                  <span>Mobile-friendly 2-minute flow</span>
                </div>
              </div>
            </ScrollPop>

            {/* Step 3 */}
            <ScrollPop delayMs={300}>
              <div className="bg-[#EAF1FB]/90 backdrop-blur-sm border border-[#D0E1F9] rounded-3xl p-7 sm:p-9 h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(21,96,189,0.12)] hover:border-[#1560BD]/40 group">
                <div>
                  <div className="font-heading font-extrabold text-5xl sm:text-6xl text-[#1560BD] group-hover:scale-105 transition-transform duration-200">
                    3
                  </div>
                  <h3 className="text-2xl sm:text-[30px] font-heading font-extrabold text-[#0B1B33] mt-4 mb-3 leading-tight">
                    Allot and publish
                  </h3>
                  <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium">
                    Auto allot assigns delegates by their ranked preferences. You review and verify, then they see their placard instantly.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#D0E1F9]/60 text-xs font-bold text-[#1560BD] flex items-center gap-1">
                  <span>Fair ranking & digital placards</span>
                </div>
              </div>
            </ScrollPop>
          </div>
        </div>
      </section>

      {/* ========================================================
          PILLARS / LUMINOUS FROSTED GLASS CARDS
      ======================================================== */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Subtle Ambient Backlight */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[300px] bg-white/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-[1120px] mx-auto px-5 sm:px-10">
          <ScrollPop>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
                Built specifically for Model UN organizers
              </h2>
              <p className="text-base sm:text-xl text-blue-100 font-medium mt-3">
                Everything you need to run a flawless conference without the stress of manual bookkeeping.
              </p>
            </div>
          </ScrollPop>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <ScrollPop delayMs={100}>
              <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-7 sm:p-9 text-white h-full transition-all duration-300 hover:bg-white/[0.14] hover:border-white/35 hover:-translate-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD23F] text-[#0B1B33] flex items-center justify-center font-bold mb-5 shadow-md">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-[28px] font-heading font-extrabold text-white mb-2.5 leading-snug">
                  No more spreadsheets
                </h3>
                <p className="text-base sm:text-lg text-blue-100 leading-relaxed font-medium">
                  Every registration lands in one dashboard, with payments, transaction IDs, and committee seats counted for you automatically.
                </p>
              </div>
            </ScrollPop>

            {/* Pillar 2 */}
            <ScrollPop delayMs={200}>
              <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-7 sm:p-9 text-white h-full transition-all duration-300 hover:bg-white/[0.14] hover:border-white/35 hover:-translate-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#1560BD] flex items-center justify-center font-bold mb-5 shadow-md">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-[28px] font-heading font-extrabold text-white mb-2.5 leading-snug">
                  Three committees, three portfolios each
                </h3>
                <p className="text-base sm:text-lg text-blue-100 leading-relaxed font-medium">
                  Delegates rank their preferences from searchable lists that show what is open live. No accidental duplicate claims.
                </p>
              </div>
            </ScrollPop>

            {/* Pillar 3 */}
            <ScrollPop delayMs={300}>
              <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-7 sm:p-9 text-white h-full transition-all duration-300 hover:bg-white/[0.14] hover:border-white/35 hover:-translate-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
                <div className="w-12 h-12 rounded-2xl bg-[#0B1B33] text-white flex items-center justify-center font-bold mb-5 shadow-md border border-white/20">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-[28px] font-heading font-extrabold text-white mb-2.5 leading-snug">
                  Your conference stays yours
                </h3>
                <p className="text-base sm:text-lg text-blue-100 leading-relaxed font-medium">
                  Each organizer gets their own private link and isolated data. Nobody else sees your delegates, revenue, or allotments.
                </p>
              </div>
            </ScrollPop>
          </div>
        </div>
      </section>

      {/* ========================================================
          FINAL GOLDEN CALL TO ACTION BANNER
      ======================================================== */}
      <section className="bg-[#FFD23F] text-[#0B1B33] py-20 sm:py-24 relative overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-yellow-500/20 blur-2xl pointer-events-none" />

        <div className="max-w-[1120px] mx-auto px-5 sm:px-10 text-center relative z-10">
          <ScrollPop>
            <h2 className="text-4xl sm:text-6xl md:text-[64px] font-heading font-extrabold tracking-tight leading-tight text-[#0B1B33]">
              Start your conference today.
            </h2>
            <p className="mt-4 mb-8 sm:mb-10 text-xl sm:text-2xl font-bold text-[#0B1B33]/85 max-w-xl mx-auto">
              It takes just a few minutes to set up. Free to launch.
            </p>
            <button
              type="button"
              onClick={handleCreateConferenceClick}
              className="bg-[#0B1B33] hover:bg-black active:scale-95 text-white font-heading font-extrabold text-lg sm:text-2xl px-9 py-4 sm:py-5 rounded-2xl shadow-[0_12px_35px_rgba(11,27,51,0.35)] transition-all cursor-pointer inline-flex items-center gap-3"
            >
              <span>Create your conference</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          </ScrollPop>
        </div>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}
      <footer className="bg-[#0F4C96] text-white py-12 sm:py-16 border-t border-white/10 mt-auto">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-sm sm:text-base">
          {/* Authentic Brand Logo */}
          <div className="flex items-center gap-3">
            <img
              src={getAssetUrl("/branding/delegato-logo-transparent.png")}
              alt="Delegato"
              className="h-9 w-auto object-contain"
            />
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 sm:gap-8 flex-wrap justify-center font-bold text-blue-100">
            <Link href="/status" className="hover:text-white transition-colors">
              Check status
            </Link>
            <Link href="/conferences" className="hover:text-white transition-colors">
              Conferences
            </Link>
            <Link
              href={user ? "/organizer/conferences" : "/login"}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {user ? "My Conferences" : "Log in"}
            </Link>
            <a
              href="mailto:support@delegato.app"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
            <span className="text-white/40 cursor-default">Privacy</span>
          </div>
        </div>

        <div className="max-w-[1120px] mx-auto px-5 sm:px-10 mt-8 pt-6 border-t border-white/10 text-center text-xs sm:text-sm text-blue-200/70 font-medium">
          © {new Date().getFullYear()} Delegato. Official Student Events &amp; Model United Nations Management Platform.
        </div>
      </footer>
    </div>
  );
}
