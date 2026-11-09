"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Row } from "@/components/ui/Row";
import { CommitteePreference } from "@/lib/types";

interface TeamMember {
  name: string;
  hasChoices: boolean;
  choicesSummary: string;
}

export default function SchoolTeamRegistrationPage() {
  const router = useRouter();
  const { event, committees, portfolios, theme, loadEventById, addRegistration } = useApp();

  const primaryColor = event.branding?.primaryColor || theme.primaryColor || "#1560BD";
  const accentColor = event.branding?.accentColor || theme.secondaryColor || "#FFD23F";
  const bgEffect = event.branding?.backgroundEffect || theme.backgroundEffect || "none";

  // Load conference from URL query param if present
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const evParam = sp.get("event") || sp.get("eventId");
      if (evParam && evParam !== event.id) {
        loadEventById(evParam);
      }
    }
  }, [event.id, loadEventById]);

  React.useEffect(() => {
    document.title = event.name ? `Team Registration - ${event.name} | Delegato` : "School Team Registration | Delegato";
  }, [event.name]);

  const [schoolName, setSchoolName] = useState("Delhi Public School");
  const [headDelegateName, setHeadDelegateName] = useState("Aarav Mehta");
  const [teamSize, setTeamSize] = useState(5);
  const [step, setStep] = useState<"delegates" | "review">("delegates");

  const [members, setMembers] = useState<TeamMember[]>([
    { name: "Aarav Mehta", hasChoices: true, choicesSummary: "3 choices set" },
    { name: "Diya Kapoor", hasChoices: true, choicesSummary: "3 choices set" },
    { name: "Delegate 3", hasChoices: false, choicesSummary: "Add details or send a link" },
    { name: "Delegate 4", hasChoices: false, choicesSummary: "Add details or send a link" },
    { name: "Delegate 5", hasChoices: false, choicesSummary: "Add details or send a link" },
  ]);

  const [activeModalMemberIndex, setActiveModalMemberIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const perStudentFee = event.schoolFeePerStudent ?? event.fee ?? 2000;
  const totalFee = teamSize * perStudentFee;

  const handleAdjustSize = (delta: number) => {
    const newSize = Math.max(2, Math.min(20, teamSize + delta));
    setTeamSize(newSize);
    if (newSize > members.length) {
      const extra: TeamMember[] = [];
      for (let i = members.length + 1; i <= newSize; i++) {
        extra.push({
          name: `Delegate ${i}`,
          hasChoices: false,
          choicesSummary: "Add details or send a link",
        });
      }
      setMembers([...members, ...extra]);
    } else if (newSize < members.length) {
      setMembers(members.slice(0, newSize));
    }
  };

  const handleSaveMember = (index: number) => {
    if (!editingName.trim()) return;
    const updated = [...members];
    updated[index] = {
      name: editingName.trim(),
      hasChoices: true,
      choicesSummary: "3 choices set",
    };
    setMembers(updated);
    setActiveModalMemberIndex(null);
    setEditingName("");
  };

  const handleConfirmTeam = async () => {
    // Register head delegate and all delegates
    // Use real committees and portfolios from active event when available
    const dynamicPreferences: CommitteePreference[] =
      committees.length > 0
        ? committees.slice(0, 3).map((comm, idx) => {
            const ports = portfolios.filter((p) => p.committeeId === comm.id);
            return {
              committeeRank: ((idx + 1) as 1 | 2 | 3),
              committeeId: comm.id,
              portfolioIds: [
                ports[0]?.id || `${comm.id}-p1`,
                ports[1]?.id || `${comm.id}-p2`,
                ports[2]?.id || `${comm.id}-p3`,
              ] as [string, string, string],
            };
          })
        : [
            { committeeRank: 1 as const, committeeId: "c1", portfolioIds: ["p1", "p2", "p3"] },
          ];

    const headReg = await addRegistration({
      eventId: event.id,
      delegateName: headDelegateName,
      email: "teamhead@example.com",
      phone: "98765 43210",
      school: schoolName,
      classYear: "12",
      experienceMuns: 3,
      registrationType: "school_team",
      paymentStatus: "unpaid",
      feeAmount: totalFee,
      preferences: dynamicPreferences,
    });

    router.push(`/register/confirmation?num=${encodeURIComponent(headReg.registrationNumber)}&team=true&event=${encodeURIComponent(event.id)}`);
  };

  const isPaused = event.status === "paused" || !!event.rules?.isRegistrationsPaused;

  if (isPaused) {
    return (
      <main
        className="min-h-[100dvh] flex flex-col justify-center items-center px-4 py-10 text-center"
        style={{ backgroundColor: primaryColor }}
        data-bg-effect={bgEffect}
      >
        <div className="max-w-md w-full bg-white text-[#0B1B33] rounded-3xl p-8 shadow-2xl space-y-5 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl">
            ⏸️
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
            Registrations Temporarily Paused
          </h1>
          <p className="text-neutral-600 font-medium text-sm sm:text-base leading-relaxed">
            The secretariat for <span className="font-bold text-[#1560BD]">{event.name || "this MUN"}</span> has temporarily paused incoming team registrations.
          </p>
          <p className="text-xs text-neutral-500">
            Please check back shortly or check your existing registration status.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => router.push("/status")}
              className="bg-[#1560BD] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Check My Status
            </button>
            <button
              type="button"
              onClick={() => router.push("/conferences")}
              className="border-2 border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Browse Other MUNs
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-[100dvh] flex flex-col justify-between px-3.5 py-4 sm:px-8 sm:py-8 overflow-y-auto overflow-x-hidden pb-10 sm:pb-8 page-transition"
      style={{ backgroundColor: primaryColor }}
      data-bg-effect={bgEffect}
    >
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col">
        <ProgressBar
          currentStep={step === "delegates" ? 1 : 2}
          totalSteps={2}
          onBack={() => {
            if (step === "review") setStep("delegates");
            else router.push("/");
          }}
        />

        {/* Conference Header Card */}
        <div className="bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 mt-2 mb-1 text-white flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-blue-200 block font-bold">School Team for</span>
            <span className="text-sm sm:text-base font-heading font-extrabold truncate block">{event.name || "MUN Conference"}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-blue-200 block font-bold">Per Student</span>
            <span className="text-sm sm:text-base font-heading font-extrabold text-[#FFD23F]">₹{perStudentFee.toLocaleString()}</span>
          </div>
        </div>

        {step === "delegates" ? (
          <div className="flex-1 flex flex-col justify-between pt-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  Your delegates
                </h1>
                <p className="text-xl sm:text-2xl text-white font-medium mt-2">
                  {teamSize} delegates, Rs {totalFee.toLocaleString()} in total.
                </p>
              </div>

              {/* Stepper matching Page 8 */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjustSize(-1)}
                  disabled={teamSize <= 2}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-2xl px-5 py-3 text-xl font-heading font-extrabold transition-colors cursor-pointer disabled:opacity-40"
                >
                  Fewer
                </button>
                <div className="bg-white text-[#0B1B33] rounded-2xl px-6 py-3 text-3xl font-heading font-extrabold flex items-center justify-center min-w-[70px]">
                  {teamSize}
                </div>
                <button
                  type="button"
                  onClick={() => handleAdjustSize(1)}
                  disabled={teamSize >= 20}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-2xl px-5 py-3 text-xl font-heading font-extrabold transition-colors cursor-pointer disabled:opacity-40"
                >
                  More
                </button>
              </div>

              {/* School & Head Delegate Inputs */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="School name"
                  className="w-full bg-white text-[#0B1B33] rounded-2xl p-4 text-xl font-heading font-bold outline-none"
                />
                <input
                  type="text"
                  value={headDelegateName}
                  onChange={(e) => setHeadDelegateName(e.target.value)}
                  placeholder="Head delegate name"
                  className="w-full bg-white text-[#0B1B33] rounded-2xl p-4 text-lg font-medium outline-none"
                />
              </div>

              {/* Delegate Cards matching Page 8 */}
              <div className="space-y-3">
                {members.slice(0, teamSize).map((member, idx) => (
                  <Row
                    key={idx}
                    title={member.name}
                    subtitle={member.choicesSummary}
                    onClick={() => {
                      setActiveModalMemberIndex(idx);
                      setEditingName(member.hasChoices ? member.name : "");
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 pb-4 sm:pt-6 sm:pb-2 mt-auto">
              <Button onClick={() => setStep("review")}>Review team</Button>
            </div>
          </div>
        ) : (
          /* Review Step */
          <div className="flex-1 flex flex-col justify-between pt-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  Check team <br />
                  details
                </h1>
              </div>

              <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-4">
                <div>
                  <h3 className="text-3xl font-heading font-extrabold text-[#0B1B33]">
                    {schoolName}
                  </h3>
                  <p className="text-lg text-neutral-600 font-medium mt-1">
                    Head delegate: {headDelegateName}
                  </p>
                </div>

                <div className="border-t border-dashed border-neutral-300 pt-4 space-y-2">
                  <div className="text-xl font-heading font-extrabold text-[#0B1B33]">
                    Delegates ({teamSize})
                  </div>
                  {members.slice(0, teamSize).map((m, i) => (
                    <div key={i} className="text-lg text-neutral-700 font-medium flex justify-between">
                      <span>{i + 1}. {m.name}</span>
                      <span className="text-neutral-500 text-base">{m.choicesSummary}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-neutral-300 pt-4 flex items-center justify-between text-2xl font-heading font-extrabold text-[#0B1B33]">
                  <span>Total fee</span>
                  <span>Rs {totalFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep("delegates")}
                  className="text-xl font-heading font-bold text-[#FFD23F] hover:underline cursor-pointer"
                >
                  Change something
                </button>
              </div>

              {/* Parental Consent & Dispute Disclaimer Notice */}
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-white text-xs sm:text-sm leading-relaxed space-y-1 text-left">
                <p className="font-bold text-[#FFD23F] flex items-center gap-1.5">
                  <span>🛡️</span> Notice on Parental Consent &amp; Disputes:
                </p>
                <p className="text-white/90">
                  By confirming this team registration, the school / head delegate represents that all student delegates have valid parental/guardian consent. Delegato is an intermediary platform and is not liable for any event-related disputes, cancellations, or refunds.
                </p>
                <p className="pt-1 text-[11px] sm:text-xs text-blue-200">
                  Review our{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-[#FFD23F] underline font-bold hover:text-white"
                  >
                    Terms &amp; Conditions
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="pt-4 pb-4 sm:pt-6 sm:pb-2 mt-auto">
              <Button onClick={handleConfirmTeam}>Confirm registration</Button>
            </div>
          </div>
        )}

        {/* Member Edit Modal */}
        {activeModalMemberIndex !== null && (
          <div className="fixed inset-0 z-50 bg-[#1560BD]/90 flex items-center justify-center p-6">
            <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4">
              <h3 className="text-2xl font-heading font-extrabold">
                Delegate {activeModalMemberIndex + 1}
              </h3>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Enter delegate full name"
                autoFocus
                className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
              />
              <div className="space-y-2 pt-2">
                <Button onClick={() => handleSaveMember(activeModalMemberIndex)}>
                  Save delegate
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    // Stub share link
                    navigator.clipboard?.writeText(window.location.origin + "/register");
                    alert("Registration link copied! Delegate can fill their own preferences.");
                    handleSaveMember(activeModalMemberIndex);
                  }}
                  className="w-full py-3 text-lg font-heading font-bold text-[#1560BD] hover:underline text-center cursor-pointer"
                >
                  Copy invite link for delegate
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalMemberIndex(null)}
                  className="w-full py-2 text-base font-bold text-neutral-500 hover:text-neutral-800 text-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
