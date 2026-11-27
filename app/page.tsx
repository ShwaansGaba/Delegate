"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { getAssetUrl } from "@/lib/registrationLinks";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"grid" | "matrix" | "queue">("grid");

  useEffect(() => {
    document.title = "Delegato: run your MUN in one link";
  }, []);

  const handleStart = () => {
    if (user) {
      router.push("/organizer/conferences");
    } else {
      router.push("/login?mode=signup");
    }
  };

  return (
    <div className="min-h-screen bg-[#1560BD] text-white font-body flex flex-col">
      {/* HEADER / NAVIGATION */}
      <header className="w-full bg-[#1560BD] border-b border-white/20">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src={getAssetUrl("/branding/delegato-logo-transparent.png")}
              alt="Delegato"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>

          <nav className="flex items-center gap-5 sm:gap-8 text-base font-medium">
            <Link
              href="/conferences"
              className="text-white hover:underline hidden sm:inline"
            >
              Browse conferences
            </Link>

            <Link
              href="/status"
              className="text-white hover:underline hidden md:inline"
            >
              Check status
            </Link>

            {user ? (
              <Link
                href="/organizer/conferences"
                className="text-white font-bold hover:underline"
              >
                My conferences
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-white font-bold hover:underline"
              >
                Log in
              </Link>
            )}

            <button
              type="button"
              onClick={handleStart}
              className="bg-[#FFD23F] text-[#0B1B33] font-heading font-extrabold text-base px-5 py-2.5 rounded-lg border-2 border-[#FFD23F] hover:bg-[#ffe066] transition-colors cursor-pointer"
            >
              Host a MUN
            </button>
          </nav>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="bg-[#1560BD] text-white pt-14 sm:pt-20 pb-16 sm:pb-24 border-b border-white/20">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="max-w-4xl text-left">
            <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-[84px] leading-[1.02] tracking-tight text-white">
              Run your MUN in one link.
            </h1>

            <p className="text-xl sm:text-2xl text-blue-100 font-normal leading-relaxed mt-6 max-w-2xl">
              Registration, payments, and allotment without spreadsheets. Free to start.
            </p>

            <p className="text-base sm:text-lg text-blue-200 mt-4 max-w-2xl leading-relaxed">
              Replace late night manual data entry with one clean link for your entire conference. Delegates sign up, choose their committees, and submit their payments in minutes.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={handleStart}
                className="bg-[#FFD23F] text-[#0B1B33] font-heading font-extrabold text-lg px-8 py-4 rounded-lg border-2 border-[#FFD23F] hover:bg-[#ffe066] transition-colors cursor-pointer text-center"
              >
                Create your conference
              </button>

              <Link
                href="/status"
                className="text-white font-medium text-base hover:underline py-2"
              >
                Already registered? Check status
              </Link>
            </div>

            <div className="mt-6 text-base text-blue-200">
              Free to start. Ready in five minutes. No credit card required.
            </div>
          </div>

          {/* REAL PRODUCT SHOWCASE: ACTUAL HIGH RESOLUTION SCREENSHOTS */}
          <div className="mt-14 sm:mt-16 text-left">
            {/* View Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("grid")}
                className={`px-4 py-2 rounded-lg text-base font-heading font-bold cursor-pointer transition-colors ${
                  activeTab === "grid"
                    ? "bg-[#FFD23F] text-[#0B1B33]"
                    : "bg-[#0F4C96] text-white border border-white/20 hover:bg-[#1258ab]"
                }`}
              >
                Allotment Grid View
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`px-4 py-2 rounded-lg text-base font-heading font-bold cursor-pointer transition-colors ${
                  activeTab === "matrix"
                    ? "bg-[#FFD23F] text-[#0B1B33]"
                    : "bg-[#0F4C96] text-white border border-white/20 hover:bg-[#1258ab]"
                }`}
              >
                Committee Matrix View
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("queue")}
                className={`px-4 py-2 rounded-lg text-base font-heading font-bold cursor-pointer transition-colors ${
                  activeTab === "queue"
                    ? "bg-[#FFD23F] text-[#0B1B33]"
                    : "bg-[#0F4C96] text-white border border-white/20 hover:bg-[#1258ab]"
                }`}
              >
                Delegate Queue View
              </button>
            </div>

            {/* Clean Browser Frame for Actual App Screenshots */}
            <div className="border border-white/30 rounded-lg overflow-hidden bg-[#0B1B33] shadow-2xl">
              {/* Window Bar */}
              <div className="bg-[#071324] px-5 py-3 border-b border-white/15 flex items-center justify-between text-base text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="font-mono text-base text-blue-200 ml-3">
                    delegato.app / organizer / {activeTab === "grid" ? "allotment" : activeTab === "matrix" ? "matrix" : "queue"}
                  </span>
                </div>
                <div className="text-base text-neutral-400 hidden sm:block">
                  Live Organizer Interface
                </div>
              </div>

              {/* Real Image Render */}
              <div className="bg-neutral-900 p-2 sm:p-4">
                {activeTab === "grid" && (
                  <img
                    src={getAssetUrl("/screenshots/allotment-grid.png")}
                    alt="Delegato Allotment Grid View"
                    className="w-full h-auto rounded-md object-contain max-h-[720px]"
                  />
                )}
                {activeTab === "matrix" && (
                  <img
                    src={getAssetUrl("/screenshots/allotment-matrix.png")}
                    alt="Delegato Committee Matrix View"
                    className="w-full h-auto rounded-md object-contain max-h-[720px]"
                  />
                )}
                {activeTab === "queue" && (
                  <img
                    src={getAssetUrl("/screenshots/allotment-queue.png")}
                    alt="Delegato Delegate Queue View"
                    className="w-full h-auto rounded-md object-contain max-h-[720px]"
                  />
                )}
              </div>
            </div>

            <p className="mt-3 text-base text-blue-200">
              Actual Delegato organizer screen. Click the tabs above to see how allotments and registrations are handled.
            </p>
          </div>
        </div>
      </section>

      {/* 2. REALITY CHECK: THE OLD WAY VS DELEGATO */}
      <section className="bg-white text-[#0B1B33] py-20 sm:py-28">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 text-left">
          <div className="max-w-3xl mb-14 sm:mb-20">
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
              Why secretariats switch to Delegato
            </h2>
            <p className="text-lg sm:text-xl text-neutral-700 font-normal mt-4 leading-relaxed">
              Every conference organizer knows the exhaustion of running registrations by hand. Here is how things change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* The Old Way */}
            <div className="border border-neutral-300 rounded-lg p-8 bg-neutral-50 text-left">
              <div className="font-heading font-bold text-xl text-red-600 mb-4">
                The spreadsheet way
              </div>
              <ul className="space-y-4 text-base text-neutral-700">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-red-500">✕</span>
                  <span>Four separate Google Forms that get out of sync within days.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-red-500">✕</span>
                  <span>Cross checking hundreds of blurry bank payment screenshots in WhatsApp group chats.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-red-500">✕</span>
                  <span>Accidentally allotting the same Security Council seat to two delegates who both paid.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-red-500">✕</span>
                  <span>Manually emailing individual placards and study guides until three in the morning.</span>
                </li>
              </ul>
            </div>

            {/* The Delegato Way */}
            <div className="border-2 border-[#1560BD] rounded-lg p-8 bg-[#1560BD]/5 text-left">
              <div className="font-heading font-bold text-xl text-[#1560BD] mb-4">
                The Delegato way
              </div>
              <ul className="space-y-4 text-base text-neutral-800">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#1560BD]">✓</span>
                  <span>One public link where delegates register, choose portfolios, and submit proof.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#1560BD]">✓</span>
                  <span>UPI payment reference tracking tied directly to each delegate registration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#1560BD]">✓</span>
                  <span>Live portfolio vacancy count so nobody applies for taken seats.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#1560BD]">✓</span>
                  <span>Digital placards generated on publish. Delegates check their status anytime.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (WITH VISUAL STEP BREAKDOWN) */}
      <section className="bg-[#0F4C96] text-white py-20 sm:py-28 border-y border-white/20">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 text-left">
          <div className="max-w-3xl mb-14 sm:mb-20">
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight">
              How it works
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 font-normal mt-4 leading-relaxed">
              Three simple steps from blank screen to a fully allotted conference.
            </p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {/* Step 1 */}
            <div className="pt-8 border-t border-white/20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
              <div className="md:col-span-3">
                <span className="font-heading font-extrabold text-6xl sm:text-7xl text-[#FFD23F]">
                  01
                </span>
              </div>
              <div className="md:col-span-9 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-3">
                  Set up your committees and pricing
                </h3>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Choose committees from our prebuilt templates or add your own custom agendas. Set your delegate fees, delegation discounts, and your UPI QR code.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="pt-8 border-t border-white/20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
              <div className="md:col-span-3">
                <span className="font-heading font-extrabold text-6xl sm:text-7xl text-[#FFD23F]">
                  02
                </span>
              </div>
              <div className="md:col-span-9 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-3">
                  Share your registration link
                </h3>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Post your link in Instagram bios and WhatsApp delegate groups. Delegates fill their past experience, pick their top three countries, and upload their payment screenshot.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="pt-8 border-t border-white/20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
              <div className="md:col-span-3">
                <span className="font-heading font-extrabold text-6xl sm:text-7xl text-[#FFD23F]">
                  03
                </span>
              </div>
              <div className="md:col-span-9 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-3">
                  Review allotments and publish placards
                </h3>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Let the matching system allot portfolios based on preference priority, or make manual assignments with drag and drop. Hit publish and delegates get instant digital placards on their phones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUNDER NOTE (DEDICATED SECTION, WARM, GENUINE) */}
      <section className="bg-white text-[#0B1B33] py-20 sm:py-24 border-b border-neutral-200">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-10 text-left">
          <div className="border-l-4 border-[#1560BD] pl-6 sm:pl-10">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B1B33] mb-4">
              A note from the team
            </div>
            <p className="text-lg sm:text-xl text-neutral-800 leading-relaxed">
              [FOUNDER NOTE] If you have ever stayed up until four in the morning cross checking bank references against messy sheets, you know why Delegato exists. We built it because running a conference should be about debate, diplomacy, and student leadership, not clerical work.
            </p>
            <div className="mt-6 text-base font-bold text-[#1560BD]">
              Built by delegates for secretariats
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION (FLAT YELLOW CLOSING BAND) */}
      <section className="bg-[#FFD23F] text-[#0B1B33] py-20 sm:py-28">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 text-left">
          <div className="max-w-3xl">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-[#0B1B33] tracking-tight leading-tight">
              Start your conference today.
            </h2>

            <p className="mt-5 text-xl sm:text-2xl font-medium text-[#0B1B33] leading-relaxed">
              Setup takes five minutes. Free to start.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5">
              <button
                type="button"
                onClick={handleStart}
                className="bg-[#0B1B33] text-white font-heading font-extrabold text-lg px-8 py-4 rounded-lg hover:bg-black transition-colors cursor-pointer text-center"
              >
                Create your conference
              </button>

              <span className="text-base font-medium text-[#0B1B33]">
                No credit card required.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-[#0F4C96] text-white py-14 sm:py-16 border-t border-white/20 mt-auto">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/20">
            <div>
              <img
                src={getAssetUrl("/branding/delegato-logo-transparent.png")}
                alt="Delegato"
                className="h-10 w-auto object-contain"
              />
              <p className="text-base text-blue-200 mt-3 max-w-md">
                Registration, payments, and allotment without spreadsheets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-base font-medium text-blue-100">
              <Link href="/conferences" className="hover:text-white hover:underline">
                Conferences
              </Link>
              <Link href="/status" className="hover:text-white hover:underline">
                Check status
              </Link>
              <Link
                href={user ? "/organizer/conferences" : "/login"}
                className="hover:text-white hover:underline"
              >
                {user ? "My conferences" : "Log in"}
              </Link>
              <Link href="/terms" className="hover:text-white hover:underline">
                Terms
              </Link>
              <a
                href="mailto:support@delegato.app"
                className="hover:text-white hover:underline"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-base text-blue-200">
            <div>
              Delegato, for MUN. Made in Delhi.
            </div>
            <div className="text-base text-blue-300">
              © {new Date().getFullYear()} Delegato.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
