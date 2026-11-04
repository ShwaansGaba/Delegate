"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Row } from "@/components/ui/Row";
import { PlacardCard } from "@/components/mun/PlacardCard";
import { Registration } from "@/lib/types";

export default function StatusPage() {
  const router = useRouter();
  const { findRegistrationByNumber, committees, portfolios, event, verifyPayment, registrations } = useApp();

  const [inputNum, setInputNum] = useState("");
  const [currentReg, setCurrentReg] = useState<Registration | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showChoicesModal, setShowChoicesModal] = useState(false);

  useEffect(() => {
    document.title = "Registration Status | Delegate";
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const queryNum = sp.get("num") || "";
      if (queryNum) {
        setInputNum(queryNum);
        handleLookup(queryNum);
      }
    }
  }, []);

  const handleLookup = (numberToLookup: string) => {
    setErrorMsg("");
    const cleaned = numberToLookup.trim();
    if (!cleaned) {
      setErrorMsg("Please enter your registration number.");
      return;
    }

    const found = findRegistrationByNumber(cleaned);
    setSearched(true);
    if (found) {
      setCurrentReg(found);
    } else {
      setCurrentReg(null);
      setErrorMsg(`No registration found for "${cleaned}". Check your confirmation email or try sample number "MUN 2048".`);
    }
  };

  const handleBack = () => {
    if (currentReg || searched) {
      setSearched(false);
      setCurrentReg(null);
      setErrorMsg("");
    } else {
      router.push("/");
    }
  };

  // State 1: Input form (Page 11)
  if (!currentReg) {
    return (
      <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 overflow-x-hidden page-transition">
        <div className="max-w-[360px] sm:max-w-md w-full mx-auto flex-1 flex flex-col justify-between">
          <div>
            <ProgressBar currentStep={1} totalSteps={1} onBack={handleBack} />

            <div className="pt-3 sm:pt-6 space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                Check your <br />
                status
              </h1>
              <p className="text-base sm:text-xl text-white font-medium">
                Enter the number from your confirmation email.
              </p>

              <div className="pt-4 sm:pt-6">
                <input
                  type="text"
                  value={inputNum}
                  onChange={(e) => setInputNum(e.target.value)}
                  placeholder="MUN 2048"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleLookup(inputNum)}
                  className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-xl sm:text-3xl font-heading font-extrabold outline-none uppercase placeholder:text-neutral-400 input-smooth focus:ring-4 focus:ring-blue-300"
                />
              </div>

              {errorMsg && (
                <div className="bg-[#FFD23F] text-[#0B1B33] p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold mt-3 sm:mt-4 text-sm sm:text-base">
                  {errorMsg}
                </div>
              )}

              <div className="pt-3 sm:pt-4">
                <a
                  href="mailto:contact@delegate.app"
                  className="text-base sm:text-lg font-heading font-bold text-[#FFD23F] hover:underline"
                >
                  Lost your number? Contact the organizers
                </a>
              </div>

              {/* Helper for quick lookup if registrations exist */}
              {registrations.length > 0 && (
                <div className="pt-4 sm:pt-8 space-y-1.5 sm:space-y-2">
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-white/70 font-bold">
                    Registered numbers in system:
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {registrations.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setInputNum(r.registrationNumber);
                          handleLookup(r.registrationNumber);
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold cursor-pointer"
                      >
                        {r.registrationNumber} ({r.delegateName.split(" ")[0]})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 pb-2 sm:pt-8 sm:pb-4">
            <Button onClick={() => handleLookup(inputNum)}>Check status</Button>
          </div>
        </div>
      </main>
    );
  }

  // Determine if delegate is allotted and if allotments are published OR if it's already allotted
  const isAllotted = !!currentReg.allotment;
  const isPaymentPending = currentReg.paymentStatus !== "verified";

  // State 2: Allotted Placard (Page 10)
  if (isAllotted && !isPaymentPending) {
    const comm = committees.find((c) => c.id === currentReg.allotment?.committeeId);
    const port = portfolios.find((p) => p.id === currentReg.allotment?.portfolioId);

    return (
      <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 overflow-x-hidden page-transition">
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
              committeeName={comm?.name || "UNSC"}
              countryName={port?.countryName || "INDIA"}
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
                    <span className="font-bold">{i + 1}. {committees.find(c => c.id === p.committeeId)?.name || p.committeeId.toUpperCase()}: </span>
                    <span>{p.portfolioIds.map(pid => portfolios.find(port => port.id === pid)?.countryName || pid).join(", ")}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => setShowChoicesModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </main>
    );
  }

  // State 3: Payment Pending (Page 12)
  return (
    <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 overflow-x-hidden page-transition">
      <div className="max-w-[360px] sm:max-w-md w-full mx-auto flex-1 flex flex-col justify-between">
        <div className="space-y-4 sm:space-y-6">
          <ProgressBar currentStep={1} totalSteps={2} onBack={handleBack} />

          <div>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
              Payment <br />
              pending.
            </h1>
            <p className="text-lg sm:text-2xl text-white font-medium mt-1 sm:mt-2">
              {currentReg.registrationNumber}, {currentReg.delegateName}
            </p>
          </div>

          {/* Three-stage Status Card matching Page 12 */}
          <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 text-lg sm:text-xl font-heading font-bold text-emerald-700">
              <span className="text-xl sm:text-2xl">✓</span>
              <span>Registration received</span>
            </div>

            <div className="flex items-center gap-3 text-lg sm:text-xl font-heading font-bold text-[#0B1B33]">
              <span className="text-xl sm:text-2xl text-amber-500">○</span>
              <span>Payment, Rs {currentReg.feeAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3 text-lg sm:text-xl font-heading font-bold text-neutral-400">
              <span className="text-xl sm:text-2xl">○</span>
              <span>Allotment</span>
            </div>
          </div>

          <p className="text-base sm:text-xl text-white font-medium leading-relaxed">
            Allotments are published after payment closes on {event.deadline}.
          </p>

          <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
            <Row
              title="Upload payment proof"
              onClick={() => {
                verifyPayment(currentReg.id);
                alert("Payment verified! Reloading status...");
                setCurrentReg({ ...currentReg, paymentStatus: "verified" });
              }}
            />

            <Row
              title="View my choices"
              onClick={() => setShowChoicesModal(true)}
            />
          </div>
        </div>

        <div className="pt-8 pb-4">
          <Button variant="white" onClick={handleBack}>
            Look up another number
          </Button>
        </div>
      </div>

      {showChoicesModal && (
        <div className="fixed inset-0 z-50 bg-[#1560BD]/90 flex items-center justify-center p-6">
          <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="text-2xl font-heading font-extrabold">Your Preferences</h3>
            <div className="space-y-3 text-lg font-medium">
              {currentReg.preferences.map((p, i) => (
                <div key={i} className="border-b border-neutral-200 pb-2">
                  <span className="font-bold">{i + 1}. {committees.find(c => c.id === p.committeeId)?.name || p.committeeId.toUpperCase()}: </span>
                  <span>{p.portfolioIds.map(pid => portfolios.find(port => port.id === pid)?.countryName || pid).join(", ")}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowChoicesModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </main>
  );
}
