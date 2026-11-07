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

        // Committee Filter
        if (committeeFilter !== "all") {
          if (reg.allotment?.committeeId !== committeeFilter) return false;
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
            Excel-style interactive roster for allotting committee seats and country portfolios
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV / Excel Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs sm:text-sm font-heading font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download full allotment spreadsheet in CSV format compatible with Microsoft Excel & Google Sheets"
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
      {/* VIEW 1: DELEGATES ALLOTMENT SHEET (Excel-style Table)     */}
      {/* ======================================================== */}
      {viewMode === "delegates" && (
        <div className="space-y-3">
          {/* Controls Bar: Search, Filters, Committee Dropdown */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 text-[#0B1B33] shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by delegate name, school, reg #, or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:outline-none focus:border-[#1560BD]"
                />
              </div>

              {/* Committee Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">Committee:</span>
                <select
                  value={committeeFilter}
                  onChange={(e) => setCommitteeFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-xl border border-neutral-200 text-xs sm:text-sm font-heading font-bold text-[#0B1B33] bg-neutral-50 focus:outline-none"
                >
                  <option value="all">All Committees ({committees.length})</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100 text-xs font-heading font-extrabold">
              <span className="text-neutral-400 text-[11px] uppercase mr-1">Status:</span>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#0B1B33] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                All ({registrations.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("unallotted")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "unallotted"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`}
              >
                Unallotted ({unallottedCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("allotted")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "allotted"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Allotted ({allottedCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("paid")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "paid"
                    ? "bg-[#1560BD] text-white"
                    : "bg-blue-50 text-[#0F4C96] hover:bg-blue-100"
                }`}
              >
                Paid ({paidCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("unpaid")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === "unpaid"
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-800 hover:bg-red-100"
                }`}
              >
                Unpaid ({unpaidCount})
              </button>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-auto text-neutral-500 hover:text-neutral-800 text-xs font-bold underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Excel-like Tabular Spreadsheet */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[700px]">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                {/* Excel Column Headers */}
                <thead className="sticky top-0 bg-neutral-100 text-[#0B1B33] font-heading font-extrabold uppercase tracking-wider text-[11px] border-b border-neutral-200 z-10 select-none shadow-xs">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center border-r border-neutral-200 bg-neutral-100">#</th>
                    <th
                      className="py-2.5 px-3 border-r border-neutral-200 cursor-pointer hover:bg-neutral-200"
                      onClick={() => {
                        if (sortBy === "name") setSortAsc(!sortAsc);
                        else {
                          setSortBy("name");
                          setSortAsc(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Delegate</span>
                        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-3 border-r border-neutral-200 w-32 cursor-pointer hover:bg-neutral-200"
                      onClick={() => {
                        if (sortBy === "reg") setSortAsc(!sortAsc);
                        else {
                          setSortBy("reg");
                          setSortAsc(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Reg ID</span>
                        <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 border-r border-neutral-200 w-24 text-center">Payment</th>
                    <th className="py-2.5 px-3 border-r border-neutral-200 min-w-[280px]">
                      Preferences (Ranked 1 → 3)
                    </th>
                    <th className="py-2.5 px-3 min-w-[340px]">
                      Allotted Committee &amp; Portfolio (Interactive Excel Cell)
                    </th>
                  </tr>
                </thead>

                {/* Spreadsheet Rows */}
                <tbody className="divide-y divide-neutral-200 text-[#0B1B33]">
                  {filteredDelegates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500 font-medium">
                        No delegates match your filters. Try clearing the search or status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDelegates.map((reg, rowIdx) => {
                      const isAllotted = Boolean(reg.allotment);
                      const isPaid = reg.paymentStatus === "verified";
                      const allottedComm = committees.find((c) => c.id === reg.allotment?.committeeId);
                      const allottedPort = portfolios.find((p) => p.id === reg.allotment?.portfolioId);
                      const matchInfo = getPreferenceMatchRank(
                        reg,
                        reg.allotment?.committeeId,
                        reg.allotment?.portfolioId
                      );

                      // Check if best preferred choice is available for quick 1-click allot
                      const bestAvailablePref = !isAllotted ? getBestAvailablePreference(reg) : null;

                      // Row draft state for custom manual assignment dropdowns
                      const draftCommId =
                        rowDrafts[reg.id]?.committeeId ||
                        reg.allotment?.committeeId ||
                        reg.preferences[0]?.committeeId ||
                        committees[0]?.id ||
                        "";

                      const availablePortsInDraftComm = portfolios.filter(
                        (p) =>
                          p.committeeId === draftCommId &&
                          (p.status === "open" || p.id === reg.allotment?.portfolioId)
                      );

                      const draftPortId =
                        rowDrafts[reg.id]?.portfolioId ||
                        reg.allotment?.portfolioId ||
                        (availablePortsInDraftComm[0]?.id || "");

                      return (
                        <tr
                          key={reg.id}
                          className={`hover:bg-blue-50/50 transition-colors ${
                            isAllotted ? "bg-white" : "bg-amber-50/20"
                          }`}
                        >
                          {/* Row Index # */}
                          <td className="py-2.5 px-3 text-center border-r border-neutral-200 font-mono text-neutral-400 select-none bg-neutral-50/60">
                            {rowIdx + 1}
                          </td>

                          {/* Delegate & School */}
                          <td className="py-2.5 px-3 border-r border-neutral-200">
                            <div className="font-heading font-extrabold text-[#0B1B33] text-sm">
                              {reg.delegateName}
                            </div>
                            <div className="text-xs text-neutral-500 font-medium truncate max-w-[200px]">
                              {reg.school}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              {reg.registrationType === "school_team" ? "School Delegation" : "Individual"}
                            </div>
                          </td>

                          {/* Reg Number */}
                          <td className="py-2.5 px-3 border-r border-neutral-200 font-mono text-xs">
                            <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-bold">
                              {reg.registrationNumber}
                            </span>
                          </td>

                          {/* Payment */}
                          <td className="py-2.5 px-3 border-r border-neutral-200 text-center">
                            {isPaid ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Paid
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                Unpaid
                              </span>
                            )}
                          </td>

                          {/* Top Preferences */}
                          <td className="py-2.5 px-3 border-r border-neutral-200">
                            <div className="space-y-1">
                              {(reg.preferences || []).slice(0, 2).map((pref, pIdx) => {
                                const cName = committees.find((c) => c.id === pref.committeeId)?.name || "Comm";
                                const portNames = (pref.portfolioIds || []).map((pid) => {
                                  const pObj = portfolios.find((p) => p.id === pid);
                                  const isOpen = pObj?.status === "open";
                                  return {
                                    name: pObj?.countryName || pid,
                                    isOpen,
                                  };
                                });

                                return (
                                  <div key={pIdx} className="text-xs">
                                    <span className="font-bold text-neutral-700 mr-1">
                                      Pref #{pIdx + 1} ({cName}):
                                    </span>
                                    <span className="text-neutral-600">
                                      {portNames.map((pItem, i) => (
                                        <span
                                          key={i}
                                          className={`inline-block mr-1.5 ${
                                            pItem.isOpen
                                              ? "text-emerald-700 font-bold hover:underline"
                                              : "text-neutral-500"
                                          }`}
                                          title={pItem.isOpen ? "Portfolio currently OPEN!" : "Portfolio taken"}
                                        >
                                          {pItem.name}
                                          {pItem.isOpen && <span className="text-[10px] text-emerald-600 ml-0.5">●</span>}
                                          {i < portNames.length - 1 ? "," : ""}
                                        </span>
                                      ))}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          {/* Interactive Allotment Cell */}
                          <td className="py-2.5 px-3">
                            {isAllotted ? (
                              /* ALLOTTED STATE */
                              <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <CountryMonogram code={allottedPort?.code || "UN"} size="sm" />
                                  <div>
                                    <div className="font-heading font-extrabold text-[#0B1B33] text-sm">
                                      {allottedPort?.countryName || "Assigned Portfolio"}
                                    </div>
                                    <div className="text-[11px] text-[#1560BD] font-bold">
                                      {allottedComm?.name || "Committee"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {matchInfo ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      ✓ {matchInfo.label}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-700">
                                      Manual
                                    </span>
                                  )}

                                  {/* Unallot Button */}
                                  <button
                                    type="button"
                                    onClick={() => unallotDelegate(reg.id)}
                                    className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Unallot delegate (free up seat)"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* UNALLOTTED STATE: 1-Click Allot or Custom Dropdown */
                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                {/* 1-Click Allot Best Preference if available */}
                                {bestAvailablePref && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      allotDelegateManual(
                                        reg.id,
                                        bestAvailablePref.committeeId,
                                        bestAvailablePref.portfolioId
                                      )
                                    }
                                    className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0 shadow-xs"
                                    title={`Instantly allot 1st available choice: ${bestAvailablePref.countryName} (${bestAvailablePref.committeeName})`}
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    <span>Allot {bestAvailablePref.countryName}</span>
                                  </button>
                                )}

                                {/* Manual Selector (Select Committee + Select Portfolio) */}
                                <div className="flex items-center gap-1.5 w-full sm:w-auto flex-1">
                                  <select
                                    value={draftCommId}
                                    onChange={(e) => {
                                      const nextComm = e.target.value;
                                      const firstOpenInNext = portfolios.find(
                                        (p) => p.committeeId === nextComm && p.status === "open"
                                      );
                                      setRowDrafts((prev) => ({
                                        ...prev,
                                        [reg.id]: {
                                          committeeId: nextComm,
                                          portfolioId: firstOpenInNext?.id || "",
                                        },
                                      }));
                                    }}
                                    className="py-1 px-2 rounded-lg border border-neutral-300 text-xs font-bold bg-white text-[#0B1B33] max-w-[110px] focus:outline-none"
                                  >
                                    {committees.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>

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
                                    className="py-1 px-2 rounded-lg border border-neutral-300 text-xs font-bold bg-white text-[#0B1B33] flex-1 max-w-[160px] focus:outline-none"
                                  >
                                    {availablePortsInDraftComm.length === 0 ? (
                                      <option value="">No seats open</option>
                                    ) : (
                                      availablePortsInDraftComm.map((p) => {
                                        const isPreferred = (reg.preferences || []).some(
                                          (pref) =>
                                            pref.committeeId === draftCommId &&
                                            (pref.portfolioIds || []).includes(p.id)
                                        );
                                        return (
                                          <option key={p.id} value={p.id}>
                                            {isPreferred ? `⭐ ${p.countryName}` : p.countryName}
                                          </option>
                                        );
                                      })
                                    )}
                                  </select>

                                  <button
                                    type="button"
                                    disabled={!draftPortId}
                                    onClick={() => {
                                      if (draftPortId) {
                                        allotDelegateManual(reg.id, draftCommId, draftPortId);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#1560BD] hover:bg-[#0F4C96] disabled:opacity-50 text-white font-heading font-extrabold text-xs transition-colors cursor-pointer shrink-0"
                                  >
                                    Allot
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Excel Table Status Footer */}
            <div className="p-3 bg-neutral-100 border-t border-neutral-200 text-xs font-bold text-neutral-600 flex items-center justify-between">
              <div>
                Showing <strong>{filteredDelegates.length}</strong> of <strong>{totalDelegates}</strong> delegates
              </div>
              <div className="flex items-center gap-3">
                <span>
                  🟢 <strong>{allottedCount}</strong> allotted
                </span>
                <span>
                  🟡 <strong>{unallottedCount}</strong> unallotted
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: COMMITTEE SEATS MATRIX (Excel-style Seats Table)  */}
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
                                    {port.delegate.school} •{" "}
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
                                          allotDelegateManual(e.target.value, activeCommittee.id, port.id);
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
                                    onClick={() => unallotDelegate(port.delegate!.id)}
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
