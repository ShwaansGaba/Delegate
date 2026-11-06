"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { CountryMonogram } from "@/components/ui/CountryMonogram";
import { CountryPill, AllotmentStatus } from "@/components/ui/CountryPill";
import { PortfolioCombobox } from "@/components/ui/PortfolioCombobox";
import { Button } from "@/components/ui/Button";
import { Registration } from "@/lib/types";
import { Trash2, CheckSquare, Square, ArrowUpDown, UserCheck, UserX } from "lucide-react";

export default function OrganizerAllotmentPage() {
  const router = useRouter();
  const {
    committees,
    portfolios,
    registrations,
    event,
    allotDelegateManual,
    unallotDelegate,
    autoAllotSimulation,
    autoAllotIncludeUnpaid,
    setAutoAllotIncludeUnpaid,
    executeAutoAllot,
    resolveConflict,
    publishAllotmentsToggle,
    deletePortfolio,
    deleteMultiplePortfolios,
    addPortfolioToCommittee,
  } = useApp();

  // If conference is still in setup/draft, disallow allotment access
  useEffect(() => {
    if (!event.name || event.id === "new-conference") {
      router.replace("/organizer/conferences");
    } else if (event.status !== "published") {
      router.replace("/organizer/setup?step=basics");
    }
  }, [event.name, event.id, event.status, router]);

  const [activeCommitteeId, setActiveCommitteeId] = useState<string>("unsc");
  const [mobileTab, setMobileTab] = useState<"unallotted" | "committees">("unallotted");

  // Sorting and selection state
  const [sortMode, setSortMode] = useState<"all" | "free" | "paid" | "unpaid" | "az">("all");
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<string[]>([]);

  // Modals
  const [showAutoAllotModal, setShowAutoAllotModal] = useState(false);
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);

  // Manual assign modal state
  const [assigningDelegate, setAssigningDelegate] = useState<Registration | null>(null);

  // Keep active committee in sync with existing committees
  React.useEffect(() => {
    if (committees.length > 0 && !committees.some((c) => c.id === activeCommitteeId)) {
      setActiveCommitteeId(committees[0].id);
    }
  }, [committees, activeCommitteeId]);

  const unallottedDelegates = registrations.filter((r) => !r.allotment);
  const activeCommittee =
    committees.find((c) => c.id === activeCommitteeId) ||
    committees[0] || { id: "none", name: "No Committees", totalSeats: 0, eventId: "", agenda: "" };

  const committeePortfolios = portfolios.filter((p) => p.committeeId === activeCommittee.id);

  // Calculate status counts
  const portWithStatus = committeePortfolios.map((port) => {
    const reg = registrations.find(
      (r) => r.id === port.allottedRegistrationId || r.allotment?.portfolioId === port.id
    );
    const isTaken = port.status === "taken" || Boolean(reg);
    let status: AllotmentStatus = "free";
    if (isTaken) {
      status = reg?.paymentStatus === "verified" ? "allotted_paid" : "allotted_unpaid";
    }
    return {
      ...port,
      statusType: status,
      delegate: reg,
    };
  });

  const freeCount = portWithStatus.filter((p) => p.statusType === "free").length;
  const paidCount = portWithStatus.filter((p) => p.statusType === "allotted_paid").length;
  const unpaidCount = portWithStatus.filter((p) => p.statusType === "allotted_unpaid").length;
  const takenCount = paidCount + unpaidCount;

  // Sorted list based on sortMode
  const sortedPortfolios = [...portWithStatus].sort((a, b) => {
    if (sortMode === "free") {
      if (a.statusType === "free" && b.statusType !== "free") return -1;
      if (a.statusType !== "free" && b.statusType === "free") return 1;
    } else if (sortMode === "paid") {
      if (a.statusType === "allotted_paid" && b.statusType !== "allotted_paid") return -1;
      if (a.statusType !== "allotted_paid" && b.statusType === "allotted_paid") return 1;
    } else if (sortMode === "unpaid") {
      if (a.statusType === "allotted_unpaid" && b.statusType !== "allotted_unpaid") return -1;
      if (a.statusType !== "allotted_unpaid" && b.statusType === "allotted_unpaid") return 1;
    } else if (sortMode === "az") {
      return a.countryName.localeCompare(b.countryName);
    }
    return 0;
  });

  const sim = autoAllotSimulation;
  const currentConflict = sim.conflicts[currentConflictIndex] || sim.conflicts[0];

  const handleExecuteAllot = () => {
    executeAutoAllot();
    setShowAutoAllotModal(false);
    alert(`Auto-allotment executed! ${sim.totalEligible} delegates have been allotted.`);
  };

  const handleResolveSingle = (chosenRegId: string) => {
    if (!currentConflict) return;
    resolveConflict(currentConflict.portfolioId, chosenRegId);
    if (currentConflictIndex < sim.conflicts.length - 1) {
      setCurrentConflictIndex(currentConflictIndex + 1);
    } else {
      setShowConflictsModal(false);
      alert("All conflicts reviewed and resolved!");
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedPortfolioIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllInCommittee = () => {
    const allIds = committeePortfolios.map((p) => p.id);
    if (selectedPortfolioIds.length === allIds.length && allIds.length > 0) {
      setSelectedPortfolioIds([]);
    } else {
      setSelectedPortfolioIds(allIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPortfolioIds.length === 0) return;
    if (confirm(`Delete ${selectedPortfolioIds.length} selected countries/portfolios?`)) {
      deleteMultiplePortfolios(selectedPortfolioIds);
      setSelectedPortfolioIds([]);
    }
  };

  const handleDeleteSingle = (id: string) => {
    const port = portfolios.find((p) => p.id === id);
    if (confirm(`Delete ${port?.countryName || "this portfolio"}?`)) {
      deletePortfolio(id);
      setSelectedPortfolioIds((prev) => prev.filter((item) => item !== id));
    }
  };

  if (!event.name || event.id === "new-conference" || event.status !== "published") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white">
            Allotment
          </h1>
          <button
            type="button"
            onClick={publishAllotmentsToggle}
            className={`px-4 py-2 rounded-xl text-base font-heading font-extrabold transition-colors cursor-pointer ${
              event.rules.allotmentsPublished
                ? "bg-emerald-500 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {event.rules.allotmentsPublished ? "Published to delegates" : "Publish allotments"}
          </button>
        </div>

        <div>
          <Button
            size="md"
            fullWidth={false}
            onClick={() => setShowAutoAllotModal(true)}
            className="w-full sm:w-auto px-8"
          >
            Auto allot
          </Button>
        </div>
      </div>

      {/* Mobile Tab Toggle matching Page 19 */}
      <div className="flex lg:hidden gap-3">
        <button
          type="button"
          onClick={() => setMobileTab("unallotted")}
          className={`flex-1 py-3 px-4 rounded-2xl text-xl font-heading font-extrabold cursor-pointer transition-colors ${
            mobileTab === "unallotted"
              ? "bg-white text-[#0B1B33]"
              : "border-2 border-white text-white"
          }`}
        >
          Unallotted {unallottedDelegates.length}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("committees")}
          className={`flex-1 py-3 px-4 rounded-2xl text-xl font-heading font-extrabold cursor-pointer transition-colors ${
            mobileTab === "committees"
              ? "bg-white text-[#0B1B33]"
              : "border-2 border-white text-white"
          }`}
        >
          Committees
        </button>
      </div>

      {/* Main Grid: Unallotted (Left) + Committee Portfolios (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Unallotted List (Page 19 & 24) */}
        <div
          className={`lg:col-span-5 bg-white text-[#0B1B33] rounded-3xl p-6 space-y-4 max-h-[820px] overflow-y-auto ${
            mobileTab === "committees" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
              Unallotted, {unallottedDelegates.length}
            </h2>
          </div>

          <div className="space-y-3">
            {unallottedDelegates.length === 0 ? (
              <div className="py-8 text-center text-lg text-neutral-500 font-medium">
                All delegates are allotted!
              </div>
            ) : (
              unallottedDelegates.map((del) => {
                const p1 = del.preferences[0];
                const commName =
                  committees.find((c) => c.id === p1?.committeeId)?.name || "UNSC";
                const portNames = (p1?.portfolioIds || [])
                  .map((pid) => portfolios.find((p) => p.id === pid)?.countryName || pid)
                  .join(", ");

                return (
                  <div
                    key={del.id}
                    onClick={() => setAssigningDelegate(del)}
                    className="p-4 rounded-2xl border border-neutral-200 hover:border-[#1560BD] hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-heading font-extrabold text-[#0B1B33]">
                        {del.delegateName}
                      </div>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {del.school}
                      </span>
                    </div>
                    <div className="text-base text-neutral-600 font-medium mt-1">
                      {commName}: {portNames || "No preferences set"}
                    </div>
                    <div className="text-xs text-[#1560BD] font-bold mt-2">
                      Click to assign open country →
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Committee Matrix (Page 24) */}
        <div
          className={`lg:col-span-7 bg-white text-[#0B1B33] rounded-3xl p-6 space-y-6 ${
            mobileTab === "unallotted" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Committee Switcher Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {committees.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveCommitteeId(c.id);
                  setSelectedPortfolioIds([]);
                }}
                className={`px-4 py-2 rounded-xl text-lg font-heading font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                  activeCommittee.id === c.id
                    ? "bg-[#1560BD] text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Committee Status Title & Bar matching Page 24 */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-2xl font-heading font-extrabold text-[#0B1B33]">
              <span>
                {activeCommittee.name}, {takenCount} of {Math.max(activeCommittee.totalSeats, committeePortfolios.length, 1)} filled
              </span>
              <div className="flex items-center gap-2 text-sm font-heading font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {freeCount} Free
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-[#0F4C96] text-xs font-bold">
                  {paidCount} Paid
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold">
                  {unpaidCount} Unpaid
                </span>
              </div>
            </div>
            <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#1560BD] h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (takenCount / Math.max(1, activeCommittee.totalSeats, committeePortfolios.length)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Add Country / Leader Combobox */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2">
            <label className="block text-base font-heading font-extrabold text-[#0B1B33]">
              Add Country or Leader to {activeCommittee.name}
            </label>
            <PortfolioCombobox
              placeholder="Search country or Indian politician (e.g. India, Narendra Modi, France)..."
              existingNames={committeePortfolios.map((p) => p.countryName)}
              onAdd={(item) => {
                addPortfolioToCommittee(activeCommittee.id, item);
              }}
            />
          </div>

          {/* Sorting & Multi-select Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-neutral-100 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-heading font-bold text-neutral-500 mr-1 flex items-center gap-1">
                <ArrowUpDown className="w-4 h-4" /> Sort:
              </span>
              <button
                type="button"
                onClick={() => setSortMode("all")}
                className={`px-3 py-1 rounded-lg text-sm font-heading font-bold cursor-pointer transition-colors ${
                  sortMode === "all"
                    ? "bg-[#0B1B33] text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                All ({committeePortfolios.length})
              </button>
              <button
                type="button"
                onClick={() => setSortMode("free")}
                className={`px-3 py-1 rounded-lg text-sm font-heading font-bold cursor-pointer transition-colors ${
                  sortMode === "free"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Free first ({freeCount})
              </button>
              <button
                type="button"
                onClick={() => setSortMode("paid")}
                className={`px-3 py-1 rounded-lg text-sm font-heading font-bold cursor-pointer transition-colors ${
                  sortMode === "paid"
                    ? "bg-[#1560BD] text-white"
                    : "bg-blue-50 text-[#0F4C96] hover:bg-blue-100"
                }`}
              >
                Paid first ({paidCount})
              </button>
              <button
                type="button"
                onClick={() => setSortMode("unpaid")}
                className={`px-3 py-1 rounded-lg text-sm font-heading font-bold cursor-pointer transition-colors ${
                  sortMode === "unpaid"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`}
              >
                Unpaid first ({unpaidCount})
              </button>
              <button
                type="button"
                onClick={() => setSortMode("az")}
                className={`px-3 py-1 rounded-lg text-sm font-heading font-bold cursor-pointer transition-colors ${
                  sortMode === "az"
                    ? "bg-[#0B1B33] text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                A - Z
              </button>
            </div>

            {/* Bulk Selection Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllInCommittee}
                className="text-xs font-heading font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer flex items-center gap-1"
              >
                {selectedPortfolioIds.length === committeePortfolios.length && committeePortfolios.length > 0 ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-[#1560BD]" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" /> Select All
                  </>
                )}
              </button>

              {selectedPortfolioIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="px-3 py-1 rounded-lg text-xs font-heading font-extrabold bg-red-600 hover:bg-red-700 text-white cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedPortfolioIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Interactive Portfolios List with Status Color Codes & Actions */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {sortedPortfolios.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 font-medium">
                No countries or portfolios in this committee yet. Use the search bar above to add countries.
              </div>
            ) : (
              sortedPortfolios.map((port) => {
                const isSelected = selectedPortfolioIds.includes(port.id);
                const isFree = port.statusType === "free";
                const isPaid = port.statusType === "allotted_paid";
                const isUnpaid = port.statusType === "allotted_unpaid";

                const rowBg = isPaid
                  ? "bg-blue-50/70 border-blue-200 hover:bg-blue-50"
                  : isUnpaid
                  ? "bg-amber-50/70 border-amber-200 hover:bg-amber-50"
                  : "bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50";

                return (
                  <div
                    key={port.id}
                    className={`p-3 sm:p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${rowBg} ${
                      isSelected ? "ring-2 ring-[#FFD23F] border-[#1560BD]" : ""
                    }`}
                  >
                    {/* Left: Checkbox + Country Monogram (with hover delete cross) + Name */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(port.id)}
                        className="w-5 h-5 rounded text-[#1560BD] focus:ring-0 cursor-pointer"
                        title="Select for bulk actions"
                      />

                      {/* Interactive Country Monogram: hover shows cross to delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(port.id)}
                        title="Click to delete this country"
                        className="group relative w-10 h-10 rounded-full bg-[#0F4C96] text-white flex items-center justify-center font-heading font-extrabold text-sm hover:bg-red-600 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <span className="group-hover:hidden">{port.code.slice(0, 2).toUpperCase()}</span>
                        <span className="hidden group-hover:inline text-white text-base">✕</span>
                      </button>

                      <div>
                        <div className="text-xl font-heading font-extrabold text-[#0B1B33]">
                          {port.countryName}
                        </div>
                        {/* Status Label Pill */}
                        <div className="mt-0.5">
                          {isFree && (
                            <span className="inline-block text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              Free
                            </span>
                          )}
                          {isPaid && (
                            <span className="inline-block text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#1560BD] text-white">
                              Allotted & Paid
                            </span>
                          )}
                          {isUnpaid && (
                            <span className="inline-block text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-600 text-white">
                              Allotted (Unpaid)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Allotted Delegate info or Assign Action */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {!isFree && port.delegate ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-heading font-bold text-[#0B1B33]">
                              {port.delegate.delegateName}
                            </div>
                            <div className="text-xs text-neutral-600">
                              {port.delegate.school}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => unallotDelegate(port.delegate!.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Unallot delegate"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (unallottedDelegates.length > 0) {
                              // Assign first unallotted delegate
                              allotDelegateManual(unallottedDelegates[0].id, activeCommittee.id, port.id);
                            } else {
                              alert("No unallotted delegates available. All delegates have portfolios!");
                            }
                          }}
                          className="px-4 py-1.5 rounded-xl text-base font-heading font-extrabold bg-white border border-neutral-300 hover:border-[#1560BD] hover:text-[#1560BD] transition-colors cursor-pointer flex items-center gap-1.5 text-neutral-700"
                        >
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          Assign
                        </button>
                      )}

                      {/* Single Delete icon */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(port.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete country portfolio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AUTO ALLOT PREVIEW MODAL (Pages 20 & 25) */}
      {showAutoAllotModal && (
        <div className="fixed inset-0 z-50 bg-[#1560BD]/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6">
            <h2 className="text-4xl font-heading font-extrabold text-[#0B1B33]">
              Ready to allot
            </h2>

            {/* 3 Metric Cards matching Page 20 & 25 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-neutral-50 rounded-2xl p-4 text-center">
                <div className="text-4xl font-heading font-extrabold text-[#0B1B33]">
                  {sim.firstChoiceCount}
                </div>
                <div className="text-base font-heading font-bold text-neutral-600 mt-1">
                  first choice
                </div>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 text-center">
                <div className="text-4xl font-heading font-extrabold text-[#0B1B33]">
                  {sim.secondChoiceCount}
                </div>
                <div className="text-base font-heading font-bold text-neutral-600 mt-1">
                  second choice
                </div>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 text-center">
                <div className="text-4xl font-heading font-extrabold text-[#0B1B33]">
                  {sim.conflictsCount}
                </div>
                <div className="text-base font-heading font-bold text-neutral-600 mt-1">
                  need you
                </div>
              </div>
            </div>

            {/* Include Unpaid Toggle */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-base font-heading font-extrabold text-[#0B1B33]">
                  Include unpaid delegates
                </div>
                <div className="text-xs text-neutral-600 font-medium mt-0.5">
                  By default, only delegates with verified payment are allotted
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoAllotIncludeUnpaid}
                onChange={(e) => setAutoAllotIncludeUnpaid(e.target.checked)}
                className="w-5 h-5 accent-[#1560BD] cursor-pointer"
              />
            </div>

            <p className="text-lg text-neutral-600 font-medium">
              Nothing changes until you confirm.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleExecuteAllot}
                className="flex-1"
              >
                Allot {sim.totalEligible} delegates
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowAutoAllotModal(false);
                  setShowConflictsModal(true);
                  setCurrentConflictIndex(0);
                }}
                className="flex-1 border-2 border-neutral-300 hover:border-neutral-800 text-[#0B1B33] rounded-2xl p-4 text-lg font-heading font-extrabold text-center transition-colors cursor-pointer"
              >
                Review conflicts ({sim.conflictsCount})
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowAutoAllotModal(false)}
                className="text-base font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFLICT RESOLUTION MODAL (Page 21) */}
      {showConflictsModal && currentConflict && (
        <div className="fixed inset-0 z-50 bg-[#1560BD] flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
          <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setShowConflictsModal(false)}
                className="text-white hover:opacity-80 p-1 cursor-pointer font-bold text-lg flex items-center gap-2"
              >
                ← Back
              </button>

              <div>
                <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  {currentConflict.portfolioName} in {currentConflict.committeeName}
                </h2>
                <p className="text-xl sm:text-2xl text-white font-medium mt-2">
                  Two delegates chose it first.
                </p>
                <p className="text-sm text-white/70 font-bold uppercase tracking-wider mt-1">
                  Conflict {currentConflictIndex + 1} of {sim.conflicts.length}
                </p>
              </div>

              {/* Delegate Option 1 Card matching Page 21 */}
              <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-4">
                <div>
                  <h3 className="text-3xl font-heading font-extrabold text-[#0B1B33]">
                    {currentConflict.competingDelegates[0].registration.delegateName}
                  </h3>
                  <p className="text-lg text-neutral-600 font-medium mt-1">
                    {currentConflict.competingDelegates[0].reason}
                  </p>
                </div>

                <Button
                  onClick={() =>
                    handleResolveSingle(currentConflict.competingDelegates[0].registration.id)
                  }
                >
                  Give {currentConflict.portfolioName} to{" "}
                  {currentConflict.competingDelegates[0].registration.delegateName.split(" ")[0]}
                </Button>
              </div>

              {/* Delegate Option 2 Card matching Page 21 */}
              <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-4">
                <div>
                  <h3 className="text-3xl font-heading font-extrabold text-[#0B1B33]">
                    {currentConflict.competingDelegates[1].registration.delegateName}
                  </h3>
                  <p className="text-lg text-neutral-600 font-medium mt-1">
                    {currentConflict.competingDelegates[1].reason}
                  </p>
                </div>

                <Button
                  onClick={() =>
                    handleResolveSingle(currentConflict.competingDelegates[1].registration.id)
                  }
                >
                  Give {currentConflict.portfolioName} to{" "}
                  {currentConflict.competingDelegates[1].registration.delegateName.split(" ")[0]}
                </Button>
              </div>
            </div>

            <div className="pt-8 pb-4 text-center">
              <button
                type="button"
                onClick={() => setShowConflictsModal(false)}
                className="text-lg font-heading font-bold text-white/80 hover:text-white underline cursor-pointer"
              >
                Back to allotment overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assign Modal */}
      {assigningDelegate && (
        <div className="fixed inset-0 z-50 bg-[#1560BD]/90 flex items-center justify-center p-6">
          <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="text-2xl font-heading font-extrabold">
              Assign {assigningDelegate.delegateName}
            </h3>
            <p className="text-base text-neutral-600 font-medium">
              Pick an open portfolio in {activeCommittee.name}:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {committeePortfolios
                .filter((p) => p.status === "open")
                .map((port) => (
                  <button
                    key={port.id}
                    type="button"
                    onClick={() => {
                      allotDelegateManual(assigningDelegate.id, activeCommittee.id, port.id);
                      setAssigningDelegate(null);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 font-heading font-bold text-lg flex items-center gap-3 cursor-pointer"
                  >
                    <CountryMonogram code={port.code} size="sm" />
                    <span>{port.countryName}</span>
                  </button>
                ))}
            </div>

            <Button variant="white" onClick={() => setAssigningDelegate(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
