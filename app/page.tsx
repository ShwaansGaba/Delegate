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

      {/* 1. HERO SECTION (FLAT BLUE, ASYMMETRICAL, LEFT ALIGNED) */}
      <section className="bg-[#1560BD] text-white pt-14 sm:pt-20 pb-20 sm:pb-28 border-b border-white/20">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Wide column: Primary message */}
            <div className="lg:col-span-8 text-left">
              <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-[84px] leading-[1.02] tracking-tight text-white">
                Run your MUN in one link.
              </h1>

              <p className="text-xl sm:text-2xl text-blue-100 font-normal leading-relaxed mt-6 max-w-2xl">
                Registration, payments, and allotment without spreadsheets. Free to start.
              </p>

              <p className="text-base sm:text-lg text-blue-200 mt-4 max-w-xl leading-relaxed">
                Send a single link to your delegates. Collect preferences and payments in one dashboard, then allot portfolios with confidence.
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

            {/* Narrow side note column: Founder Note */}
            <div className="lg:col-span-4 text-left">
              <div className="border border-white/30 rounded-lg p-6 bg-[#0F4C96]/40 text-white">
                <div className="font-heading font-bold text-lg text-[#FFD23F] mb-3">
                  Note from the organizer
                </div>
                <p className="text-base text-blue-100 leading-relaxed">
                  [FOUNDER NOTE] If you have ever stayed up until four in the morning cross checking bank references against messy sheets, you know why Delegato exists. We built it because running a conference should be about debate, not clerical work.
                </p>
                <div className="mt-4 pt-3 border-t border-white/20 text-base text-blue-200 font-medium">
                  Built by delegates for secretariats
                </div>
              </div>
            </div>
          </div>

          {/* REAL PRODUCT PREVIEW FRAME (FULL WIDTH, PLAIN BORDER, AUTHENTIC ALLOTMENT GRID) */}
          <div className="mt-14 sm:mt-20">
            <div className="border border-white/30 rounded-lg overflow-hidden bg-[#0B1B33] text-left">
              {/* Product Frame Header */}
              <div className="bg-[#071324] px-5 py-3 border-b border-white/15 flex items-center justify-between text-base text-neutral-300">
                <div className="font-mono text-base text-blue-200">
                  delegato.app / organizer / allotment
                </div>
                <div className="text-base text-neutral-400">
                  Live Allotment Matrix
                </div>
              </div>

              {/* Product Frame Content: Allotment Grid */}
              <div className="p-4 sm:p-8 overflow-x-auto">
                <div className="min-w-[620px]">
                  {/* Top committee selector tabs */}
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10 text-base">
                    <span className="font-heading font-bold text-white bg-[#1560BD] px-3.5 py-1.5 rounded-lg">
                      UNSC (15 of 15 allotted)
                    </span>
                    <span className="text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/15">
                      UNHRC (28 of 30)
                    </span>
                    <span className="text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/15">
                      AIPPM (24 of 25)
                    </span>
                  </div>

                  {/* Table Representation */}
                  <table className="w-full text-left text-base text-white border-collapse">
                    <thead>
                      <tr className="border-b border-white/20 text-blue-200 font-bold">
                        <th className="py-3 px-3">Country / Portfolio</th>
                        <th className="py-3 px-3">Delegate Name</th>
                        <th className="py-3 px-3">School / Institution</th>
                        <th className="py-3 px-3">Preference</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr>
                        <td className="py-3.5 px-3 font-heading font-bold text-white">India</td>
                        <td className="py-3.5 px-3">Aarav Mehta</td>
                        <td className="py-3.5 px-3 text-neutral-300">Delhi Public School, R.K. Puram</td>
                        <td className="py-3.5 px-3 text-blue-200 font-medium">Choice 1</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-[#1560BD] text-white px-2.5 py-1 rounded-lg text-base font-bold">
                            Allotted
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 font-heading font-bold text-white">United States</td>
                        <td className="py-3.5 px-3">Priya Sharma</td>
                        <td className="py-3.5 px-3 text-neutral-300">The Mother International School</td>
                        <td className="py-3.5 px-3 text-blue-200 font-medium">Choice 1</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-[#1560BD] text-white px-2.5 py-1 rounded-lg text-base font-bold">
                            Allotted
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 font-heading font-bold text-white">France</td>
                        <td className="py-3.5 px-3">Kabir Taneja</td>
                        <td className="py-3.5 px-3 text-neutral-300">Modern School, Barakhamba</td>
                        <td className="py-3.5 px-3 text-blue-200 font-medium">Choice 2</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-[#1560BD] text-white px-2.5 py-1 rounded-lg text-base font-bold">
                            Allotted
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-3 font-heading font-bold text-white">United Kingdom</td>
                        <td className="py-3.5 px-3">Ananya Verma</td>
                        <td className="py-3.5 px-3 text-neutral-300">Springdales School</td>
                        <td className="py-3.5 px-3 text-blue-200 font-medium">Choice 1</td>
                        <td className="py-3.5 px-3">
                          <span className="bg-[#1560BD] text-white px-2.5 py-1 rounded-lg text-base font-bold">
                            Allotted
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Frame footer note */}
              <div className="bg-[#071324] px-5 py-3 border-t border-white/15 text-base text-neutral-400">
                [Product screenshot frame: actual allotment matrix view. You can replace this frame with a full width product screenshot anytime.]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (WHITE BACKGROUND, LEFT ALIGNED, VERTICAL NUMBERED LIST) */}
      <section className="bg-white text-[#0B1B33] py-20 sm:py-28">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 text-left">
          <div className="max-w-3xl mb-14 sm:mb-20">
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
              How it works
            </h2>
            <p className="text-lg sm:text-xl text-neutral-700 font-normal mt-4 leading-relaxed">
              From conference setup to published delegate placards in three straightforward steps.
            </p>
          </div>

          {/* Vertical numbered list with large numerals, short sentences, and generous spacing */}
          <div className="space-y-12 sm:space-y-16">
            {/* Step 1 */}
            <div className="pt-8 border-t border-neutral-300 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              <div className="md:col-span-3">
                <span className="font-heading font-extrabold text-6xl sm:text-7xl text-[#1560BD]">
                  01
                </span>
              </div>
              <div className="md:col-span-9 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] mb-3">
                  Set up your committees
                </h3>
                <p className="text-lg text-neutral-700 leading-relaxed">
                  Add councils and country portfolios or start from templates. Set your registration fee, school team rules, and UPI details.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="pt-8 border-t border-neutral-300 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              <div className="md:col-span-3">
                <span className="font-heading font-extrabold text-6xl sm:text-7xl text-[#1560BD]">
                  02
                </span>
              </div>
              <div className="md:col-span-9 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] mb-3">
                  Share your link
                </h3>
                <p className="text-lg text-neutral-700 leading-relaxed">
                  Send your conference link on WhatsApp or Instagram. Delegates enter their contact information, pick ranked portfolio choices, and attach payment receipts directly on their phones.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="pt-8 border-t border-neutral-300 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              <div className="md:col-span-3">
                <span className="font-heading font-extrabold text-6xl sm:text-7xl text-[#1560BD]">
                  03
                </span>
              </div>
              <div className="md:col-span-9 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] mb-3">
                  Allot and publish
                </h3>
                <p className="text-lg text-neutral-700 leading-relaxed">
                  Run auto allotment to match preferences fairly. Review the assignments, make any manual swaps you want, then publish digital placards that delegates can verify on their phones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY ORGANIZERS USE IT (BACK TO BLUE, PLAIN TEXT WITH THIN RULES) */}
      <section className="bg-[#1560BD] text-white py-20 sm:py-28 border-t border-white/20">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 text-left">
          <div className="max-w-3xl mb-14 sm:mb-20">
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight">
              Why organizers use Delegato
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 font-normal mt-4 leading-relaxed">
              Built for student secretariats who want clarity instead of endless spreadsheet reconciliation.
            </p>
          </div>

          {/* Plain text rows with thin rules between them */}
          <div className="divide-y divide-white/20 border-y border-white/20">
            <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              <div className="md:col-span-4">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  No spreadsheet headaches
                </h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-lg text-blue-100 leading-relaxed">
                  Every delegate registration, payment confirmation screenshot, and portfolio choice lands directly in your organizer portal. You do not have to copy paste names across three different Google Sheets.
                </p>
              </div>
            </div>

            <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              <div className="md:col-span-4">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  Live portfolio count
                </h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-lg text-blue-100 leading-relaxed">
                  Open portfolios update as delegates apply. Delegates only see available positions, avoiding the awkward situation of multiple people paying for the exact same country.
                </p>
              </div>
            </div>

            <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              <div className="md:col-span-4">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  Fair allotment matching
                </h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-lg text-blue-100 leading-relaxed">
                  Our simulation engine matches delegates according to their ranked preferences and past experience. You can review every assignment, resolve conflicts, and make manual adjustments whenever needed.
                </p>
              </div>
            </div>

            <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
              <div className="md:col-span-4">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  Clean digital placards
                </h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-lg text-blue-100 leading-relaxed">
                  Once you publish allotments, delegates look up their registration number to see their confirmed council, country, and study guide. No manual email drafting required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION (FLAT YELLOW CLOSING BAND) */}
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

      {/* 5. FOOTER */}
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
