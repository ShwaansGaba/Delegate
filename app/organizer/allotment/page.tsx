"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { CountryMonogram } from "@/components/ui/CountryMonogram";
import { PortfolioCombobox } from "@/components/ui/PortfolioCombobox";
import { Button } from "@/components/ui/Button";
import { Registration, MunPortfolio, MunCommittee } from "@/lib/types";
import {
  Search,
  Download,
  ArrowUpDown,
  CheckSquare,
  Square,
  Trash2,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

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
    resolveConflict,
    publishAllotmentsToggle,
    deletePortfolio,
    deleteMultiplePortfolios,
    addPortfolioToCommittee,
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

  // View mode: Delegates Sheet vs Committee Seats Matrix
  const [viewMode, setViewMode] = useState<"delegates" | "matrix">("delegates");

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unallotted" | "allotted" | "paid" | "unpaid">("all");
  const [committeeFilter, setCommitteeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "school" | "reg" | "status">("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Matrix View Active Committee & Selection
  const [activeCommitteeId, setActiveCommitteeId] = useState<string>(committees[0]?.id || "");
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<string[]>([]);
  const [matrixSortMode, setMatrixSortMode] = useState<"all" | "free" | "paid" | "unpaid" | "az">("all");

  // Inline Allotment selection draft per delegate row: { [regId]: { committeeId: string, portfolioId: string } }
  const [rowDrafts, setRowDrafts] = useState<Record<string, { committeeId: string; portfolioId: string }>>({});

  // Pagination & GUI controls for large delegate counts
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingDelegateId, setEditingDelegateId] = useState<string | null>(null);

  // User friendly toast alerts for allot & reassignment
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "warning" | "info" } | null>(null);
  const showToast = (text: string, type: "success" | "warning" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Modals state
  const [showAutoAllotModal, setShowAutoAllotModal] = useState(false);
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);

  // Keep active committee in sync with existing committees
  useEffect(() => {
    if (committees.length > 0 && !committees.some((c) => c.id === activeCommitteeId)) {
      setActiveCommitteeId(committees[0].id);
    }
  }, [committees, activeCommitteeId]);

  // Computed Metrics
  const totalDelegates = registrations.length;
  const allottedCount = registrations.filter((r) => r.allotment).length;
  const unallottedCount = totalDelegates - allottedCount;
  const paidCount = registrations.filter((r) => r.paymentStatus === "verified").length;
  const unpaidCount = totalDelegates - paidCount;
  const totalPortfolios = portfolios.length;
  const filledSeats = portfolios.filter((p) => p.status === "taken").length;
  const freeSeats = totalPortfolios - filledSeats;

  // Active committee data for Matrix view
  const activeCommittee =
    committees.find((c) => c.id === activeCommitteeId) ||
    committees[0] || { id: "none", name: "No Committees", totalSeats: 0, eventId: "", agenda: "" };

  const committeePortfolios = portfolios.filter((p) => p.committeeId === activeCommittee.id);

  // Helper: check if a portfolio matches delegate's preferences
  const getPreferenceMatchRank = (reg: Registration, committeeId?: string, portfolioId?: string) => {
    if (!committeeId || !portfolioId) return null;
    for (let cIdx = 0; cIdx < (reg.preferences || []).length; cIdx++) {
      const pref = reg.preferences[cIdx];
      if (pref.committeeId === committeeId) {
        const pIdx = (pref.portfolioIds || []).indexOf(portfolioId);
        if (pIdx !== -1) {
          return { choiceNum: cIdx + 1, portRank: pIdx + 1, label: `Choice #${cIdx + 1} (${pIdx + 1})` };
        }
        return { choiceNum: cIdx + 1, portRank: null, label: `Choice #${cIdx + 1} Comm` };
      }
    }
    return null;
  };

  // Helper: find best available preferred portfolio for quick 1-click allot
  const getBestAvailablePreference = (reg: Registration) => {
    for (const pref of reg.preferences || []) {
      for (const pId of pref.portfolioIds || []) {
        const port = portfolios.find((p) => p.id === pId);
        if (port && port.status === "open") {
          const comm = committees.find((c) => c.id === pref.committeeId);
          return {
            committeeId: pref.committeeId,
            committeeName: comm?.name || "Committee",
            portfolioId: port.id,
            countryName: port.countryName,
            code: port.code,
          };
        }
      }
    }
    return null;
  };

  // Filter & Sort Delegates for the Excel Spreadsheet view
  const filteredDelegates = useMemo(() => {
    return registrations
      .filter((reg) => {
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
        if (statusFilter === "unallotted" && reg.allotment) return false;
        if (statusFilter === "allotted" && !reg.allotment) return false;
        if (statusFilter === "paid" && reg.paymentStatus !== "verified") return false;
        if (statusFilter === "unpaid" && reg.paymentStatus === "verified") return false;

        // Committee Filter: matches either allotted committee OR preferred committee
        if (committeeFilter !== "all") {
          const inAllotment = reg.allotment?.committeeId === committeeFilter;
          const inPreferences = (reg.preferences || []).some((p) => p.committeeId === committeeFilter);
          if (!inAllotment && !inPreferences) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name") {
          cmp = a.delegateName.localeCompare(b.delegateName);
        } else if (sortBy === "school") {
          cmp = a.school.localeCompare(b.school);
        } else if (sortBy === "reg") {
          cmp = a.registrationNumber.localeCompare(b.registrationNumber);
        } else if (sortBy === "status") {
          const aAllotted = Boolean(a.allotment);
          const bAllotted = Boolean(b.allotment);
          cmp = aAllotted === bAllotted ? 0 : aAllotted ? -1 : 1;
        }
        return sortAsc ? cmp : -cmp;
      });
  }, [registrations, portfolios, committees, searchQuery, statusFilter, committeeFilter, sortBy, sortAsc]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, committeeFilter, sortBy, sortAsc]);

  const totalPages = Math.ceil(filteredDelegates.length / pageSize) || 1;
  const paginatedDelegates = useMemo(() => {
    if (pageSize >= 1000) return filteredDelegates;
    const start = (currentPage - 1) * pageSize;
    return filteredDelegates.slice(start, start + pageSize);
  }, [filteredDelegates, currentPage, pageSize]);

  const handleAllot = async (regId: string, committeeId: string, portfolioId: string) => {
    const targetPort = portfolios.find((p) => p.id === portfolioId);
    const targetComm = committees.find((c) => c.id === committeeId);
    const targetReg = registrations.find((r) => r.id === regId);

    const res = await allotDelegateManual(regId, committeeId, portfolioId);
    if (res.success) {
      if (res.reassignedDelegateName) {
        showToast(
          `✓ Reassigned ${targetPort?.countryName || "seat"} (${targetComm?.name || "Committee"}) to ${targetReg?.delegateName || "delegate"}. Previous holder (${res.reassignedDelegateName}) is now unallotted.`,
          "warning"
        );
      } else {
        showToast(
          `✓ Successfully allotted ${targetPort?.countryName || "seat"} (${targetComm?.name || "Committee"}) to ${targetReg?.delegateName || "delegate"}!`,
          "success"
        );
      }
      setEditingDelegateId(null);
    }
  };

  const handleUnallot = async (regId: string) => {
    const targetReg = registrations.find((r) => r.id === regId);
    await unallotDelegate(regId);
    showToast(`Seat unallotted for ${targetReg?.delegateName || "delegate"}. Portfolio is now free.`, "info");
  };

  // Matrix View Portfolios with Allotted Delegate info
  const matrixPortfolios = useMemo(() => {
    const list = committeePortfolios.map((port) => {
      const reg = registrations.find(
        (r) => r.id === port.allottedRegistrationId || r.allotment?.portfolioId === port.id
      );
      const isTaken = port.status === "taken" || Boolean(reg);
      return {
        ...port,
        isTaken,
        delegate: reg,
        statusType: isTaken
          ? reg?.paymentStatus === "verified"
            ? "allotted_paid"
            : "allotted_unpaid"
          : "free",
      };
    });

    return list.sort((a, b) => {
      if (matrixSortMode === "free") {
        if (!a.isTaken && b.isTaken) return -1;
        if (a.isTaken && !b.isTaken) return 1;
      } else if (matrixSortMode === "paid") {
        if (a.statusType === "allotted_paid" && b.statusType !== "allotted_paid") return -1;
        if (a.statusType !== "allotted_paid" && b.statusType === "allotted_paid") return 1;
      } else if (matrixSortMode === "unpaid") {
        if (a.statusType === "allotted_unpaid" && b.statusType !== "allotted_unpaid") return -1;
        if (a.statusType !== "allotted_unpaid" && b.statusType === "allotted_unpaid") return 1;
      } else if (matrixSortMode === "az") {
        return a.countryName.localeCompare(b.countryName);
      }
      return 0;
    });
  }, [committeePortfolios, registrations, matrixSortMode]);

  // CSV Export Handler (organizers love exporting allotment lists to Excel)
  const handleExportCSV = () => {
    const headers = [
      "Row",
      "Registration Number",
      "Delegate Name",
      "School",
      "Registration Type",
      "Payment Status",
      "Allotted Committee",
      "Allotted Portfolio",
      "Choice Match",
      "Registered At",
    ];

    const rows = registrations.map((r, idx) => {
      const comm = committees.find((c) => c.id === r.allotment?.committeeId);
      const port = portfolios.find((p) => p.id === r.allotment?.portfolioId);
      const match = getPreferenceMatchRank(r, r.allotment?.committeeId, r.allotment?.portfolioId);

      return [
        idx + 1,
        `"${r.registrationNumber || ""}"`,
        `"${(r.delegateName || "").replace(/"/g, '""')}"`,
        `"${(r.school || "").replace(/"/g, '""')}"`,
        r.registrationType === "school_team" ? "School Delegation" : "Individual",
        r.paymentStatus === "verified" ? "Paid" : "Unpaid",
        `"${(comm?.name || "Unallotted").replace(/"/g, '""')}"`,
        `"${(port?.countryName || "Unallotted").replace(/"/g, '""')}"`,
        `"${match?.label || (r.allotment ? "Manual" : "None")}"`,
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
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

  // Matrix selection actions
  const handleToggleSelectPortfolio = (id: string) => {
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

  const handleDeleteSelectedPortfolios = () => {
    if (selectedPortfolioIds.length === 0) return;
    if (confirm(`Delete ${selectedPortfolioIds.length} selected country portfolios?`)) {
      deleteMultiplePortfolios(selectedPortfolioIds);
      setSelectedPortfolioIds([]);
    }
  };

  // Auto-allot execution
  const sim = autoAllotSimulation;
  const currentConflict = sim.conflicts[currentConflictIndex] || sim.conflicts[0];

  const handleExecuteAllot = () => {
    executeAutoAllot();
    setShowAutoAllotModal(false);
  };

  const handleResolveSingleConflict = (chosenRegId: string) => {
    if (!currentConflict) return;
    resolveConflict(currentConflict.portfolioId, chosenRegId);
    if (currentConflictIndex < sim.conflicts.length - 1) {
      setCurrentConflictIndex(currentConflictIndex + 1);
    } else {
      setShowConflictsModal(false);
      alert("All conflicts reviewed and resolved!");
    }
  };

  if (!event.name || event.id === "new-conference" || event.status !== "published") {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Actions Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
              Allotment Matrix
            </h1>
            <button
              type="button"
              onClick={publishAllotmentsToggle}
              className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-colors cursor-pointer border ${
                event.rules.allotmentsPublished
                  ? "bg-emerald-500 border-emerald-400 text-white"
                  : "bg-white/20 border-white/30 text-white hover:bg-white/30"
              }`}
              title="Toggle whether delegates can see their allotted portfolios via Check Status"
            >
              {event.rules.allotmentsPublished ? "✓ Published to delegates" : "Publish allotments"}
            </button>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm font-medium mt-0.5">
            Interactive roster for allotting committee seats and country portfolios
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV / Excel Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs sm:text-sm font-heading font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download full allotment spreadsheet in CSV format"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {/* Auto Allot Button */}
          <button
            type="button"
            onClick={() => setShowAutoAllotModal(true)}
            className="px-4 py-2 rounded-xl bg-[#FFD23F] hover:bg-yellow-400 text-[#0B1B33] text-xs sm:text-sm font-heading font-extrabold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto Allot ({unallottedCount})</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Metrics Ribbon (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-white">
        <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-2.5 sm:p-3">
          <div className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Total Delegates</div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold mt-0.5">{totalDelegates}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-2.5 sm:p-3">
          <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">Allotted</div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold text-emerald-300 mt-0.5">
            {allottedCount}{" "}
            <span className="text-xs font-normal text-white/70">
              ({totalDelegates > 0 ? Math.round((allottedCount / totalDelegates) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-2.5 sm:p-3">
          <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Unallotted</div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold text-amber-300 mt-0.5">{unallottedCount}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-2.5 sm:p-3">
          <div className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Verified Paid</div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold mt-0.5">{paidCount}</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-2.5 sm:p-3">
          <div className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">Seats Filled</div>
          <div className="text-xl sm:text-2xl font-heading font-extrabold mt-0.5">
            {filledSeats} / {totalPortfolios}
          </div>
        </div>
      </div>

      {/* Main Tab Switcher: Delegates Sheet vs Committee Seats Matrix */}
      <div className="flex items-center gap-2 border-b border-white/15 pb-2">
        <button
          type="button"
          onClick={() => setViewMode("delegates")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            viewMode === "delegates"
              ? "bg-white text-[#0B1B33] shadow-md"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Delegates Allotment Sheet ({totalDelegates})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("matrix")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            viewMode === "matrix"
              ? "bg-white text-[#0B1B33] shadow-md"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Committee Seats Matrix ({committees.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: DELEGATES ALLOTMENT GUI (Spacious & Scalable)     */}
      {/* ======================================================== */}
      {viewMode === "delegates" && (
        <div className="space-y-4">
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              className={`p-3.5 rounded-xl font-heading font-extrabold text-sm flex items-center justify-between shadow-md animate-fadeIn ${
                toastMessage.type === "warning"
                  ? "bg-amber-400 text-[#0B1B33] border border-amber-500"
                  : toastMessage.type === "info"
                  ? "bg-blue-600 text-white border border-blue-500"
                  : "bg-emerald-600 text-white border border-emerald-500"
              }`}
            >
              <span>{toastMessage.text}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-xs uppercase tracking-wider font-bold underline opacity-80 hover:opacity-100 cursor-pointer ml-3"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Controls Bar: Search, Filters, Committee Dropdown & Pagination Size */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 text-[#0B1B33] shadow-sm space-y-3.5 border border-neutral-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search delegate name, school, reg ID, or allotted country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#1560BD]"
                />
              </div>

              {/* Committee Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">Filter Committee:</span>
                <select
                  value={committeeFilter}
                  onChange={(e) => setCommitteeFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-heading font-bold text-[#0B1B33] bg-neutral-50 focus:outline-none focus:border-[#1560BD]"
                >
                  <option value="all">All Committees ({committees.length})</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="py-2 px-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-heading font-bold text-[#0B1B33] bg-neutral-50 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={99999}>All ({filteredDelegates.length})</option>
                </select>
              </div>
            </div>

            {/* Quick Status Filter Chips & Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-heading font-extrabold">
                <span className="text-neutral-400 text-[11px] uppercase mr-1">Status:</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-[#0B1B33] text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  All ({registrations.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("unallotted")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "unallotted"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  Unallotted ({unallottedCount})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("allotted")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "allotted"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  Allotted ({allottedCount})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("paid")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "paid"
                      ? "bg-[#1560BD] text-white shadow-xs"
                      : "bg-blue-50 text-[#0F4C96] hover:bg-blue-100"
                  }`}
                >
                  Paid ({paidCount})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("unpaid")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === "unpaid"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-red-50 text-red-800 hover:bg-red-100"
                  }`}
                >
                  Unpaid ({unpaidCount})
                </button>
              </div>

              {/* Pagination Page Jump */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-xs font-heading font-extrabold text-neutral-600 ml-auto">
                  <span>Page {currentPage} of {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-lg border border-neutral-300 disabled:opacity-40 hover:bg-neutral-100 cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1 rounded-lg border border-neutral-300 disabled:opacity-40 hover:bg-neutral-100 cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User-Friendly GUI Cards List for Delegates */}
          {paginatedDelegates.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-neutral-500 font-medium border border-neutral-200">
              <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-base font-heading font-extrabold text-[#0B1B33]">No delegates match your filters</p>
              <p className="text-xs text-neutral-400 mt-1">Try clearing your search query or status filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedDelegates.map((reg, rowIdx) => {
                const globalIdx = (currentPage - 1) * pageSize + rowIdx + 1;
                const isAllotted = Boolean(reg.allotment);
                const isPaid = reg.paymentStatus === "verified";
                const isEditing = editingDelegateId === reg.id || !isAllotted;
                const allottedComm = committees.find((c) => c.id === reg.allotment?.committeeId);
                const allottedPort = portfolios.find((p) => p.id === reg.allotment?.portfolioId);
                const matchInfo = getPreferenceMatchRank(
                  reg,
                  reg.allotment?.committeeId,
                  reg.allotment?.portfolioId
                );

                // Best available pref for 1-click
                const bestAvailablePref = !isAllotted ? getBestAvailablePreference(reg) : null;

                // Current draft committee for this delegate row
                const draftCommId =
                  rowDrafts[reg.id]?.committeeId ||
                  reg.allotment?.committeeId ||
                  reg.preferences[0]?.committeeId ||
                  committees[0]?.id ||
                  "";

                // All portfolios in draft committee, sorted alphabetically!
                const portsInDraftComm = portfolios
                  .filter((p) => p.committeeId === draftCommId)
                  .sort((a, b) => a.countryName.localeCompare(b.countryName, undefined, { sensitivity: "base" }));

                const draftPortId =
                  rowDrafts[reg.id]?.portfolioId ||
                  reg.allotment?.portfolioId ||
                  (portsInDraftComm.find((p) => p.status === "open")?.id || portsInDraftComm[0]?.id || "");

                const selectedPortObj = portfolios.find((p) => p.id === draftPortId);
                const isSelectedPortTakenByOther =
                  selectedPortObj?.status === "taken" && selectedPortObj.allottedRegistrationId !== reg.id;
                const otherHolder = isSelectedPortTakenByOther
                  ? registrations.find((r) => r.id === selectedPortObj?.allottedRegistrationId)
                  : null;

                return (
                  <div
                    key={reg.id}
                    className={`rounded-2xl transition-all p-5 sm:p-6 shadow-md bg-white text-[#0B1B33] border-2 ${
                      isAllotted
                        ? "border-neutral-200"
                        : "border-amber-400 ring-2 ring-amber-400/20"
                    }`}
                  >
                    {/* Card Top: Delegate Identity, Reg ID, Payment & Allotment Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-neutral-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-neutral-100 font-mono text-xs font-extrabold text-[#0B1B33] flex items-center justify-center shrink-0 border border-neutral-200">
                          #{globalIdx}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#0B1B33]">
                              {reg.delegateName}
                            </h3>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-bold border border-neutral-200">
                              {reg.registrationType === "school_team" ? "School Delegation" : "Individual"}
                            </span>
                            {isAllotted ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-heading font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Allotted
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-heading font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                Unallotted
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-600 mt-1">
                            <span className="font-bold text-neutral-800">{reg.school}</span>
                            {reg.classYear && (
                              <>
                                <span className="text-neutral-300">|</span>
                                <span>Class {reg.classYear}</span>
                              </>
                            )}
                            <span className="text-neutral-300">|</span>
                            <span>{reg.experienceMuns} prior MUNs</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 font-bold border border-neutral-200">
                          {reg.registrationNumber}
                        </span>
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            Unpaid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body: Preferences on Left, Allotment Controls on Right */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3.5">
                      {/* Left Column: Preferences */}
                      <div className="lg:col-span-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-heading font-extrabold text-[#0B1B33] uppercase tracking-wider">
                            Submitted Preferences
                          </span>
                          {bestAvailablePref && (
                            <button
                              type="button"
                              onClick={() => handleAllot(reg.id, bestAvailablePref.committeeId, bestAvailablePref.portfolioId)}
                              className="inline-flex items-center gap-1 text-xs font-heading font-extrabold text-emerald-800 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1 rounded-xl cursor-pointer transition-colors shadow-xs"
                            >
                              <span>Quick Allot {bestAvailablePref.countryName}</span>
                            </button>
                          )}
                        </div>

                        {(reg.preferences || []).length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No preferences recorded.</p>
                        ) : (
                          <div className="space-y-2">
                            {(reg.preferences || []).map((pref, pIdx) => {
                              const cObj = committees.find((c) => c.id === pref.committeeId);
                              return (
                                <div key={pIdx} className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs shadow-2xs">
                                  <div className="font-heading font-extrabold text-[#0B1B33] mb-1.5 flex items-center justify-between">
                                    <span>Pref #{pIdx + 1}: {cObj?.name || "Committee"}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(pref.portfolioIds || []).map((pId) => {
                                      const pObj = portfolios.find((p) => p.id === pId);
                                      if (!pObj) return null;
                                      const isFree = pObj.status === "open" || pObj.allottedRegistrationId === reg.id;
                                      const holder = !isFree
                                        ? registrations.find((r) => r.id === pObj.allottedRegistrationId)
                                        : null;

                                      return (
                                        <button
                                          key={pId}
                                          type="button"
                                          onClick={() => {
                                            setRowDrafts((prev) => ({
                                              ...prev,
                                              [reg.id]: { committeeId: pref.committeeId, portfolioId: pId },
                                            }));
                                            setEditingDelegateId(reg.id);
                                          }}
                                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer shadow-xs ${
                                            isFree
                                              ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300"
                                              : "bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300"
                                          }`}
                                          title={isFree ? "Click to select this free seat" : `Taken by ${holder?.delegateName || "another delegate"} - click to reassign`}
                                        >
                                          <span>{pObj.countryName}</span>
                                          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                                            isFree ? "bg-emerald-200/90 text-emerald-950" : "bg-rose-200/90 text-rose-950"
                                          }`}>
                                            {isFree ? "Free" : holder?.delegateName ? `Taken: ${holder.delegateName.split(" ")[0]}` : "Taken"}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right Column: Allotment Status & Controls */}
                      <div className="lg:col-span-7 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-heading font-extrabold text-[#0B1B33] uppercase tracking-wider block mb-1.5">
                            Portfolio Allotment
                          </span>

                          {isAllotted && !isEditing ? (
                            /* Current Allotted Summary Card */
                            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                              <div className="flex items-center gap-3">
                                <CountryMonogram code={allottedPort?.code || "UN"} size="md" />
                                <div>
                                  <div className="text-base font-heading font-extrabold text-[#0B1B33]">
                                    {allottedPort?.countryName || "Allotted Country"}
                                  </div>
                                  <div className="text-xs font-bold text-[#1560BD]">
                                    {allottedComm?.name || "Committee"}
                                  </div>
                                  {matchInfo && (
                                    <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                                      ✓ Matched {matchInfo.label}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingDelegateId(reg.id)}
                                  className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-white text-xs font-heading font-bold text-neutral-700 transition-colors cursor-pointer"
                                >
                                  Change Seat
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUnallot(reg.id)}
                                  className="px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-heading font-bold text-red-700 transition-colors cursor-pointer flex items-center gap-1.5"
                                  title="Unallot seat and make it free"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Unallot</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Allotment Control Interface (Spacious & Clean) */
                            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3.5 shadow-2xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Committee Selector - Shows ALL committees with open count */}
                                <div>
                                  <label className="block text-xs font-heading font-extrabold text-[#0B1B33] uppercase mb-1">
                                    1. Choose Committee:
                                  </label>
                                  <select
                                    value={draftCommId}
                                    onChange={(e) => {
                                      const nextComm = e.target.value;
                                      const nextPorts = portfolios.filter((p) => p.committeeId === nextComm);
                                      const firstOpen = nextPorts.find((p) => p.status === "open");
                                      setRowDrafts((prev) => ({
                                        ...prev,
                                        [reg.id]: {
                                          committeeId: nextComm,
                                          portfolioId: firstOpen?.id || nextPorts[0]?.id || "",
                                        },
                                      }));
                                    }}
                                    className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-heading font-bold text-[#0B1B33] bg-white focus:outline-none focus:border-[#1560BD]"
                                  >
                                    {committees.map((c) => {
                                      const cPorts = portfolios.filter((p) => p.committeeId === c.id);
                                      const openCount = cPorts.filter((p) => p.status === "open").length;
                                      return (
                                        <option key={c.id} value={c.id}>
                                          {c.name} ({openCount} free / {cPorts.length} total)
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>

                                {/* Portfolio Selector - Lists Free vs Taken with holder names */}
                                <div>
                                  <label className="block text-xs font-heading font-extrabold text-[#0B1B33] uppercase mb-1">
                                    2. Choose Portfolio:
                                  </label>
                                  <select
                                    value={draftPortId}
                                    onChange={(e) => {
                                      setRowDrafts((prev) => ({
                                        ...prev,
                                        [reg.id]: {
                                          committeeId: draftCommId,
                                          portfolioId: e.target.value,
                                        },
                                      }));
                                    }}
                                    className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 text-xs sm:text-sm font-heading font-bold text-[#0B1B33] bg-white focus:outline-none focus:border-[#1560BD]"
                                  >
                                    {portsInDraftComm.length === 0 ? (
                                      <option value="">No portfolios in this committee</option>
                                    ) : (
                                      portsInDraftComm.map((p) => {
                                        const isTaken = p.status === "taken" && p.allottedRegistrationId !== reg.id;
                                        const holder = isTaken
                                          ? registrations.find((r) => r.id === p.allottedRegistrationId)
                                          : null;
                                        const isPreferred = (reg.preferences || []).some(
                                          (pref) =>
                                            pref.committeeId === draftCommId &&
                                            (pref.portfolioIds || []).includes(p.id)
                                        );

                                        let label = p.countryName;
                                        if (isPreferred) label = `[⭐ Preferred] ${label}`;

                                        if (isTaken) {
                                          label = `${label} — [Taken: ${holder?.delegateName || "Another delegate"}]`;
                                        } else {
                                          label = `${label} [Free]`;
                                        }

                                        return (
                                          <option key={p.id} value={p.id}>
                                            {label}
                                          </option>
                                        );
                                      })
                                    )}
                                  </select>
                                </div>
                              </div>

                              {/* Action & Reassign Warning */}
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2.5 border-t border-neutral-200">
                                {isSelectedPortTakenByOther ? (
                                  <div className="text-xs text-amber-950 font-bold bg-amber-100 px-3.5 py-2 rounded-xl border border-amber-300 w-full sm:w-auto">
                                    <strong>{selectedPortObj?.countryName}</strong> is taken by <strong>{otherHolder?.delegateName || "another delegate"}</strong>. Selecting will reassign and unallot them.
                                  </div>
                                ) : (
                                  <div className="text-xs text-emerald-950 font-bold bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 w-full sm:w-auto">
                                    <strong>{selectedPortObj?.countryName || "Portfolio"}</strong> is free to allot.
                                  </div>
                                )}

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                  {isAllotted && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingDelegateId(null)}
                                      className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    disabled={!draftPortId}
                                    onClick={() => handleAllot(reg.id, draftCommId, draftPortId)}
                                    className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-transform active:scale-95 cursor-pointer shadow-sm ${
                                      isSelectedPortTakenByOther
                                        ? "bg-amber-500 hover:bg-amber-600 text-[#0B1B33]"
                                        : "bg-[#1560BD] hover:bg-[#0F4C96] text-white"
                                    }`}
                                  >
                                    {isSelectedPortTakenByOther ? "Reassign & Allot" : "Allot Seat"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination & Counts Bar */}
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 text-xs font-bold text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div>
              Showing <strong>{paginatedDelegates.length}</strong> of <strong>{filteredDelegates.length}</strong> filtered delegates ({totalDelegates} total in conference)
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold">
                  {allottedCount} allotted
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-extrabold">
                  {unallottedCount} unallotted
                </span>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 ml-2 border-l border-neutral-200 pl-3">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg border border-neutral-300 disabled:opacity-40 hover:bg-neutral-100 cursor-pointer text-xs font-extrabold"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs font-extrabold text-[#0B1B33]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded-lg border border-neutral-300 disabled:opacity-40 hover:bg-neutral-100 cursor-pointer text-xs font-extrabold"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: COMMITTEE SEATS MATRIX (Seats Grid View)          */}
      {/* ======================================================== */}
      {viewMode === "matrix" && (
        <div className="space-y-4">
          {/* Committee Switcher Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {committees.map((c) => {
              const commPorts = portfolios.filter((p) => p.committeeId === c.id);
              const filledInComm = commPorts.filter((p) => p.status === "taken").length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCommitteeId(c.id);
                    setSelectedPortfolioIds([]);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeCommittee.id === c.id
                      ? "bg-white text-[#0B1B33] shadow-md"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      activeCommittee.id === c.id
                        ? "bg-[#1560BD] text-white"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {filledInComm} / {commPorts.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 text-[#0B1B33] shadow-sm space-y-4">
            {/* Active Committee Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0B1B33]">
                  {activeCommittee.name} — Seats Roster
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
                  {matrixPortfolios.filter((p) => p.isTaken).length} of {matrixPortfolios.length} seats allotted
                </p>
              </div>

              {/* Add Country / Leader Combobox */}
              <div className="sm:max-w-xs w-full">
                <PortfolioCombobox
                  placeholder={`+ Add country to ${activeCommittee.name}...`}
                  existingNames={committeePortfolios.map((p) => p.countryName)}
                  onAdd={(item) => addPortfolioToCommittee(activeCommittee.id, item)}
                />
              </div>
            </div>

            {/* Matrix Filters & Bulk Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-heading font-extrabold">
                <button
                  type="button"
                  onClick={() => setMatrixSortMode("all")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    matrixSortMode === "all"
                      ? "bg-[#0B1B33] text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  All ({matrixPortfolios.length})
                </button>

                <button
                  type="button"
                  onClick={() => setMatrixSortMode("free")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    matrixSortMode === "free"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  Free Seats ({matrixPortfolios.filter((p) => !p.isTaken).length})
                </button>

                <button
                  type="button"
                  onClick={() => setMatrixSortMode("paid")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    matrixSortMode === "paid"
                      ? "bg-[#1560BD] text-white"
                      : "bg-blue-50 text-[#0F4C96] hover:bg-blue-100"
                  }`}
                >
                  Paid ({matrixPortfolios.filter((p) => p.statusType === "allotted_paid").length})
                </button>

                <button
                  type="button"
                  onClick={() => setMatrixSortMode("unpaid")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    matrixSortMode === "unpaid"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  Unpaid ({matrixPortfolios.filter((p) => p.statusType === "allotted_unpaid").length})
                </button>

                <button
                  type="button"
                  onClick={() => setMatrixSortMode("az")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    matrixSortMode === "az"
                      ? "bg-[#0B1B33] text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  A - Z
                </button>
              </div>

              {/* Bulk Actions */}
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
                    onClick={handleDeleteSelectedPortfolios}
                    className="px-3 py-1 rounded-lg text-xs font-heading font-extrabold bg-red-600 hover:bg-red-700 text-white cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedPortfolioIds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="sticky top-0 bg-neutral-100 text-[#0B1B33] font-heading font-extrabold uppercase tracking-wider text-[11px] border-b border-neutral-200 z-10 select-none shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center border-r border-neutral-200">
                        <input
                          type="checkbox"
                          checked={
                            selectedPortfolioIds.length === committeePortfolios.length &&
                            committeePortfolios.length > 0
                          }
                          onChange={handleSelectAllInCommittee}
                          className="w-4 h-4 text-[#1560BD] rounded"
                        />
                      </th>
                      <th className="py-2.5 px-3 border-r border-neutral-200 min-w-[200px]">
                        Country / Portfolio
                      </th>
                      <th className="py-2.5 px-3 border-r border-neutral-200 w-28 text-center">Seat Status</th>
                      <th className="py-2.5 px-3 border-r border-neutral-200 min-w-[240px]">
                        Assigned Delegate
                      </th>
                      <th className="py-2.5 px-3 w-40 text-center">Allotment Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-200 text-[#0B1B33]">
                    {matrixPortfolios.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-500 font-medium">
                          No country portfolios in this committee yet. Add countries using the search bar above.
                        </td>
                      </tr>
                    ) : (
                      matrixPortfolios.map((port, idx) => {
                        const isSelected = selectedPortfolioIds.includes(port.id);
                        const isFree = !port.isTaken;
                        const isPaid = port.statusType === "allotted_paid";
                        const isUnpaid = port.statusType === "allotted_unpaid";

                        return (
                          <tr
                            key={port.id}
                            className={`hover:bg-blue-50/40 transition-colors ${
                              isFree ? "bg-emerald-50/20" : isPaid ? "bg-blue-50/20" : "bg-amber-50/20"
                            } ${isSelected ? "bg-yellow-50" : ""}`}
                          >
                            {/* Checkbox */}
                            <td className="py-2.5 px-3 text-center border-r border-neutral-200">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectPortfolio(port.id)}
                                className="w-4 h-4 text-[#1560BD] rounded cursor-pointer"
                              />
                            </td>

                            {/* Portfolio / Country */}
                            <td className="py-2.5 px-3 border-r border-neutral-200">
                              <div className="flex items-center gap-2.5">
                                <CountryMonogram code={port.code} size="sm" />
                                <div>
                                  <div className="font-heading font-extrabold text-[#0B1B33] text-sm">
                                    {port.countryName}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 font-mono">
                                    Code: {port.code}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3 border-r border-neutral-200 text-center">
                              {isFree ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Free
                                </span>
                              ) : isPaid ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-[#0F4C96] border border-blue-300">
                                  Allotted (Paid)
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                  Allotted (Unpaid)
                                </span>
                              )}
                            </td>

                            {/* Assigned Delegate */}
                            <td className="py-2.5 px-3 border-r border-neutral-200">
                              {port.delegate ? (
                                <div>
                                  <div className="font-heading font-extrabold text-[#0B1B33] text-sm">
                                    {port.delegate.delegateName}
                                  </div>
                                  <div className="text-xs text-neutral-500 font-medium">
                                    {port.delegate.school} |{" "}
                                    <span className="font-mono">{port.delegate.registrationNumber}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-neutral-400 italic font-medium">
                                  — Open Seat (Not Assigned) —
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {isFree ? (
                                  /* Assign Dropdown */
                                  unallottedCount > 0 ? (
                                    <select
                                      defaultValue=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          handleAllot(e.target.value, activeCommittee.id, port.id);
                                          e.target.value = "";
                                        }
                                      }}
                                      className="py-1 px-2 rounded-lg border border-neutral-300 text-xs font-heading font-bold text-[#0B1B33] bg-white cursor-pointer hover:border-[#1560BD]"
                                    >
                                      <option value="">+ Assign Delegate</option>
                                      {registrations
                                        .filter((r) => !r.allotment)
                                        .map((r) => {
                                          const preferredThisPort = (r.preferences || []).some(
                                            (pref) =>
                                              pref.committeeId === activeCommittee.id &&
                                              (pref.portfolioIds || []).includes(port.id)
                                          );
                                          return (
                                            <option key={r.id} value={r.id}>
                                              {preferredThisPort ? `⭐ ${r.delegateName}` : r.delegateName} (
                                              {r.school})
                                            </option>
                                          );
                                        })}
                                    </select>
                                  ) : (
                                    <span className="text-xs text-neutral-400">All delegates allotted</span>
                                  )
                                ) : (
                                  /* Unallot Button */
                                  <button
                                    type="button"
                                    onClick={() => handleUnallot(port.delegate!.id)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-heading font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
                                    title="Unallot delegate from this seat"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Unallot</span>
                                  </button>
                                )}

                                {/* Delete Single Country */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Delete ${port.countryName} from ${activeCommittee.name}?`)) {
                                      deletePortfolio(port.id);
                                    }
                                  }}
                                  className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                  title="Delete portfolio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AUTO ALLOT PREVIEW MODAL                                 */}
      {/* ======================================================== */}
      {showAutoAllotModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1B33]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
                Auto-Allotment Simulation
              </h2>
              <button
                type="button"
                onClick={() => setShowAutoAllotModal(false)}
                className="text-neutral-400 hover:text-neutral-900 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-800">
                  {sim.firstChoiceCount}
                </div>
                <div className="text-xs font-heading font-bold text-emerald-700 mt-0.5">
                  1st Choice
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0F4C96]">
                  {sim.secondChoiceCount}
                </div>
                <div className="text-xs font-heading font-bold text-[#0F4C96] mt-0.5">
                  2nd Choice
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-800">
                  {sim.conflictsCount}
                </div>
                <div className="text-xs font-heading font-bold text-amber-700 mt-0.5">
                  Conflicts
                </div>
              </div>
            </div>

            {/* Include Unpaid Toggle */}
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-heading font-extrabold text-[#0B1B33]">
                  Include unpaid delegates
                </div>
                <div className="text-xs text-neutral-500 font-medium mt-0.5">
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

            <p className="text-xs text-neutral-500 font-medium">
              Simulation results are deterministic and based on registration timestamp order. No changes are applied until you confirm.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                variant="primary"
                onClick={handleExecuteAllot}
                className="flex-1 py-3"
              >
                Execute Allotment ({sim.totalEligible})
              </Button>

              {sim.conflictsCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAutoAllotModal(false);
                    setShowConflictsModal(true);
                    setCurrentConflictIndex(0);
                  }}
                  className="flex-1 border-2 border-neutral-300 hover:border-[#0B1B33] text-[#0B1B33] rounded-2xl p-3 text-xs sm:text-sm font-heading font-extrabold text-center transition-colors cursor-pointer"
                >
                  Review Conflicts ({sim.conflictsCount})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFLICT RESOLUTION MODAL                                */}
      {/* ======================================================== */}
      {showConflictsModal && currentConflict && (
        <div className="fixed inset-0 z-50 bg-[#0B1B33]/90 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-md w-full mx-auto my-auto space-y-5 bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Conflict {currentConflictIndex + 1} of {sim.conflicts.length}
              </span>
              <button
                type="button"
                onClick={() => setShowConflictsModal(false)}
                className="text-neutral-400 hover:text-black font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-extrabold text-[#0B1B33] leading-tight">
                {currentConflict.portfolioName} in {currentConflict.committeeName}
              </h2>
              <p className="text-sm text-neutral-600 font-medium mt-1">
                Multiple delegates ranked this exact seat. Choose who receives it:
              </p>
            </div>

            <div className="space-y-3">
              {currentConflict.competingDelegates.map((comp, cIdx) => (
                <div
                  key={cIdx}
                  className="p-4 rounded-2xl border-2 border-neutral-200 hover:border-[#1560BD] transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-heading font-extrabold text-[#0B1B33] text-base">
                      {comp.registration.delegateName}
                    </div>
                    <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-bold">
                      {comp.registration.school}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">{comp.reason}</div>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => handleResolveSingleConflict(comp.registration.id)}
                    className="w-full mt-1"
                  >
                    Assign {currentConflict.portfolioName} to {comp.registration.delegateName.split(" ")[0]}
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowConflictsModal(false)}
                className="text-xs font-bold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
              >
                Skip / Return to Allotment Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
