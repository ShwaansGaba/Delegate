"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/Button";
import { formatDateDDMMYYYY } from "@/lib/dateUtils";
import { getPortfolioDisplayName } from "@/lib/portfolioDatabase";

function sanitizeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
}

export default function RegistrationsPage() {
  const router = useRouter();
  const { user, isAuthLoaded, isLoaded, registrations, committees, portfolios, verifyPayment, event, togglePauseRegistrations } = useApp();

  // Guard against unauthenticated render or pending data load
  if (!isAuthLoaded || !isLoaded || !user) {
    return null;
  }

  // If conference is still in setup/draft, disallow access
  useEffect(() => {
    if (!isLoaded) return;
    if (!event.name || event.id === "new-conference") {
      router.replace("/organizer/conferences");
    } else if (event.status !== "published" && event.status !== "paused") {
      router.replace("/organizer/setup?step=basics");
    }
  }, [isLoaded, event.name, event.id, event.status, router]);

  if (!event.name || event.id === "new-conference" || (event.status !== "published" && event.status !== "paused")) {
    return null;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [reminderToast, setReminderToast] = useState("");
  const [isTogglingPause, setIsTogglingPause] = useState(false);

  const isPaused = event.status === "paused" || !!event.rules?.isRegistrationsPaused;

  const handleTogglePause = async () => {
    setIsTogglingPause(true);
    try {
      await togglePauseRegistrations();
      setReminderToast(isPaused ? "Registrations resumed successfully!" : "Registrations have been paused.");
      setTimeout(() => setReminderToast(""), 4000);
    } finally {
      setIsTogglingPause(false);
    }
  };

  // Sync initial query params client-side without suspending
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlId = sp.get("id");
      const urlFilter = sp.get("filter");
      if (urlId) setSelectedId(urlId);
      if (urlFilter) setFilter(urlFilter);
    }
  }, []);

  const selectedRegistration = useMemo(() => {
    if (selectedId) {
      const found = registrations.find((r) => r.id === selectedId);
      if (found) return found;
    }
    return registrations[0];
  }, [registrations, selectedId]);

  const filteredList = useMemo(() => {
    return registrations.filter((r) => {
      const matchesSearch =
        !searchQuery.trim() ||
        r.delegateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "unpaid") return r.paymentStatus !== "verified";
      if (filter === "paid") return r.paymentStatus === "verified";
      if (filter === "individuals") return r.registrationType === "individual";
      if (filter === "teams") return r.registrationType === "school_team";

      return true;
    });
  }, [registrations, searchQuery, filter]);

  const handleExportCSV = () => {
    const headers = [
      "Registration Number",
      "Name",
      "Email",
      "Phone",
      "School",
      "Class",
      "Type",
      "Payment Status",
      "Fee",
      "Committee 1",
      "Committee 2",
      "Committee 3",
      "Allotted Committee",
      "Allotted Country",
    ];

    const rows = filteredList.map((r) => {
      const c1 = committees.find((c) => c.id === r.preferences[0]?.committeeId)?.name || "";
      const c2 = committees.find((c) => c.id === r.preferences[1]?.committeeId)?.name || "";
      const c3 = committees.find((c) => c.id === r.preferences[2]?.committeeId)?.name || "";
      const allotComm = committees.find((c) => c.id === r.allotment?.committeeId)?.name || "";
      const allotPort = getPortfolioDisplayName(r.allotment?.portfolioId, r.allotment?.committeeId, portfolios);
      const cleanAllotPort = allotPort === "NIL" ? (r.allotment ? "NIL" : "Unallotted") : allotPort;

      return [
        sanitizeCSV(r.registrationNumber || ""),
        sanitizeCSV(r.delegateName || ""),
        sanitizeCSV(r.email || ""),
        sanitizeCSV(r.phone || ""),
        sanitizeCSV(r.school || ""),
        sanitizeCSV(r.classYear || ""),
        sanitizeCSV(r.registrationType || ""),
        sanitizeCSV(r.paymentStatus || ""),
        r.feeAmount ?? 0,
        sanitizeCSV(c1),
        sanitizeCSV(c2),
        sanitizeCSV(c3),
        sanitizeCSV(allotComm || (r.allotment ? "NIL" : "Unallotted")),
        sanitizeCSV(cleanAllotPort),
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safeName = event.name ? event.name.replace(/[^a-zA-Z0-9]/g, "_") : "Delegate_MUN";
    const todayStr = formatDateDDMMYYYY(new Date());
    link.setAttribute("download", `${safeName}_Registrations_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReminder = (reg: typeof selectedRegistration) => {
    if (!reg) return;
    console.log(`[Email Stub] Reminder sent to ${reg.email} (${reg.delegateName}) for registration ${reg.registrationNumber}.`);
    setReminderToast(`Reminder email sent to ${reg.email}`);
    setTimeout(() => setReminderToast(""), 4000);
  };

  const getCommName = (id: string) => {
    return committees.find((c) => c.id === id)?.name || id.toUpperCase();
  };

  const getPortName = (id: string) => {
    return portfolios.find((p) => p.id === id)?.countryName || id;
  };

  if (!event.name || event.id === "new-conference" || (event.status !== "published" && event.status !== "paused")) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="bg-[#FFD23F] text-[#0B1B33] px-5 py-3 rounded-2xl font-heading font-extrabold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{reminderToast}</span>
          <button
            type="button"
            onClick={() => setReminderToast("")}
            className="text-xs uppercase tracking-wider ml-4 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Paused Banner */}
      {isPaused && (
        <div className="bg-amber-500/20 border-2 border-amber-300 text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="text-3xl shrink-0">⏸️</span>
            <div>
              <p className="font-heading font-extrabold text-xl text-amber-300">
                Registrations are Temporarily Paused
              </p>
              <p className="text-sm text-amber-100 font-medium mt-0.5 max-w-xl">
                Delegates attempting to register will see a friendly notice that registrations are paused. You can resume accepting new submissions anytime.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={isTogglingPause}
            className="bg-[#FFD23F] text-[#0B1B33] hover:bg-yellow-400 font-heading font-extrabold px-5 py-3 rounded-2xl text-base transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            {isTogglingPause ? "Resuming..." : "▶ Resume Registrations"}
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white">
              Registrations
            </h1>
            {isPaused ? (
              <span className="bg-amber-400 text-[#0B1B33] text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-sm">
                Paused
              </span>
            ) : (
              <span className="bg-emerald-400 text-[#0B1B33] text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-sm">
                Live
              </span>
            )}
          </div>
          <p className="text-blue-100 text-sm font-medium mt-1">
            {event.name || "Conference Registrations"} • {filteredList.length} total
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Dedicated Pause / Resume Button */}
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={isTogglingPause}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-base font-heading font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95 ${
              isPaused
                ? "bg-emerald-400 hover:bg-emerald-300 text-[#0B1B33]"
                : "bg-amber-400 hover:bg-amber-300 text-[#0B1B33]"
            }`}
            title={isPaused ? "Allow attendees to register" : "Temporarily pause new registrations"}
          >
            <span>{isPaused ? "▶" : "⏸"}</span>
            <span>
              {isTogglingPause
                ? "Updating..."
                : isPaused
                ? "Resume Registrations"
                : "Pause Registrations"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full sm:w-auto bg-white text-[#0B1B33] hover:bg-neutral-100 px-6 py-3 rounded-2xl text-base font-heading font-extrabold transition-colors cursor-pointer shadow-sm"
          >
            Export list
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search Bar matching Page 23 */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or school"
            className="w-full bg-white text-[#0B1B33] rounded-2xl p-4 sm:p-5 text-xl font-heading font-medium outline-none placeholder:text-neutral-400"
          />
        </div>

        {/* Filter Pills matching Page 23 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All" },
            { id: "unpaid", label: "Unpaid" },
            { id: "individuals", label: "Individuals" },
            { id: "teams", label: "School teams" },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilter(pill.id)}
              className={`px-5 py-3 rounded-2xl text-lg font-heading font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                filter === pill.id
                  ? "bg-white text-[#0B1B33]"
                  : "border-2 border-white text-white hover:bg-white/10"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {reminderToast && (
        <div className="bg-[#FFD23F] text-[#0B1B33] p-4 rounded-2xl text-lg font-heading font-extrabold flex items-center justify-between">
          <span>✓ {reminderToast}</span>
          <button onClick={() => setReminderToast("")} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Side-by-Side on Desktop (Page 23) / Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Delegate List */}
        <div className="lg:col-span-7 bg-white text-[#0B1B33] rounded-3xl p-4 sm:p-6 space-y-2 max-h-[780px] overflow-y-auto">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-xl text-neutral-500 font-medium">
              No matching registrations.
            </div>
          ) : (
            filteredList.map((reg) => {
              const firstComm =
                committees.find((c) => c.id === reg.preferences[0]?.committeeId)?.name || "UNSC";
              const isSelected = reg.id === selectedRegistration?.id;
              const isPaid = reg.paymentStatus === "verified";

              return (
                <div
                  key={reg.id}
                  onClick={() => setSelectedId(reg.id)}
                  className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? "bg-blue-50 ring-2 ring-[#1560BD]" : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="pr-4">
                    <div className="text-xl font-heading font-extrabold text-[#0B1B33]">
                      {reg.delegateName}
                    </div>
                    <div className="text-base text-neutral-600 font-medium mt-0.5">
                      {reg.school}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-lg font-medium text-neutral-700 hidden sm:block">
                      {firstComm} first
                    </div>
                    <div
                      className={`text-lg font-heading font-extrabold ${
                        isPaid ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {isPaid ? "Paid" : "Unpaid"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Delegate Detail Panel matching Page 18 & 23 */}
        {selectedRegistration && (
          <div className="lg:col-span-5 bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-heading font-extrabold text-[#0B1B33]">
                  {selectedRegistration.delegateName}
                </h3>
                <span className="text-lg font-heading font-bold px-3 py-1 bg-neutral-100 rounded-xl text-neutral-700">
                  {selectedRegistration.registrationNumber}
                </span>
              </div>
              <p className="text-lg text-neutral-600 font-medium mt-1">
                {selectedRegistration.school}, Class {selectedRegistration.classYear}
              </p>
              <p className="text-base text-neutral-500 font-medium mt-1">
                {selectedRegistration.email}, {selectedRegistration.phone}
              </p>
            </div>

            {/* Preferences 1, 2, 3 */}
            <div className="space-y-4 pt-2">
              {selectedRegistration.preferences.map((pref, idx) => (
                <div key={idx} className="border-t border-neutral-100 pt-3">
                  <div className="text-xl font-heading font-extrabold text-[#0B1B33]">
                    {idx + 1}. {getCommName(pref.committeeId)}
                  </div>
                  <div className="text-lg text-neutral-700 font-medium mt-1">
                    {pref.portfolioIds.map(getPortName).join(", ")}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Proof Card matching Page 18 & 23 */}
            <div className="bg-neutral-100 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="text-lg font-heading font-extrabold text-[#0B1B33]">
                  Payment proof, Rs {selectedRegistration.feeAmount.toLocaleString()}
                </div>
                <div className="text-sm text-neutral-600 font-medium mt-0.5">
                  Status:{" "}
                  <span
                    className={`font-bold ${
                      selectedRegistration.paymentStatus === "verified"
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {selectedRegistration.paymentStatus === "verified"
                      ? "Verified"
                      : "Pending Verification"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {selectedRegistration.paymentStatus !== "verified" ? (
                <Button
                  onClick={() => verifyPayment(selectedRegistration.id)}
                >
                  Verify payment
                </Button>
              ) : (
                <div className="w-full bg-emerald-50 border-2 border-emerald-500 text-emerald-800 rounded-2xl p-4 text-center font-heading font-extrabold text-xl">
                  ✓ Payment Verified
                </div>
              )}

              <button
                type="button"
                onClick={() => handleSendReminder(selectedRegistration)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-[#0B1B33] rounded-2xl p-4 text-lg font-heading font-extrabold transition-colors cursor-pointer"
              >
                Send reminder email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
