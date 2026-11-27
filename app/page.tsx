"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { getAssetUrl } from "@/lib/registrationLinks";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useApp();

  useEffect(() => {
    document.title = "Delegato: run your MUN in one link";
  }, []);

  const handleCreateConferenceClick = () => {
    if (user) {
      router.push("/organizer/conferences");
    } else {
      router.push("/login?mode=signup");
    }
  };

  return (
    <div className="min-h-screen bg-[#1560BD] text-white flex flex-col">
      {/* ========================================================
          HEADER
      ======================================================== */}
      <header className="w-full bg-[#1560BD] border-b border-white/20">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-block shrink-0" aria-label="Delegato">
            <img
              src={getAssetUrl("/branding/delegato-logo-transparent.png")}
              alt="Delegato"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          <nav className="flex items-center gap-6 sm:gap-8 text-base font-bold">
            <Link
              href="/conferences"
              className="text-white hover:underline hidden sm:inline"
            >
              Browse events
            </Link>

            {user ? (
              <Link
                href="/organizer/conferences"
                className="text-white hover:underline"
              >
                My conferences
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-white hover:underline"
              >
                Log in
              </Link>
            )}

            <button
              type="button"
              onClick={handleCreateConferenceClick}
              className="bg-[#FFD23F] hover:bg-yellow-400 text-[#0B1B33] font-bold text-base px-5 py-2.5 rounded-lg cursor-pointer"
            >
              Create your conference
            </button>
          </nav>
        </div>
      </header>

      {/* ========================================================
          SECTION 1: BLUE HERO
      ======================================================== */}
      <section className="bg-[#1560BD] text-white pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
              Run your MUN in one link.
            </h1>

            <p className="text-xl sm:text-2xl text-blue-100 font-semibold mt-6 leading-relaxed">
              Registration, payments, and allotment without spreadsheets. Free to start.
            </p>

            <p className="text-base sm:text-lg text-blue-100 mt-6 leading-relaxed">
              Anyone who has organized a conference knows the headache. Google Forms with missing phone numbers. Delegates sending cropped payment screenshots on WhatsApp at midnight. Three people claiming the same portfolio in UNSC. Delegato gives your secretariat one clean system for delegate intake.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={handleCreateConferenceClick}
                className="bg-[#FFD23F] hover:bg-yellow-400 text-[#0B1B33] font-bold text-lg px-7 py-4 rounded-lg cursor-pointer text-center"
              >
                Create your conference
              </button>

              <Link
                href="/status"
                className="bg-transparent border border-white text-white hover:bg-white hover:text-[#1560BD] font-bold text-lg px-7 py-4 rounded-lg text-center"
              >
                Check registration status
              </Link>
            </div>

            <p className="text-base text-blue-200 mt-6 font-medium">
              Free to start. No credit card needed. Ready in five minutes.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: WHITE SECTION FOR THE STEPS
      ======================================================== */}
      <section className="bg-white text-[#0B1B33] py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-[#0B1B33] tracking-tight">
            How you run your conference
          </h2>

          <div className="mt-16 sm:mt-24 space-y-16 sm:space-y-24">
            {/* Step 1 */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10">
              <div className="text-6xl sm:text-7xl font-bold text-[#1560BD] shrink-0 leading-none">
                1
              </div>
              <div className="max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0B1B33]">
                  Set up your committees
                </h3>
                <p className="text-base sm:text-lg text-neutral-700 mt-3 leading-relaxed">
                  Add your committees and available countries. Set registration deadlines and delegate fees. Your conference gets its own link.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10">
              <div className="text-6xl sm:text-7xl font-bold text-[#1560BD] shrink-0 leading-none">
                2
              </div>
              <div className="max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0B1B33]">
                  Share the link with delegates
                </h3>
                <p className="text-base sm:text-lg text-neutral-700 mt-3 leading-relaxed">
                  Send the link in school delegations and WhatsApp groups. Delegates fill their details on mobile and pick three committee preferences.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10">
              <div className="text-6xl sm:text-7xl font-bold text-[#1560BD] shrink-0 leading-none">
                3
              </div>
              <div className="max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0B1B33]">
                  Verify payments and allot seats
                </h3>
                <p className="text-base sm:text-lg text-neutral-700 mt-3 leading-relaxed">
                  Check payment transaction numbers in one table. Allot delegates based on their ranked choices with one click. Delegates see their placard on their phone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: BACK TO BLUE FOR BENEFITS WITH THIN RULES
      ======================================================== */}
      <section className="bg-[#1560BD] text-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            What you avoid
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mt-4 max-w-2xl">
            The problems that usually keep the secretariat awake the week before the conference.
          </p>

          <div className="mt-14 max-w-3xl">
            <div className="pt-8 pb-8 border-t border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                No more lost payment screenshots
              </h3>
              <p className="text-base sm:text-lg text-blue-100 mt-2 leading-relaxed">
                Delegates submit transaction numbers and payment receipts directly in the form. You mark them verified with one click instead of scrolling through WhatsApp photos.
              </p>
            </div>

            <div className="pt-8 pb-8 border-t border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                No double country claims
              </h3>
              <p className="text-base sm:text-lg text-blue-100 mt-2 leading-relaxed">
                When a delegate picks their preferred portfolios, the list shows what is open. You never have two people arguing over who paid first for the United States.
              </p>
            </div>

            <div className="pt-8 pb-8 border-t border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                No spreadsheet formulas breaking at midnight
              </h3>
              <p className="text-base sm:text-lg text-blue-100 mt-2 leading-relaxed">
                Seat counts, delegate intake, and payment status update on their own. You do not need to build complex formulas or lock columns before sharing with your executive board.
              </p>
            </div>

            <div className="pt-8 pb-8 border-t border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                School delegations handled cleanly
              </h3>
              <p className="text-base sm:text-lg text-blue-100 mt-2 leading-relaxed">
                Faculty advisors and head delegates can register their entire school group together. You see the total count, total fee, and individual delegate details in one entry.
              </p>
            </div>

            <div className="pt-8 pb-8 border-t border-white/20 border-b">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Delegates stop asking for status updates
              </h3>
              <p className="text-base sm:text-lg text-blue-100 mt-2 leading-relaxed">
                Every delegate has a status page using their registration number. Once you publish allotments, their placard and committee show up on their phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 4: FLAT YELLOW CLOSING BAND
      ======================================================== */}
      <section className="bg-[#FFD23F] text-[#0B1B33] py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-bold text-[#0B1B33] tracking-tight leading-tight">
              Start your conference today
            </h2>
            <p className="text-lg sm:text-xl font-medium text-[#0B1B33] mt-4">
              Free to start. Open your registrations and share your link today.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleCreateConferenceClick}
                className="bg-[#0B1B33] hover:bg-black text-white font-bold text-lg px-8 py-4 rounded-lg cursor-pointer"
              >
                Create your conference
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}
      <footer className="bg-[#0d4182] text-white py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="text-base font-bold text-white">
            Delegato, for MUN. Made in Delhi.
          </div>

          <nav className="flex items-center gap-6 sm:gap-8 flex-wrap text-base font-medium text-blue-100">
            <Link href="/conferences" className="hover:text-white hover:underline">
              Browse events
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
          </nav>
        </div>
      </footer>
    </div>
  );
}
