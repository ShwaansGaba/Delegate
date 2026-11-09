"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Registration, MunPortfolio, MunCommittee } from "@/lib/types";
import {
  Search,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  LayoutGrid,
  ListOrdered,
  Grid3X3,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

type ViewMode = "grid" | "queue" | "matrix";
type StatusFilter = "all" | "unallotted" | "attention" | "unpaid";

interface AllotmentHistoryItem {
  regId: string;
  delegateName: string;
  prevCommitteeId?: string;
  prevPortfolioId?: string;
}

export default function OrganizerAllotmentPage() {
  const router = useRouter();
  const {
    user,
    isAuthLoaded,
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
  } = useApp();

  // Guard against unauthenticated render
  if (!isAuthLoaded || !user) {
    return null;
  }

  // If conference is still in setup/draft, disallow allotment access
  useEffect(() => {
    if (!event.name || event.id === "new-conference") {
      router.replace("/organizer/conferences");
    } else if (event.status !== "published") {
      router.replace("/organizer/setup?step=basics");
    }
  }, [event.name, event.id, event.status, router]);

  // View mode switcher: Grid, Queue, Matrix
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Grid filtering & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Grid focused delegate (for keyboard shortcuts 1, 2, 3 and Z)
  const [focusedDelegateId, setFocusedDelegateId] = useState<string | null>(null);

  // Undo history stack
  const [historyStack, setHistoryStack] = useState<AllotmentHistoryItem[]>([]);

  // Queue View index
  const [queueIndex, setQueueIndex] = useState(0);

  // Matrix View selected open seat: { committeeId: string, portfolioId: string }
  const [matrixSelectedSeat, setMatrixSelectedSeat] = useState<{
    committeeId: string;
    portfolioId: string;
    committeeName: string;
    countryName: string;
  } | null>(null);
  const [matrixSearchQuery, setMatrixSearchQuery] = useState("");

  // Manual "Choose" modal state
  const [chooseModalDelegate, setChooseModalDelegate] = useState<Registration | null>(null);
  const [chooseCommitteeId, setChooseCommitteeId] = useState<string>("");
  const [choosePortfolioId, setChoosePortfolioId] = useState<string>("");

  // Auto-allot modal
  const [showAutoAllotModal, setShowAutoAllotModal] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ text: string; type: "success" | "warning" | "info" } | null>(null);
  const showToast = useCallback((text: string, type: "success" | "warning" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Summary Metrics
  const totalDelegates = registrations.length;
  const allottedCount = registrations.filter((r) => r.allotment).length;
  const unallottedCount = totalDelegates - allottedCount;
  const paidCount = registrations.filter((r) => r.paymentStatus === "verified").length;
  const totalPortfolios = portfolios.length;
  const filledSeats = portfolios.filter((p) => p.status === "taken").length;

  // Unallotted delegates list for Queue and Matrix assignment
  const unallottedDelegates = useMemo(() => {
    return registrations.filter((r) => !r.allotment);
  }, [registrations]);

  // Keep queue index within bounds
  useEffect(() => {
    if (unallottedDelegates.length > 0 && queueIndex >= unallottedDelegates.length) {
      setQueueIndex(Math.max(0, unallottedDelegates.length - 1));
    }
  }, [unallottedDelegates.length, queueIndex]);

  // Set default focused delegate in Grid view
  useEffect(() => {
    if (!focusedDelegateId && registrations.length > 0) {
      const firstUnallotted = registrations.find((r) => !r.allotment);
      setFocusedDelegateId(firstUnallotted ? firstUnallotted.id : registrations[0].id);
    }
  }, [registrations, focusedDelegateId]);

  // Helper: Portfolio availability map
  const portfolioAvailabilityMap = useMemo(() => {
    const map = new Map<string, { isTaken: boolean; delegateName?: string; regId?: string }>();
    for (const p of portfolios) {
      const assignedReg = registrations.find(
        (r) => r.id === p.allottedRegistrationId || r.allotment?.portfolioId === p.id
      );
      const isTaken = p.status === "taken" || Boolean(assignedReg);
      map.set(p.id, {
        isTaken,
        delegateName: assignedReg?.delegateName,
        regId: assignedReg?.id,
      });
    }
    return map;
  }, [portfolios, registrations]);

  // Helper: check if a portfolio is available
  const isPortfolioAvailable = useCallback(
    (portfolioId: string) => {
      const info = portfolioAvailabilityMap.get(portfolioId);
      return info ? !info.isTaken : true;
    },
    [portfolioAvailabilityMap]
  );

  // Helper: check if all preferences of a delegate are taken
  const areAllPreferencesTaken = useCallback(
    (reg: Registration) => {
      if (!reg.preferences || reg.preferences.length === 0) return false;
      let totalPrefs = 0;
      let takenPrefs = 0;
      for (const pref of reg.preferences) {
        for (const pId of pref.portfolioIds || []) {
          totalPrefs++;
          if (!isPortfolioAvailable(pId)) {
            takenPrefs++;
          }
        }
      }
      return totalPrefs > 0 && totalPrefs === takenPrefs;
    },
    [isPortfolioAvailable]
  );

  // Helper: get first available preference for a delegate
  const getFirstAvailablePreference = useCallback(
    (reg: Registration) => {
      for (const pref of reg.preferences || []) {
        for (const pId of pref.portfolioIds || []) {
          if (isPortfolioAvailable(pId)) {
            const port = portfolios.find((p) => p.id === pId);
            const comm = committees.find((c) => c.id === pref.committeeId);
            return {
              committeeId: pref.committeeId,
              committeeName: comm?.name || "Committee",
              portfolioId: pId,
              countryName: port?.countryName || pId,
            };
          }
        }
      }
      return null;
    },
    [isPortfolioAvailable, portfolios, committees]
  );

  // Core Allotment action with history recording
  const handleAllotSeat = async (regId: string, committeeId: string, portfolioId: string) => {
    const targetReg = registrations.find((r) => r.id === regId);
    const targetPort = portfolios.find((p) => p.id === portfolioId);
    const targetComm = committees.find((c) => c.id === committeeId);

    // Record in history for Undo
    setHistoryStack((prev) => [
      ...prev,
      {
        regId,
        delegateName: targetReg?.delegateName || "Delegate",
        prevCommitteeId: targetReg?.allotment?.committeeId,
        prevPortfolioId: targetReg?.allotment?.portfolioId,
      },
    ]);

    const res = await allotDelegateManual(regId, committeeId, portfolioId);
    if (res.success) {
      if (res.reassignedDelegateName) {
        showToast(
          `Reassigned ${targetPort?.countryName || "seat"} (${targetComm?.name || "Committee"}) to ${
            targetReg?.delegateName || "delegate"
          }. ${res.reassignedDelegateName} is now unallotted.`,
          "warning"
        );
      } else {
        showToast(
          `Allotted ${targetPort?.countryName || "seat"} (${targetComm?.name || "Committee"}) to ${
            targetReg?.delegateName || "delegate"
          }!`,
          "success"
        );
      }
    }
  };

  // Unallot seat action
  const handleUnallotSeat = async (regId: string) => {
    const targetReg = registrations.find((r) => r.id === regId);
    setHistoryStack((prev) => [
      ...prev,
      {
        regId,
        delegateName: targetReg?.delegateName || "Delegate",
        prevCommitteeId: targetReg?.allotment?.committeeId,
        prevPortfolioId: targetReg?.allotment?.portfolioId,
      },
    ]);
    await unallotDelegate(regId);
    showToast(`Unallotted ${targetReg?.delegateName || "delegate"}. Seat is now free.`, "info");
  };

  // Undo last action (Z key or Undo button)
  const handleUndo = async () => {
    if (historyStack.length === 0) {
      showToast("Nothing to undo.", "info");
      return;
    }
    const lastAction = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    if (lastAction.prevCommitteeId && lastAction.prevPortfolioId) {
      await allotDelegateManual(lastAction.regId, lastAction.prevCommitteeId, lastAction.prevPortfolioId);
      showToast(`Restored previous allotment for ${lastAction.delegateName}.`, "info");
    } else {
      await unallotDelegate(lastAction.regId);
      showToast(`Undid allotment for ${lastAction.delegateName}. Seat is now open.`, "info");
    }
  };

  // Keyboard shortcut listener for Grid View (1, 2, 3 for preferences, Z for undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      // Undo shortcut: Z (without Ctrl or with Ctrl)
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Preference shortcuts: 1, 2, 3
      if (viewMode === "grid" && focusedDelegateId && (e.key === "1" || e.key === "2" || e.key === "3")) {
        const delegate = registrations.find((r) => r.id === focusedDelegateId);
        if (!delegate) return;

        const prefIndex = parseInt(e.key, 10) - 1;
        const targetPref = delegate.preferences?.[prefIndex];
        if (!targetPref) {
          showToast(`No Preference #${e.key} for ${delegate.delegateName}.`, "warning");
          return;
        }

        // Find first available portfolio in this preference
        const availablePId = (targetPref.portfolioIds || []).find((pId) => isPortfolioAvailable(pId));
        if (availablePId) {
          e.preventDefault();
          handleAllotSeat(delegate.id, targetPref.committeeId, availablePId);

          // Auto-advance focused delegate to the next unallotted delegate
          const currentIndex = registrations.findIndex((r) => r.id === delegate.id);
          const nextUnallotted = registrations
            .slice(currentIndex + 1)
            .concat(registrations.slice(0, currentIndex))
            .find((r) => !r.allotment && r.id !== delegate.id);
          if (nextUnallotted) {
            setFocusedDelegateId(nextUnallotted.id);
          }
        } else {
          showToast(`All choices in Preference #${e.key} are already taken!`, "warning");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, focusedDelegateId, registrations, isPortfolioAvailable, historyStack]);

  // Filtered Delegates for Grid View
  const gridDelegates = useMemo(() => {
    return registrations.filter((reg) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const allottedPort = portfolios.find((p) => p.id === reg.allotment?.portfolioId);
        const allottedComm = committees.find((c) => c.id === reg.allotment?.committeeId);
        const matches =
          reg.delegateName.toLowerCase().includes(q) ||
          reg.school.toLowerCase().includes(q) ||
          reg.registrationNumber.toLowerCase().includes(q) ||
          (allottedPort && allottedPort.countryName.toLowerCase().includes(q)) ||
          (allottedComm && allottedComm.name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Status Filter
      if (statusFilter === "unallotted") {
        return !reg.allotment;
      }
      if (statusFilter === "attention") {
        return !reg.allotment && (areAllPreferencesTaken(reg) || reg.paymentStatus !== "verified");
      }
      if (statusFilter === "unpaid") {
        return reg.paymentStatus !== "verified";
      }

      return true;
    });
  }, [registrations, portfolios, committees, searchQuery, statusFilter, areAllPreferencesTaken]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      "Row",
      "Registration Number",
      "Delegate Name",
      "School",
      "Payment Status",
      "Allotted Committee",
      "Allotted Portfolio",
      "Preference 1 Committee",
      "Preference 1 Portfolios",
      "Preference 2 Committee",
      "Preference 2 Portfolios",
      "Preference 3 Committee",
      "Preference 3 Portfolios",
    ];

    const rows = registrations.map((r, idx) => {
      const comm = committees.find((c) => c.id === r.allotment?.committeeId);
      const port = portfolios.find((p) => p.id === r.allotment?.portfolioId);

      const pref1 = r.preferences?.[0];
      const pref2 = r.preferences?.[1];
      const pref3 = r.preferences?.[2];

      const getCommName = (cId?: string) => committees.find((c) => c.id === cId)?.name || cId || "";
      const getPortNames = (pIds?: string[]) =>
        (pIds || []).map((id) => portfolios.find((p) => p.id === id)?.countryName || id).join(" / ");

      return [
        idx + 1,
        `"${r.registrationNumber || ""}"`,
        `"${(r.delegateName || "").replace(/"/g, '""')}"`,
        `"${(r.school || "").replace(/"/g, '""')}"`,
        r.paymentStatus === "verified" ? "Paid" : "Unpaid",
        `"${(comm?.name || "Unallotted").replace(/"/g, '""')}"`,
        `"${(port?.countryName || "Unallotted").replace(/"/g, '""')}"`,
        `"${getCommName(pref1?.committeeId)}"`,
        `"${getPortNames(pref1?.portfolioIds)}"`,
        `"${getCommName(pref2?.committeeId)}"`,
        `"${getPortNames(pref2?.portfolioIds)}"`,
        `"${getCommName(pref3?.committeeId)}"`,
        `"${getPortNames(pref3?.portfolioIds)}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safeConfName = (event.name || "Conference").replace(/[^a-z0-9]/gi, "_");
    link.setAttribute("download", `${safeConfName}_Allotments.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open manual Choose modal
  const openChooseModal = (reg: Registration) => {
    setChooseModalDelegate(reg);
    const defaultCommId = reg.preferences?.[0]?.committeeId || committees[0]?.id || "";
    setChooseCommitteeId(defaultCommId);
    setChoosePortfolioId("");
  };

  const handleConfirmChoose = async () => {
    if (!chooseModalDelegate || !chooseCommitteeId || !choosePortfolioId) return;
    await handleAllotSeat(chooseModalDelegate.id, chooseCommitteeId, choosePortfolioId);
    setChooseModalDelegate(null);
  };

  // Matrix View: All distinct country names across all committees
  const matrixCountryRows = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of portfolios) {
      const clean = p.countryName.trim();
      const lower = clean.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, clean);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [portfolios]);

  // Matrix View: Unallotted delegates filtered for assign panel
  const matrixFilteredUnallotted = useMemo(() => {
    if (!matrixSearchQuery.trim()) return unallottedDelegates;
    const q = matrixSearchQuery.toLowerCase();
    return unallottedDelegates.filter(
      (r) =>
        r.delegateName.toLowerCase().includes(q) ||
        r.school.toLowerCase().includes(q) ||
        r.registrationNumber.toLowerCase().includes(q)
    );
  }, [unallottedDelegates, matrixSearchQuery]);

  // Current delegate in Queue view
  const currentQueueDelegate = unallottedDelegates[queueIndex] || null;
  const currentQueueFirstAvailable = currentQueueDelegate ? getFirstAvailablePreference(currentQueueDelegate) : null;

  return (
    <div className="w-full text-white page-transition space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-bold animate-slideDown ${
            toast.type === "success"
              ? "bg-emerald-600 border-emerald-400 text-white"
              : toast.type === "warning"
              ? "bg-amber-500 border-amber-300 text-neutral-900"
              : "bg-blue-600 border-blue-400 text-white"
          }`}
        >
          <span className="flex-1">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-black/10 active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER: Title, View Switcher & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Allotment
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented View Switcher: Grid | Queue | Matrix */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#0B1B33] shadow-md"
                  : "text-white hover:text-white/80"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("queue")}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                viewMode === "queue"
                  ? "bg-white text-[#0B1B33] shadow-md"
                  : "text-white hover:text-white/80"
              }`}
            >
              Queue
            </button>
            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                viewMode === "matrix"
                  ? "bg-white text-[#0B1B33] shadow-md"
                  : "text-white hover:text-white/80"
              }`}
            >
              Matrix
            </button>
          </div>

          {/* Action Buttons: Export Excel & Auto allot */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-[#0B1B33] font-heading font-extrabold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-[#0B1B33]" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAutoAllotModal(true)}
            className="px-4 py-2 rounded-xl bg-[#FFC72C] hover:bg-yellow-400 text-neutral-900 font-heading font-extrabold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-neutral-900" />
            <span>Auto allot</span>
          </button>
        </div>
      </div>

      {/* 5 STAT CARDS: Delegates | Allotted | Not allotted | Paid | Seats filled */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 text-[#0B1B33] flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
            {totalDelegates}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Delegates</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 text-[#0B1B33] flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
            {allottedCount}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Allotted</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 text-[#0B1B33] flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
            {unallottedCount}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Not allotted</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 text-[#0B1B33] flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
            {paidCount}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Paid</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 text-[#0B1B33] col-span-2 sm:col-span-1 flex flex-col justify-between">
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
            {allottedCount} of {totalPortfolios}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Seats filled</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GRID VIEW LAYOUT                                                       */}
      {/* ========================================================================= */}
      {viewMode === "grid" && (
        <div className="space-y-4">
          {/* Filter Bar: Search Input + Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, school, or number"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white text-[#0B1B33] placeholder-neutral-400 text-sm font-medium border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-amber-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-[#0B1B33] shadow-sm"
                    : "bg-transparent text-white border border-white/30 hover:border-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("unallotted")}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                  statusFilter === "unallotted"
                    ? "bg-white text-[#0B1B33] shadow-sm"
                    : "bg-transparent text-white border border-white/30 hover:border-white"
                }`}
              >
                Not allotted
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("attention")}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                  statusFilter === "attention"
                    ? "bg-white text-[#0B1B33] shadow-sm"
                    : "bg-transparent text-white border border-white/30 hover:border-white"
                }`}
              >
                Needs attention
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("unpaid")}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                  statusFilter === "unpaid"
                    ? "bg-white text-[#0B1B33] shadow-sm"
                    : "bg-transparent text-white border border-white/30 hover:border-white"
                }`}
              >
                Unpaid
              </button>
            </div>
          </div>

          {/* Grid Table Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-neutral-200 overflow-hidden text-[#0B1B33]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-heading font-extrabold text-neutral-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6 w-[240px]">Delegate</th>
                    <th className="py-3.5 px-4 w-[200px]">Preference 1</th>
                    <th className="py-3.5 px-4 w-[200px]">Preference 2</th>
                    <th className="py-3.5 px-4 w-[200px]">Preference 3</th>
                    <th className="py-3.5 px-4 sm:px-6 w-[180px]">Allotted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {gridDelegates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-neutral-500 font-medium">
                        No delegates match your current search or filters.
                      </td>
                    </tr>
                  ) : (
                    gridDelegates.map((reg) => {
                      const isFocused = focusedDelegateId === reg.id;
                      const isAllotted = Boolean(reg.allotment);
                      const isPaid = reg.paymentStatus === "verified";
                      const allTaken = !isAllotted && areAllPreferencesTaken(reg);
                      const firstAvail = !isAllotted ? getFirstAvailablePreference(reg) : null;

                      const allottedComm = committees.find((c) => c.id === reg.allotment?.committeeId);
                      const allottedPort = portfolios.find((p) => p.id === reg.allotment?.portfolioId);

                      return (
                        <tr
                          key={reg.id}
                          onClick={() => setFocusedDelegateId(reg.id)}
                          className={`transition-colors cursor-pointer group ${
                            isFocused
                              ? "bg-amber-50/60 ring-2 ring-inset ring-amber-400"
                              : "hover:bg-neutral-50/80"
                          }`}
                        >
                          {/* 1. Delegate Column */}
                          <td className="py-4 px-4 sm:px-6 align-top">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-extrabold text-neutral-900 text-sm sm:text-base">
                                {reg.delegateName}
                              </span>
                              {allTaken && (
                                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  All choices taken
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 font-medium mt-0.5">
                              <span>{reg.school}</span>
                              <span className="mx-1">•</span>
                              <span
                                className={`font-semibold ${
                                  isPaid ? "text-neutral-600" : "text-rose-600"
                                }`}
                              >
                                {isPaid ? "Paid" : "Unpaid"}
                              </span>
                            </div>
                          </td>

                          {/* 2. Preference 1 Column */}
                          <td className="py-4 px-4 align-top">
                            {renderPreferenceCell(
                              reg,
                              0,
                              firstAvail?.portfolioId,
                              handleAllotSeat,
                              isPortfolioAvailable,
                              portfolios,
                              committees
                            )}
                          </td>

                          {/* 3. Preference 2 Column */}
                          <td className="py-4 px-4 align-top">
                            {renderPreferenceCell(
                              reg,
                              1,
                              firstAvail?.portfolioId,
                              handleAllotSeat,
                              isPortfolioAvailable,
                              portfolios,
                              committees
                            )}
                          </td>

                          {/* 4. Preference 3 Column */}
                          <td className="py-4 px-4 align-top">
                            {renderPreferenceCell(
                              reg,
                              2,
                              firstAvail?.portfolioId,
                              handleAllotSeat,
                              isPortfolioAvailable,
                              portfolios,
                              committees
                            )}
                          </td>

                          {/* 5. Allotted Column */}
                          <td className="py-4 px-4 sm:px-6 align-top">
                            {isAllotted ? (
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="font-heading font-extrabold text-[#0B1B33] text-sm">
                                    {allottedComm?.name || "Committee"},{" "}
                                    {allottedPort?.countryName || "Country"}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnallotSeat(reg.id);
                                  }}
                                  className="text-neutral-400 hover:text-rose-600 text-xs font-bold p-1 rounded-md transition-colors"
                                  title="Unallot seat"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : !isPaid ? (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-neutral-400">Not paid</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openChooseModal(reg);
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-neutral-300 hover:border-neutral-400 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                                >
                                  Choose
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openChooseModal(reg);
                                }}
                                className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:border-amber-400 text-xs font-heading font-extrabold text-[#0B1B33] hover:bg-amber-50/40 transition-colors cursor-pointer"
                              >
                                Choose
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-4 sm:px-6 py-3 bg-neutral-50/80 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 font-medium">
              <div>
                Click a yellow portfolio to allot it. Press 1, 2, or 3 to accept the focused delegate&apos;s preference. Press Z to undo.
              </div>
              {historyStack.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndo}
                  className="font-bold text-[#1560BD] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Undo last ({historyStack[historyStack.length - 1].delegateName})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. QUEUE VIEW LAYOUT                                                      */}
      {/* ========================================================================= */}
      {viewMode === "queue" && (
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-sm font-semibold text-blue-100">
              {unallottedDelegates.length > 0
                ? `Delegate ${queueIndex + 1} of ${unallottedDelegates.length}`
                : "Queue Complete"}
            </span>
          </div>

          {unallottedDelegates.length === 0 ? (
            <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-xl text-[#0B1B33] text-center space-y-4 border border-neutral-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
                All Delegates Allotted!
              </h2>
              <p className="text-neutral-500 text-sm max-w-md mx-auto">
                Every registered delegate has been assigned a seat. You can review and adjust seats in the Grid or Matrix view.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className="px-6 py-2.5 rounded-xl bg-[#1560BD] hover:bg-blue-700 text-white font-heading font-extrabold text-sm shadow-md transition-all cursor-pointer"
                >
                  Return to Grid View
                </button>
              </div>
            </div>
          ) : currentQueueDelegate ? (
            <div className="max-w-2xl w-full mx-auto space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl text-[#0B1B33] border border-neutral-200 space-y-6">
                {/* Delegate Heading & Metadata */}
                <div className="border-b border-neutral-100 pb-5">
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
                    {currentQueueDelegate.delegateName}
                  </h2>
                  <div className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1 flex flex-wrap items-center gap-1.5">
                    <span>{currentQueueDelegate.school}</span>
                    {currentQueueDelegate.classYear && (
                      <>
                        <span>•</span>
                        <span>Class {currentQueueDelegate.classYear}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{currentQueueDelegate.experienceMuns || 0} MUNs</span>
                    <span>•</span>
                    <span
                      className={`font-bold ${
                        currentQueueDelegate.paymentStatus === "verified"
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      {currentQueueDelegate.paymentStatus === "verified" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>

                {/* 3 Preferences Stack */}
                <div className="space-y-4">
                  {[0, 1, 2].map((prefIdx) => {
                    const pref = currentQueueDelegate.preferences?.[prefIdx];
                    const comm = committees.find((c) => c.id === pref?.committeeId);
                    const label = prefIdx === 0 ? "First" : prefIdx === 1 ? "Second" : "Third";

                    if (!pref || !comm) {
                      return (
                        <div key={prefIdx} className="space-y-1.5">
                          <div className="text-xs font-heading font-extrabold text-neutral-700 uppercase tracking-wider">
                            {label} committee: None
                          </div>
                          <div className="text-xs text-neutral-400 italic">No preference submitted</div>
                        </div>
                      );
                    }

                    return (
                      <div key={prefIdx} className="space-y-2">
                        <div className="text-xs sm:text-sm font-heading font-extrabold text-neutral-800">
                          {label} committee: {comm.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {(pref.portfolioIds || []).map((pId) => {
                            const port = portfolios.find((p) => p.id === pId);
                            const name = port?.countryName || pId;
                            const isAvailable = isPortfolioAvailable(pId);
                            const isFirstAvail = currentQueueFirstAvailable?.portfolioId === pId;

                            if (!isAvailable) {
                              return (
                                <span
                                  key={pId}
                                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium line-through text-neutral-400 bg-neutral-100 border border-neutral-200 cursor-not-allowed select-none"
                                  title="Taken"
                                >
                                  {name}
                                </span>
                              );
                            }

                            if (isFirstAvail) {
                              return (
                                <button
                                  key={pId}
                                  type="button"
                                  onClick={async () => {
                                    await handleAllotSeat(currentQueueDelegate.id, pref.committeeId, pId);
                                    setQueueIndex((prev) => Math.min(prev, unallottedDelegates.length - 2));
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#FFC72C] hover:bg-yellow-400 text-neutral-900 border border-amber-400 shadow-xs cursor-pointer active:scale-95 transition-all"
                                  title="Click to allot this portfolio"
                                >
                                  {name}
                                </button>
                              );
                            }

                            return (
                              <button
                                key={pId}
                                type="button"
                                onClick={async () => {
                                  await handleAllotSeat(currentQueueDelegate.id, pref.committeeId, pId);
                                  setQueueIndex((prev) => Math.min(prev, unallottedDelegates.length - 2));
                                }}
                                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-neutral-800 border-2 border-neutral-800 hover:border-amber-400 hover:bg-amber-50 cursor-pointer active:scale-95 transition-all"
                                title="Click to allot this portfolio"
                              >
                                {name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Big Action Button: Allot First Available */}
                <div className="pt-2">
                  {currentQueueFirstAvailable ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleAllotSeat(
                          currentQueueDelegate.id,
                          currentQueueFirstAvailable.committeeId,
                          currentQueueFirstAvailable.portfolioId
                        );
                        setQueueIndex((prev) => Math.min(prev, unallottedDelegates.length - 2));
                      }}
                      className="w-full py-3.5 px-6 rounded-2xl bg-[#FFC72C] hover:bg-yellow-400 text-neutral-900 font-heading font-extrabold text-sm sm:text-base shadow-md cursor-pointer transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5 text-neutral-900" />
                      <span>
                        Allot first available: {currentQueueFirstAvailable.committeeName},{" "}
                        {currentQueueFirstAvailable.countryName}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openChooseModal(currentQueueDelegate)}
                      className="w-full py-3.5 px-6 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-heading font-extrabold text-sm sm:text-base border border-neutral-300 cursor-pointer transition-all"
                    >
                      All choices taken • Choose manual seat
                    </button>
                  )}
                </div>

                {/* Navigation Buttons: Previous | Skip | Next */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={queueIndex === 0}
                    onClick={() => setQueueIndex((prev) => Math.max(0, prev - 1))}
                    className={`py-2.5 px-4 rounded-xl border-2 border-neutral-800 font-heading font-extrabold text-xs sm:text-sm text-neutral-900 text-center transition-all ${
                      queueIndex === 0
                        ? "opacity-40 cursor-not-allowed border-neutral-300 text-neutral-400"
                        : "hover:bg-neutral-50 active:scale-95 cursor-pointer"
                    }`}
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setQueueIndex((prev) => (prev + 1) % unallottedDelegates.length)
                    }
                    className="py-2.5 px-4 rounded-xl border-2 border-neutral-800 font-heading font-extrabold text-xs sm:text-sm text-neutral-900 text-center hover:bg-neutral-50 active:scale-95 cursor-pointer transition-all"
                  >
                    Skip
                  </button>

                  <button
                    type="button"
                    disabled={queueIndex >= unallottedDelegates.length - 1}
                    onClick={() =>
                      setQueueIndex((prev) => Math.min(unallottedDelegates.length - 1, prev + 1))
                    }
                    className={`py-2.5 px-4 rounded-xl border-2 border-neutral-800 font-heading font-extrabold text-xs sm:text-sm text-neutral-900 text-center transition-all ${
                      queueIndex >= unallottedDelegates.length - 1
                        ? "opacity-40 cursor-not-allowed border-neutral-300 text-neutral-400"
                        : "hover:bg-neutral-50 active:scale-95 cursor-pointer"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Legend Caption */}
              <div className="text-center text-xs sm:text-sm font-medium text-blue-100">
                Yellow means available. Struck out means already allotted to someone else.
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MATRIX VIEW LAYOUT                                                     */}
      {/* ========================================================================= */}
      {viewMode === "matrix" && (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Table Container */}
          <div className="flex-1 w-full min-w-0 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-neutral-200 overflow-hidden text-[#0B1B33]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="py-3 px-4 font-heading font-extrabold text-xs text-neutral-500 uppercase tracking-wider w-[140px]">
                      Country / Seat
                    </th>
                    {committees.map((comm) => (
                      <th
                        key={comm.id}
                        className="py-3 px-3 font-heading font-extrabold text-xs sm:text-sm text-neutral-800 text-center"
                      >
                        {comm.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
                  {matrixCountryRows.map((countryName) => (
                    <tr key={countryName} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Country Name */}
                      <td className="py-2.5 px-4 font-heading font-extrabold text-neutral-800 whitespace-nowrap">
                        {countryName}
                      </td>

                      {/* Committee Columns */}
                      {committees.map((comm) => {
                        const port = portfolios.find(
                          (p) =>
                            p.committeeId === comm.id &&
                            p.countryName.trim().toLowerCase() === countryName.trim().toLowerCase()
                        );

                        if (!port) {
                          return (
                            <td key={comm.id} className="py-2.5 px-2 text-center text-neutral-300">
                              -
                            </td>
                          );
                        }

                        const assignedReg = registrations.find(
                          (r) => r.id === port.allottedRegistrationId || r.allotment?.portfolioId === port.id
                        );
                        const isTaken = port.status === "taken" || Boolean(assignedReg);
                        const isSelected =
                          matrixSelectedSeat?.portfolioId === port.id &&
                          matrixSelectedSeat?.committeeId === comm.id;

                        return (
                          <td key={comm.id} className="py-2 px-2 text-center">
                            {isTaken ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (assignedReg) {
                                    if (confirm(`Unallot ${assignedReg.delegateName} from ${countryName} (${comm.name})?`)) {
                                      handleUnallotSeat(assignedReg.id);
                                    }
                                  }
                                }}
                                className="w-full py-2 px-2.5 rounded-xl border border-neutral-200 bg-white hover:border-rose-400 text-center font-bold text-xs text-neutral-900 shadow-2xs transition-all cursor-pointer group"
                                title={`Allotted to ${assignedReg?.delegateName || "Delegate"}. Click to unallot.`}
                              >
                                <span className="truncate block max-w-[120px] mx-auto group-hover:text-rose-600">
                                  {assignedReg?.delegateName || "Allotted"}
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setMatrixSelectedSeat({
                                    committeeId: comm.id,
                                    portfolioId: port.id,
                                    committeeName: comm.name,
                                    countryName: port.countryName,
                                  })
                                }
                                className={`w-full py-2 px-2.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-2 border-dashed border-amber-500 bg-amber-50 text-amber-950 font-extrabold shadow-xs"
                                    : "border-dashed border-neutral-300 text-neutral-400 hover:border-amber-400 hover:text-neutral-700 bg-neutral-50/40"
                                }`}
                              >
                                Open
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Assign Sidebar Panel */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-neutral-200 text-[#0B1B33] sticky top-4 space-y-4">
            {matrixSelectedSeat ? (
              <>
                <div>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33]">
                    Assign {matrixSelectedSeat.committeeName}, {matrixSelectedSeat.countryName}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                    Type to search {unallottedDelegates.length} not allotted
                  </p>
                </div>

                {/* Search unallotted delegates */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={matrixSearchQuery}
                    onChange={(e) => setMatrixSearchQuery(e.target.value)}
                    placeholder="Type name or school..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-amber-400 text-sm font-medium text-[#0B1B33] focus:outline-hidden"
                  />
                  {matrixSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMatrixSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Delegate List */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {matrixFilteredUnallotted.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400 text-xs">
                      No matching unallotted delegates found.
                    </div>
                  ) : (
                    matrixFilteredUnallotted.map((reg) => {
                      // Check if delegate preferred this seat
                      const preferredRank = (reg.preferences || []).findIndex(
                        (p) =>
                          p.committeeId === matrixSelectedSeat.committeeId &&
                          (p.portfolioIds || []).includes(matrixSelectedSeat.portfolioId)
                      );

                      return (
                        <div
                          key={reg.id}
                          className="p-3 rounded-xl border border-neutral-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-extrabold text-sm text-[#0B1B33] truncate">
                                {reg.delegateName}
                              </span>
                              {preferredRank !== -1 && (
                                <span className="text-[10px] font-extrabold bg-[#FFC72C] text-neutral-900 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                  Pref #{preferredRank + 1}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-medium truncate">
                              {reg.school}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              await handleAllotSeat(
                                reg.id,
                                matrixSelectedSeat.committeeId,
                                matrixSelectedSeat.portfolioId
                              );
                              setMatrixSelectedSeat(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#FFC72C] hover:bg-yellow-400 text-neutral-900 font-heading font-extrabold text-xs shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
                          >
                            Assign
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMatrixSelectedSeat(null)}
                    className="w-full py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel selection
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-neutral-500 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-neutral-300" />
                <div className="font-heading font-extrabold text-sm text-[#0B1B33]">
                  Select an Open Seat
                </div>
                <p className="text-xs text-neutral-400 max-w-[220px] mx-auto">
                  Click any &quot;Open&quot; dashed box in the matrix to search and allot an unallotted delegate.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL "CHOOSE" MODAL                                                     */}
      {/* ========================================================================= */}
      {chooseModalDelegate && (
        <div className="fixed inset-0 z-50 bg-[#0B1B33]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-[#0B1B33] space-y-5 animate-slideDown">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-heading font-extrabold text-[#0B1B33]">
                  Choose Portfolio
                </h3>
                <p className="text-xs text-neutral-500 font-semibold mt-0.5">
                  Manual allotment for {chooseModalDelegate.delegateName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChooseModalDelegate(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-extrabold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Select Committee
                </label>
                <select
                  value={chooseCommitteeId}
                  onChange={(e) => {
                    setChooseCommitteeId(e.target.value);
                    setChoosePortfolioId("");
                  }}
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 text-sm font-semibold text-[#0B1B33] focus:outline-hidden focus:border-amber-400 bg-white"
                >
                  {committees.map((comm) => (
                    <option key={comm.id} value={comm.id}>
                      {comm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Select Portfolio
                </label>
                <select
                  value={choosePortfolioId}
                  onChange={(e) => setChoosePortfolioId(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-neutral-200 text-sm font-semibold text-[#0B1B33] focus:outline-hidden focus:border-amber-400 bg-white"
                >
                  <option value="">-- Choose Country / Portfolio --</option>
                  {portfolios
                    .filter((p) => p.committeeId === chooseCommitteeId)
                    .map((p) => {
                      const avail = isPortfolioAvailable(p.id);
                      const assignedInfo = portfolioAvailabilityMap.get(p.id);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.countryName} {avail ? "(Available)" : `(Taken: ${assignedInfo?.delegateName || "Allotted"})`}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setChooseModalDelegate(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 font-bold text-xs sm:text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!chooseCommitteeId || !choosePortfolioId}
                onClick={handleConfirmChoose}
                className={`flex-1 py-2.5 rounded-xl font-heading font-extrabold text-xs sm:text-sm transition-all shadow-md ${
                  !chooseCommitteeId || !choosePortfolioId
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-[#FFC72C] hover:bg-yellow-400 text-neutral-900 cursor-pointer active:scale-95"
                }`}
              >
                Confirm Allot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTO-ALLOT SIMULATION & EXECUTION MODAL                                   */}
      {/* ========================================================================= */}
      {showAutoAllotModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1B33]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-[#0B1B33] space-y-5 animate-slideDown">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-extrabold text-[#0B1B33]">
                    Auto-Allotment Algorithm
                  </h3>
                  <p className="text-xs text-neutral-500 font-semibold">
                    Simulate & execute automated preference matching
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAutoAllotModal(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Algorithm settings */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoAllotIncludeUnpaid}
                  onChange={(e) => setAutoAllotIncludeUnpaid(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-[#1560BD]"
                />
                <span className="text-xs sm:text-sm font-semibold text-neutral-700">
                  Include Unpaid delegates in auto-allotment
                </span>
              </label>

              <div className="text-xs text-neutral-500 leading-relaxed">
                Prioritizes delegates by prior MUN experience and submission timestamps. Resolves 1st, 2nd, and 3rd choices automatically.
              </div>
            </div>

            {/* Simulation Preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-100/70 border border-neutral-200">
                <div className="text-xs text-neutral-500 font-bold uppercase">To Be Allotted</div>
                <div className="text-2xl font-heading font-extrabold text-neutral-900 mt-0.5">
                  {autoAllotSimulation.proposedAllotments.length}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-100/70 border border-neutral-200">
                <div className="text-xs text-neutral-500 font-bold uppercase">Conflicts / Manual</div>
                <div className="text-2xl font-heading font-extrabold text-neutral-900 mt-0.5">
                  {autoAllotSimulation.conflicts.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAutoAllotModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 font-bold text-xs sm:text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await executeAutoAllot();
                  setShowAutoAllotModal(false);
                  showToast("Automated allotment executed successfully!", "success");
                }}
                className="flex-1 py-2.5 rounded-xl font-heading font-extrabold text-xs sm:text-sm bg-[#FFC72C] hover:bg-yellow-400 text-neutral-900 shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Execute Allotment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// HELPER: Preference Cell Renderer in Grid View
// =========================================================================
function renderPreferenceCell(
  reg: Registration,
  prefIdx: number,
  firstAvailablePId: string | undefined,
  handleAllotSeat: (regId: string, committeeId: string, portfolioId: string) => Promise<void>,
  isPortfolioAvailable: (portfolioId: string) => boolean,
  portfolios: MunPortfolio[],
  committees: MunCommittee[]
) {
  const pref = reg.preferences?.[prefIdx];
  if (!pref) {
    return <span className="text-xs text-neutral-300 italic">-</span>;
  }

  const comm = committees.find((c) => c.id === pref.committeeId);
  const isDelegateAllotted = Boolean(reg.allotment);

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-heading font-extrabold text-neutral-700 uppercase tracking-wider">
        {comm?.name || pref.committeeId}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {(pref.portfolioIds || []).map((pId) => {
          const port = portfolios.find((p) => p.id === pId);
          const name = port?.countryName || pId;
          const isAvail = isPortfolioAvailable(pId);
          const isFirstAvail = !isDelegateAllotted && firstAvailablePId === pId;

          if (!isAvail) {
            return (
              <span
                key={pId}
                className="px-2 py-0.5 rounded-lg text-xs font-medium line-through text-neutral-400 bg-neutral-100 border border-neutral-200 cursor-not-allowed whitespace-nowrap select-none"
                title="Already allotted"
              >
                {name}
              </span>
            );
          }

          if (isFirstAvail) {
            return (
              <button
                key={pId}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAllotSeat(reg.id, pref.committeeId, pId);
                }}
                className="px-2.5 py-0.5 rounded-lg text-xs font-heading font-extrabold bg-[#FFC72C] hover:bg-yellow-400 text-neutral-900 border border-amber-400 shadow-2xs cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                title="Click to allot this portfolio"
              >
                {name}
              </button>
            );
          }

          return (
            <button
              key={pId}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAllotSeat(reg.id, pref.committeeId, pId);
              }}
              className="px-2 py-0.5 rounded-lg text-xs font-bold bg-white text-neutral-800 border border-neutral-300 hover:border-amber-400 hover:bg-amber-50 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
              title="Click to allot this portfolio"
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
