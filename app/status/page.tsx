"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { PlacardCard } from "@/components/mun/PlacardCard";
import { Registration } from "@/lib/types";

export default function StatusPage() {
  const router = useRouter();
  const {
    findRegistrationByNumber,
    lookupRegistrationAsync,
    committees,
    portfolios,
    event,
    theme,
    loadEventById,
  } = useApp();

  const [inputNum, setInputNum] = useState("");
  const [currentReg, setCurrentReg] = useState<Registration | null>(null);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showChoicesModal, setShowChoicesModal] = useState(false);
  const [scopedEventId, setScopedEventId] = useState<string | null>(null);

  const primaryColor = event.branding?.primaryColor || theme.primaryColor || "#1560BD";
  const bgEffect = event.branding?.backgroundEffect || theme.backgroundEffect || "none";

  useEffect(() => {
    document.title = "Registration Status | Delegato";
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const ev = sp.get("event") || sp.get("eventId");
      if (ev) {
        setScopedEventId(ev);
        if (ev !== event.id) {
          loadEventById(ev);
        }
      }
      const queryNum = sp.get("num") || "";
      if (queryNum) {
        setInputNum(queryNum);
        handleLookup(queryNum, ev || undefined);
      }
    }
  }, [event.id, loadEventById]);

  const handleLookup = async (numberToLookup: string, forceEventId?: string) => {
    setErrorMsg("");
    const cleaned = numberToLookup.trim();
    if (!cleaned) {
      setErrorMsg("Please enter your registration number.");
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      const targetEv = forceEventId || scopedEventId || (event.id !== "new-conference" ? event.id : undefined);
      // Try async lookup which checks memory and Supabase directly
      let found = await lookupRegistrationAsync(cleaned, targetEv);

      if (!found) {
        // Fallback to local check
        found = findRegistrationByNumber(cleaned, targetEv) || null;
      }

      if (found) {
        // Check if registration belongs to the scoped conference
        if (targetEv && found.eventId !== targetEv) {
          setCurrentReg(null);
          setErrorMsg("This registration number does not belong to this conference.");
          return;
        }

        setCurrentReg(found);
        if (found.eventId && found.eventId !== event.id) {
          await loadEventById(found.eventId);
        }
      } else {
        setCurrentReg(null);
        setErrorMsg(`No registration found matching "${cleaned}". Please check the number from your confirmation email.`);
      }
    } catch (err) {
      console.error("Status lookup error:", err);
      setErrorMsg("An error occurred while looking up your registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentReg || searched) {
      setSearched(false);
      setCurrentReg(null);
      setErrorMsg("");
    } else {
      router.push(scopedEventId ? `/c/?id=${scopedEventId}` : "/");
    }
  };

  // State 1: Input form
  if (!currentReg) {
    return (
      <main
        className="min-h-screen flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 overflow-x-hidden page-transition"
        style={{ backgroundColor: primaryColor }}
        data-bg-effect={bgEffect}
      >
        <div className="max-w-[360px] sm:max-w-md w-full mx-auto flex-1 flex flex-col justify-between">
          <div>
            <ProgressBar currentStep={1} totalSteps={1} onBack={handleBack} />

            <div className="pt-3 sm:pt-6 space-y-2 sm:space-y-3">
              <div className="text-xs uppercase tracking-wider font-bold text-blue-200">
                {event.name || "Conference Portal"}
              </div>
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                Check your <br />
                status
              </h1>
              <p className="text-base sm:text-lg text-white font-medium">
                Enter your unique registration number (e.g. MUN-4091-X9K2).
              </p>

              <div className="pt-4 sm:pt-6">
                <input
                  type="text"
                  value={inputNum}
                  onChange={(e) => setInputNum(e.target.value)}
                  placeholder="MUN-4091-X9K2"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleLookup(inputNum)}
                  className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-xl sm:text-2xl font-mono font-extrabold outline-none uppercase placeholder:text-neutral-400 input-smooth focus:ring-4 focus:ring-blue-300"
                />
              </div>

              {errorMsg && (
                <div className="bg-[#FFD23F] text-[#0B1B33] p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold mt-3 sm:mt-4 text-sm sm:text-base">
                  {errorMsg}
                </div>
              )}

              <div className="pt-3 sm:pt-4">
                <a
                  href="mailto:secretariat@delegate.app"
                  className="text-sm sm:text-base font-heading font-bold text-[#FFD23F] hover:underline"
                >
                  Lost your number? Contact the conference secretariat
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 pb-2 sm:pt-8 sm:pb-4">
            <Button
              onClick={() => handleLookup(inputNum)}
              disabled={isLoading}
            >
              {isLoading ? "Checking status..." : "Check status"}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Allotment publication status: Allotments are only visible if the organizer published them!
  const areAllotmentsPublished = Boolean(event.rules?.allotmentsPublished);
  const isAllotted = !!currentReg.allotment && areAllotmentsPublished;
  const isPaymentPending = currentReg.paymentStatus !== "verified";

  // State 2: Published Allotment Placard
  if (isAllotted && !isPaymentPending) {
    const comm = committees.find((c) => c.id === currentReg.allotment?.committeeId);
    const port = portfolios.find((p) => p.id === currentReg.allotment?.portfolioId);

    return (
      <main
        className="min-h-screen flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 overflow-x-hidden page-transition"
        style={{ backgroundColor: primaryColor }}
        data-bg-effect={bgEffect}
      >
        <div className="max-w-[360px] sm:max-w-md w-full mx-auto flex-1 flex flex-col justify-between">
          <div>
            <div className="pb-2 sm:pb-4">
              <button
                type="button"
                onClick={handleBack}
                className="text-white hover:opacity-80 active:opacity-60 cursor-pointer p-1 font-bold text-base sm:text-lg flex items-center gap-2"
              >
                ← Back
              </button>
            </div>

            <div className="mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white">
                You are in.
              </h1>
            </div>

            <PlacardCard
              committeeName={comm?.name || "Committee"}
              countryName={port?.countryName || "Allotted Portfolio"}
              delegateName={currentReg.delegateName}
              schoolName={currentReg.school}
              guideUrl={comm?.backgroundGuideUrl}
              onViewRegistration={() => setShowChoicesModal(true)}
            />
          </div>

          <div className="pt-4 pb-2 sm:pt-8 sm:pb-4">
            <Button variant="white" onClick={handleBack}>
              Look up another number
            </Button>
          </div>
        </div>

        {/* Choices Modal */}
        {showChoicesModal && (
          <div className="fixed inset-0 z-50 bg-[#1560BD]/90 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full space-y-3 sm:space-y-4">
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold">Your Preferences</h3>
              <div className="space-y-2.5 sm:space-y-3 text-base sm:text-lg font-medium">
                {currentReg.preferences.map((p, i) => (
                  <div key={i} className="border-b border-neutral-200 pb-2">
                    <span className="font-bold">
                      {i + 1}. {committees.find((c) => c.id === p.committeeId)?.name || p.committeeId.toUpperCase()}:{" "}
                    </span>
                    <span>
                      {p.portfolioIds
                        .map((pid) => portfolios.find((port) => port.id === pid)?.countryName || pid)
                        .join(", ")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Button onClick={() => setShowChoicesModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // State 3: Payment Verified, but Allotments are NOT yet published
  if (!isPaymentPending && !areAllotmentsPublished) {
    return (
      <main
        className="min-h-screen flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 overflow-x-hidden page-transition"
        style={{ backgroundColor: primaryColor }}
        data-bg-effect={bgEffect}
      >
        <div className="max-w-[360px] sm:max-w-md w-full mx-auto flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleBack}
              className="text-white hover:opacity-80 active:opacity-60 cursor-pointer p-1 font-bold text-base sm:text-lg flex items-center gap-2"
            >
              ← Back
            </button>

            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-blue-200 mb-1">
                {event.name}
              </div>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
                Choices Under Review
              </h1>
            </div>

            <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Registration Number
                </span>
                <span className="font-mono font-extrabold text-base text-[#1560BD]">
                  {currentReg.registrationNumber}
                </span>
              </div>

              <div>
                <div className="text-xl font-heading font-extrabold text-[#0B1B33]">
                  {currentReg.delegateName}
                </div>
                <div className="text-sm font-medium text-neutral-600 mt-0.5">
                  {currentReg.school}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm font-medium text-blue-900">
                Payment status: <strong>Verified</strong>
              </div>

              <p className="text-neutral-700 text-base font-medium leading-relaxed">
                Your portfolio choices have been registered. The secretariat will publish final allotments after the registration deadline.
              </p>

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-xs uppercase font-extrabold text-neutral-500 block mb-2">
                  Submitted Choices
                </span>
                <div className="space-y-1.5 text-sm text-neutral-800">
                  {currentReg.preferences.map((p, i) => (
                    <div key={i} className="font-medium">
                      <strong className="font-extrabold">Pref {i + 1}:</strong>{" "}
                      {committees.find((c) => c.id === p.committeeId)?.name || p.committeeId.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 pb-2">
            <Button variant="white" onClick={handleBack}>
              Look up another number
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // State 4: Unpaid / Payment Pending
  return (
    <main
      className="min-h-screen flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 overflow-x-hidden page-transition"
      style={{ backgroundColor: primaryColor }}
      data-bg-effect={bgEffect}
    >
      <div className="max-w-[360px] sm:max-w-md w-full mx-auto flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <button
            type="button"
            onClick={handleBack}
            className="text-white hover:opacity-80 p-1 font-bold text-base flex items-center gap-2"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
              Payment Pending
            </h1>
          </div>

          <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Registration Number
              </span>
              <span className="font-mono font-extrabold text-base text-[#1560BD]">
                {currentReg.registrationNumber}
              </span>
            </div>

            <div>
              <div className="text-xl font-heading font-extrabold text-[#0B1B33]">
                {currentReg.delegateName}
              </div>
              <div className="text-sm font-medium text-neutral-600 mt-0.5">
                {currentReg.school}
              </div>
            </div>

            <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100 text-sm font-medium">
              Payment status: <strong>Unpaid (₹{(currentReg.feeAmount || 1500).toLocaleString()})</strong>
            </div>

            <p className="text-neutral-700 text-base font-medium leading-relaxed">
              Your choices are held pending payment verification. Please complete your payment to hold your seat.
            </p>

            <div className="pt-2">
              <Link
                href={`/register/confirmation?num=${encodeURIComponent(currentReg.registrationNumber)}&event=${encodeURIComponent(currentReg.eventId)}`}
                className="block w-full bg-[#FFD23F] hover:bg-yellow-400 text-[#0B1B33] p-3.5 rounded-xl font-heading font-extrabold text-center text-base transition-colors"
              >
                Upload payment proof or pay →
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <Button variant="white" onClick={handleBack}>
            Look up another number
          </Button>
        </div>
      </div>
    </main>
  );
}
