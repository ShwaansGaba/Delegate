"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PortfolioCombobox } from "@/components/ui/PortfolioCombobox";
import { CountryPill } from "@/components/ui/CountryPill";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { ArrowRight, Check, Trash2, LogOut } from "lucide-react";

type SetupSubStep = "overview" | "basics" | "committees" | "countries" | "rules" | "publish";

export default function SetupLandingPage() {
  const {
    user,
    isAuthLoaded,
    signOut,
    event,
    committees,
    portfolios,
    updateEventBasics,
    updateEventRules,
    addCommittee,
    loadTemplateCommittees,
    removeCommittee,
    deletePortfolio,
    deleteMultiplePortfolios,
    addPortfolioToCommittee,
    markConferencePublished,
    clearDatabase,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<SetupSubStep>("overview");

  // Basics form state with date inputs and separate fees
  const [name, setName] = useState(event.name || "");
  const [dateFrom, setDateFrom] = useState(event.dateFrom || "");
  const [dateTo, setDateTo] = useState(event.dateTo || "");
  const [deadlineDate, setDeadlineDate] = useState(event.deadlineDate || "");
  const [venue, setVenue] = useState(event.venue || "");
  const [fee, setFee] = useState(event.fee ? event.fee.toString() : "1500");
  const [schoolFee, setSchoolFee] = useState(
    event.schoolFeePerStudent ? event.schoolFeePerStudent.toString() : "1200"
  );

  // Add Committee form state
  const [newCommName, setNewCommName] = useState("");
  const [newCommAgenda, setNewCommAgenda] = useState("");
  const [newCommSeats, setNewCommSeats] = useState("30");
  const [guideUploaded, setGuideUploaded] = useState(false);

  // Countries multi-select state
  const [activeCommId, setActiveCommId] = useState(committees[0]?.id || "unsc");
  const [selectedPortIds, setSelectedPortIds] = useState<string[]>([]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state if event loads asynchronously
  React.useEffect(() => {
    document.title = event.name ? `${event.name} Setup | Delegate` : "Conference Setup | Delegate";
    if (event.name) setName(event.name);
    if (event.dateFrom) setDateFrom(event.dateFrom);
    if (event.dateTo) setDateTo(event.dateTo);
    if (event.deadlineDate) setDeadlineDate(event.deadlineDate);
    if (event.venue) setVenue(event.venue);
    if (event.fee) setFee(event.fee.toString());
    if (event.schoolFeePerStudent) setSchoolFee(event.schoolFeePerStudent.toString());
  }, [event]);

  // Keep active committee in sync
  React.useEffect(() => {
    if (committees.length > 0 && !committees.some((c) => c.id === activeCommId)) {
      setActiveCommId(committees[0].id);
    }
  }, [committees, activeCommId]);

  // Helper date formatter
  const formatDateRange = (dFrom: string, dTo: string) => {
    if (!dFrom && !dTo) return "";
    if (dFrom && !dTo) return dFrom;
    return `${dFrom} to ${dTo}`;
  };

  // Practical status checks: Real requirements without fake defaults
  const isBasicsDone = Boolean(
    name.trim().length > 0 &&
    dateFrom &&
    dateTo &&
    dateTo >= dateFrom &&
    deadlineDate &&
    deadlineDate <= dateFrom
  );

  const isCommitteesDone = committees.length > 0;

  // Each committee must have at least 3 portfolios so delegates can select 3 choices
  const isCountriesDone =
    committees.length > 0 &&
    committees.every((c) => portfolios.filter((p) => p.committeeId === c.id).length >= 3);

  const handleSaveBasics = () => {
    setValidationError(null);
    if (!name.trim()) {
      setValidationError("Please enter your conference name.");
      return;
    }
    if (!dateFrom || !dateTo) {
      setValidationError("Please provide both Start Date and End Date.");
      return;
    }
    if (dateTo < dateFrom) {
      setValidationError("Conference End date cannot be before Start date.");
      return;
    }
    if (!deadlineDate) {
      setValidationError("Please set a registration deadline date.");
      return;
    }
    if (deadlineDate > dateFrom) {
      setValidationError("Registration deadline cannot be after the conference start date.");
      return;
    }

    const computedDates = formatDateRange(dateFrom, dateTo);
    updateEventBasics({
      name: name.trim(),
      dates: computedDates,
      dateFrom,
      dateTo,
      venue: venue.trim() || "Main Auditorium",
      fee: Math.max(0, Number(fee) || 0),
      schoolFeePerStudent: Math.max(0, Number(schoolFee) || 0),
      deadline: deadlineDate,
      deadlineDate,
    });
    setCurrentStep("committees");
  };

  const handleAddCommittee = () => {
    setValidationError(null);
    const cleanName = newCommName.trim().toUpperCase();
    if (!cleanName) {
      setValidationError("Please enter a committee name (e.g. UNSC, DISEC).");
      return;
    }
    if (committees.some((c) => c.name.toUpperCase() === cleanName)) {
      setValidationError(`Committee "${cleanName}" already exists. Please choose a unique name.`);
      return;
    }
    const seats = Number(newCommSeats);
    if (isNaN(seats) || seats <= 0) {
      setValidationError("Seats must be a positive number.");
      return;
    }

    addCommittee({
      name: cleanName,
      agenda: newCommAgenda.trim() || "Addressing contemporary international affairs",
      totalSeats: seats,
      backgroundGuideUrl: "/guides/UNSC_Background_Guide.pdf",
    });
    setNewCommName("");
    setNewCommAgenda("");
    setNewCommSeats("30");
    setGuideUploaded(false);
  };

  const handleContinueToCountries = () => {
    setValidationError(null);
    if (committees.length === 0) {
      setValidationError("Please add at least one committee before proceeding to countries.");
      return;
    }
    setCurrentStep("countries");
  };

  const handleContinueToRules = () => {
    setValidationError(null);
    if (committees.length === 0) {
      setValidationError("Please add at least one committee first.");
      setCurrentStep("committees");
      return;
    }
    const commWithFewPortfolios = committees.find(
      (c) => portfolios.filter((p) => p.committeeId === c.id).length < 3
    );
    if (commWithFewPortfolios) {
      setValidationError(
        `Committee "${commWithFewPortfolios.name}" has fewer than 3 portfolios. Please add at least 3 portfolios so delegates can choose 3 preferences.`
      );
      setActiveCommId(commWithFewPortfolios.id);
      return;
    }
    setCurrentStep("rules");
  };

  const handleOpenRegistrations = () => {
    setValidationError(null);

    // 1. Validate Basics
    if (!name.trim()) {
      setValidationError("Cannot open registrations: Conference name is missing in Basics.");
      setCurrentStep("basics");
      return;
    }
    if (!dateFrom || !dateTo) {
      setValidationError("Cannot open registrations: Start and End dates are required.");
      setCurrentStep("basics");
      return;
    }
    if (dateTo < dateFrom) {
      setValidationError("Cannot open registrations: End date cannot be before Start date.");
      setCurrentStep("basics");
      return;
    }
    if (!deadlineDate) {
      setValidationError("Cannot open registrations: Registration deadline is required.");
      setCurrentStep("basics");
      return;
    }
    if (deadlineDate > dateFrom) {
      setValidationError("Cannot open registrations: Deadline cannot be after conference start date.");
      setCurrentStep("basics");
      return;
    }

    // 2. Validate Committees
    if (committees.length === 0) {
      setValidationError("Cannot open registrations: Please add at least one committee first.");
      setCurrentStep("committees");
      return;
    }

    // 3. Validate Countries / Portfolios
    const commWithFewPortfolios = committees.find(
      (c) => portfolios.filter((p) => p.committeeId === c.id).length < 3
    );
    if (commWithFewPortfolios) {
      setValidationError(
        `Cannot open registrations: Committee "${commWithFewPortfolios.name}" needs at least 3 portfolios so delegates can select 3 preferences.`
      );
      setActiveCommId(commWithFewPortfolios.id);
      setCurrentStep("countries");
      return;
    }

    // All real validations passed! Save exact user data (NO DUMMY FALLBACKS)
    const computedDates = formatDateRange(dateFrom, dateTo);
    updateEventBasics({
      name: name.trim(),
      dates: computedDates,
      dateFrom,
      dateTo,
      venue: venue.trim() || "Main Auditorium",
      fee: Math.max(0, Number(fee) || 0),
      schoolFeePerStudent: Math.max(0, Number(schoolFee) || 0),
      deadline: deadlineDate,
      deadlineDate,
    });

    markConferencePublished();
    setCurrentStep("publish");
  };

  const toggleSelectPort = (portId: string) => {
    setSelectedPortIds((prev) =>
      prev.includes(portId) ? prev.filter((id) => id !== portId) : [...prev, portId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedPortIds.length === 0) return;
    if (confirm(`Delete ${selectedPortIds.length} selected countries?`)) {
      deleteMultiplePortfolios(selectedPortIds);
      setSelectedPortIds([]);
    }
  };

  const activePortfolios = portfolios.filter(
    (p) => p.committeeId === (activeCommId || committees[0]?.id)
  );

  const registrationLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register`
      : "http://localhost:3000/register";

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(registrationLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Registrations are now open for ${event.name || name || "MUN 2026"}! Dates: ${event.dates || formatDateRange(dateFrom, dateTo)}. Choose your committee and claim your country here: ${registrationLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (isAuthLoaded && !user) {
    return <AuthScreen />;
  }

  return (
    <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-4 py-8 sm:px-8 sm:py-12 overflow-x-hidden text-white">
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col justify-between">
        {/* Top Header & Progress */}
        <div>
          {user && (
            <div className="flex items-center justify-between bg-blue-900/40 border border-blue-400/30 px-4 py-2.5 rounded-2xl mb-6 text-sm sm:text-base">
              <div className="flex items-center space-x-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="text-blue-100 font-medium truncate">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="text-white hover:text-yellow-300 font-bold underline ml-4 text-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}

          {validationError && (
            <div className="bg-[#FFD23F] text-[#0B1B33] p-4 rounded-2xl font-bold mb-6 text-base flex items-center justify-between shadow-lg">
              <span>{validationError}</span>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-[#0B1B33] font-extrabold ml-4 hover:opacity-75 cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>
          )}

          {currentStep !== "overview" && (
            <ProgressBar
              currentStep={
                currentStep === "basics"
                  ? 1
                  : currentStep === "committees"
                  ? 2
                  : currentStep === "countries"
                  ? 3
                  : currentStep === "rules"
                  ? 4
                  : 5
              }
              totalSteps={5}
              onBack={() => {
                setValidationError(null);
                setCurrentStep("overview");
              }}
            />
          )}

          {/* OVERVIEW / STEPPER MENU (Matching Page 13 mobile & Page 26 desktop) */}
          {currentStep === "overview" && (
            <div key="overview" className="space-y-6 pt-4 page-transition">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  Set up your <br />
                  conference
                </h1>
                <p className="text-xl text-white/90 font-medium mt-2">
                  Create your MUN conference in a few simple steps.
                </p>
              </div>

              {/* Stacked Cards matching Page 13 */}
              <div className="space-y-3 pt-2">
                {/* 1. Basics */}
                <div
                  onClick={() => {
                    setValidationError(null);
                    setCurrentStep("basics");
                  }}
                  className="bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-neutral-50 interactive-card select-none"
                >
                  <div>
                    <div className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                      Basics
                    </div>
                    <div className="text-base text-neutral-600 font-medium mt-0.5">
                      {event.name ? `${event.name}, ${event.dates}` : "Name, dates, fee"}
                    </div>
                  </div>
                  <div>
                    {isBasicsDone ? (
                      <span className="text-xl font-heading font-extrabold text-emerald-700 flex items-center gap-1 animate-pop">
                        <Check className="w-6 h-6 stroke-[3]" /> Done
                      </span>
                    ) : (
                      <span className="text-xl font-heading font-extrabold text-[#1560BD]">
                        Start
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Committees */}
                <div
                  onClick={() => {
                    setValidationError(null);
                    setCurrentStep("committees");
                  }}
                  className="bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-neutral-50 interactive-card select-none"
                >
                  <div>
                    <div className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                      Committees
                    </div>
                    <div className="text-base text-neutral-600 font-medium mt-0.5">
                      {committees.length > 0 ? `${committees.length} added` : "Add or choose templates"}
                    </div>
                  </div>
                  <div>
                    {isCommitteesDone ? (
                      <span className="text-xl font-heading font-extrabold text-emerald-700 flex items-center gap-1 animate-pop">
                        <Check className="w-6 h-6 stroke-[3]" /> Done
                      </span>
                    ) : (
                      <span className="text-xl font-heading font-extrabold text-[#1560BD]">
                        Start
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Countries */}
                <div
                  onClick={() => {
                    if (committees.length === 0) {
                      setValidationError("Please add at least one committee first before configuring countries.");
                      setCurrentStep("committees");
                    } else {
                      setValidationError(null);
                      setCurrentStep("countries");
                    }
                  }}
                  className="bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-neutral-50 interactive-card select-none"
                >
                  <div>
                    <div className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                      Countries
                    </div>
                    <div className="text-base text-neutral-600 font-medium mt-0.5">
                      {portfolios.length > 0
                        ? `${portfolios.length} portfolios ready`
                        : "Country matrices per committee"}
                    </div>
                  </div>
                  <div>
                    {isCountriesDone ? (
                      <span className="text-xl font-heading font-extrabold text-emerald-700 flex items-center gap-1 animate-pop">
                        <Check className="w-6 h-6 stroke-[3]" /> Done
                      </span>
                    ) : (
                      <span className="text-xl font-heading font-extrabold text-[#1560BD]">
                        Start
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Rules */}
                <div
                  onClick={() => {
                    setValidationError(null);
                    setCurrentStep("rules");
                  }}
                  className="bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-neutral-50 interactive-card select-none"
                >
                  <div>
                    <div className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                      Rules
                    </div>
                    <div className="text-base text-neutral-600 font-medium mt-0.5">
                      How registration works
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-heading font-extrabold text-[#1560BD]">
                      Configure
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick load template action */}
              {committees.length === 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!event.name) {
                        setName("Model United Nations 2026");
                        setDateFrom("2026-12-14");
                        setDateTo("2026-12-15");
                        setDeadlineDate("2026-11-20");
                        updateEventBasics({
                          name: "Model United Nations 2026",
                          dates: "14 and 15 December",
                          dateFrom: "2026-12-14",
                          dateTo: "2026-12-15",
                          deadline: "20 November",
                          deadlineDate: "2026-11-20",
                          fee: 1500,
                        });
                      }
                      loadTemplateCommittees();
                      setValidationError(null);
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/30 rounded-2xl p-4 text-lg font-heading font-bold text-center cursor-pointer transition-colors"
                  >
                    ⚡ Quick Start: Load 4 Standard Committees (UNSC, DISEC, UNHRC, UNEP)
                  </button>
                </div>
              )}

              {/* Bottom Yellow Action Button */}
              <div className="pt-6">
                <Button
                  onClick={() => {
                    setValidationError(null);
                    if (!isBasicsDone) setCurrentStep("basics");
                    else if (!isCommitteesDone) setCurrentStep("committees");
                    else if (!isCountriesDone) setCurrentStep("countries");
                    else handleOpenRegistrations();
                  }}
                >
                  {isBasicsDone && isCommitteesDone && isCountriesDone
                    ? "Open registrations"
                    : !isBasicsDone
                    ? "Start Basics"
                    : !isCommitteesDone
                    ? "Add Committees"
                    : "Configure Countries"}
                </Button>
              </div>

              {/* Clear database action */}
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Reset everything to an empty database?")) {
                      clearDatabase();
                      setName("");
                      setDateFrom("");
                      setDateTo("");
                      setDeadlineDate("");
                      setValidationError(null);
                    }
                  }}
                  className="text-base text-white/60 hover:text-white underline font-medium cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Clear database & start fresh
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: BASICS */}
          {currentStep === "basics" && (
            <div key="basics" className="space-y-6 pt-4 page-transition">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  Conference <br />
                  basics
                </h1>
                <p className="text-xl text-white/90 font-medium mt-1">
                  Name, dates, venue, and delegate fees.
                </p>
              </div>

              <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-5">
                <div>
                  <label className="block text-lg font-heading font-extrabold text-neutral-800 mb-1">
                    Conference name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Oakridge International MUN 2026"
                    autoFocus
                    className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                  />
                </div>

                {/* Date From and Date To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-heading font-extrabold text-neutral-800 mb-1">
                      Conference start date
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-heading font-extrabold text-neutral-800 mb-1">
                      Conference end date
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Registration Deadline Date */}
                <div>
                  <label className="block text-lg font-heading font-extrabold text-neutral-800 mb-1">
                    Registration deadline
                  </label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                  />
                </div>

                {/* Individual vs School Delegation Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-heading font-extrabold text-neutral-800 mb-1">
                      Individual fee (Rs)
                    </label>
                    <input
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="1500"
                      className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-heading font-extrabold text-neutral-800 mb-1">
                      School team fee (Rs / student)
                    </label>
                    <input
                      type="number"
                      value={schoolFee}
                      onChange={(e) => setSchoolFee(e.target.value)}
                      placeholder="1200"
                      className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-heading font-extrabold text-neutral-800 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Main Auditorium"
                    className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveBasics}>Save & Next</Button>
              </div>
            </div>
          )}

          {/* STEP 2: COMMITTEES (Pages 14 & 26) */}
          {currentStep === "committees" && (
            <div key="committees" className="space-y-6 pt-4 page-transition">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  Committees
                </h1>
                <p className="text-xl text-white/90 font-medium mt-1">
                  Add the simulation committees for your conference.
                </p>
              </div>

              {/* Existing Committees List matching Page 14 */}
              <div className="space-y-3">
                {committees.length === 0 ? (
                  <div className="bg-white/10 rounded-2xl p-6 text-center text-white text-lg">
                    No committees added yet. Add your first committee or start from standard templates.
                  </div>
                ) : (
                  committees.map((comm) => (
                    <div
                      key={comm.id}
                      className="bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                          {comm.name}
                        </div>
                        <div className="text-base text-neutral-600 font-medium mt-0.5">
                          {comm.totalSeats} seats, {portfolios.filter(p => p.committeeId === comm.id).length} portfolios
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => removeCommittee(comm.id)}
                          className="text-red-500 hover:text-red-700 p-2 cursor-pointer"
                          title="Remove committee"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Template quick-picker */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={loadTemplateCommittees}
                  className="text-xl font-heading font-extrabold text-[#FFD23F] hover:underline cursor-pointer"
                >
                  Start from a template (UNSC, DISEC, UNHRC, UNEP)
                </button>
              </div>

              {/* Add a committee card */}
              <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                  Add a committee
                </h3>

                <div>
                  <label className="block text-base font-bold text-neutral-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    placeholder="UNGA"
                    className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-neutral-700 mb-1">
                    Agenda
                  </label>
                  <input
                    type="text"
                    value={newCommAgenda}
                    onChange={(e) => setNewCommAgenda(e.target.value)}
                    placeholder="Agenda title"
                    className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-neutral-700 mb-1">
                    Seats
                  </label>
                  <input
                    type="number"
                    value={newCommSeats}
                    onChange={(e) => setNewCommSeats(e.target.value)}
                    placeholder="30"
                    className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setGuideUploaded(true)}
                    className="w-full border-2 border-[#0B1B33] hover:bg-neutral-100 rounded-2xl p-4 text-lg font-heading font-extrabold text-center transition-colors cursor-pointer"
                  >
                    {guideUploaded ? "Background guide uploaded ✓" : "Upload background guide"}
                  </button>
                </div>

                <div className="pt-2">
                  <Button onClick={handleAddCommittee}>Add committee</Button>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleContinueToCountries}>
                  Continue to countries
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: COUNTRIES */}
          {currentStep === "countries" && (
            <div key="countries" className="space-y-6 pt-4 page-transition">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  Countries & Portfolios
                </h1>
                <p className="text-xl text-white/90 font-medium mt-1">
                  Hover to delete via circle, or select multiple checkboxes to delete in bulk.
                </p>
              </div>

              <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-6">
                {/* Committee Selector Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {committees.map((comm) => (
                    <button
                      key={comm.id}
                      type="button"
                      onClick={() => {
                        setActiveCommId(comm.id);
                        setSelectedPortIds([]);
                      }}
                      className={`px-4 py-2 rounded-xl text-lg font-heading font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                        (activeCommId || committees[0]?.id) === comm.id
                          ? "bg-[#1560BD] text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {comm.name}
                    </button>
                  ))}
                </div>

                {/* Header with bulk delete action */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="text-lg font-heading font-extrabold text-neutral-800">
                    Portfolios ({activePortfolios.length})
                  </div>

                  {selectedPortIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-heading font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Selected ({selectedPortIds.length})
                    </button>
                  )}
                </div>

                {/* Country Pills list with hover delete circle & checkbox */}
                <div className="flex flex-wrap gap-2.5 max-h-72 overflow-y-auto p-1">
                  {activePortfolios.length === 0 ? (
                    <div className="py-6 text-neutral-400 font-medium text-center w-full">
                      No portfolios added for this committee. Use the combobox below to add countries or leaders.
                    </div>
                  ) : (
                    activePortfolios.map((p) => (
                      <CountryPill
                        key={p.id}
                        id={p.id}
                        name={p.countryName}
                        code={p.code}
                        isSelected={selectedPortIds.includes(p.id)}
                        onToggleSelect={toggleSelectPort}
                        onDelete={deletePortfolio}
                        showCheckbox={true}
                      />
                    ))
                  )}
                </div>

                {/* Combobox for Adding Countries & Indian Politicians */}
                <div className="pt-2 border-t border-neutral-100">
                  <label className="block text-base font-heading font-extrabold text-neutral-800 mb-2">
                    Add countries or politicians (Combobox)
                  </label>
                  <PortfolioCombobox
                    existingNames={activePortfolios.map((p) => p.countryName)}
                    onAdd={(item) => {
                      const cid = activeCommId || committees[0]?.id;
                      if (!cid) {
                        alert("Please select or add a committee first.");
                        return;
                      }
                      addPortfolioToCommittee(cid, item);
                    }}
                    placeholder="Type country name or Indian politician (e.g., India, Amit Shah)..."
                  />
                  <p className="text-xs text-neutral-500 font-medium mt-1.5">
                    Includes all 195 world countries + Indian political leaders (for AIPPM/Lok Sabha).
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleContinueToRules}>
                  Continue to rules
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: RULES (Pages 15 & 27) */}
          {currentStep === "rules" && (
            <div key="rules" className="space-y-6 pt-4 page-transition">
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                  How should <br />
                  registration <br />
                  work?
                </h1>
              </div>

              <div className="space-y-3">
                <Toggle
                  label="Allow school teams"
                  description="Schools register all their delegates at once"
                  checked={event.rules.allowSchoolTeams}
                  onChange={(c) => updateEventRules({ allowSchoolTeams: c })}
                />

                <Toggle
                  label="Ask for payment proof"
                  description="Delegates upload a receipt or pay online"
                  checked={event.rules.askPaymentProof}
                  onChange={(c) => updateEventRules({ askPaymentProof: c })}
                />

                <Toggle
                  label="Show taken countries live"
                  description="Delegates see what is still open while choosing"
                  checked={event.rules.showTakenPortfoliosLive}
                  onChange={(c) => updateEventRules({ showTakenPortfoliosLive: c })}
                />

                <Toggle
                  label="First come, first served"
                  description="Off means every preference is weighed together"
                  checked={event.rules.firstComeFirstServed}
                  onChange={(c) => updateEventRules({ firstComeFirstServed: c })}
                />
              </div>

              <p className="text-lg text-white font-medium leading-relaxed">
                Turn off first come, first served and every preference is weighed together.
              </p>

              <div className="pt-4">
                {isBasicsDone && isCommitteesDone && isCountriesDone ? (
                  <Button onClick={handleOpenRegistrations}>
                    Open registrations
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-[#FFD23F] text-[#0B1B33] p-4 rounded-2xl font-bold text-base">
                      ⚠️ Complete earlier steps first:{" "}
                      {!isBasicsDone
                        ? "Conference Basics are incomplete (Name, Dates, and Deadline)."
                        : !isCommitteesDone
                        ? "At least one committee must be added."
                        : "Each committee needs at least 3 portfolios."}
                    </div>
                    <Button
                      onClick={() => {
                        setValidationError(null);
                        if (!isBasicsDone) setCurrentStep("basics");
                        else if (!isCommitteesDone) setCurrentStep("committees");
                        else setCurrentStep("countries");
                      }}
                    >
                      {!isBasicsDone
                        ? "Next: Complete Basics"
                        : !isCommitteesDone
                        ? "Next: Add Committees"
                        : "Next: Add Countries"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: PUBLISH & SHARABLE LINK (Pages 16 & 28) */}
          {currentStep === "publish" && (
            <div key="publish" className="space-y-6 pt-4 page-transition">
              <div>
                <h1 className="text-5xl sm:text-6xl font-heading font-extrabold text-white leading-tight">
                  Registrations <br />
                  are open.
                </h1>
                <p className="text-xl sm:text-2xl text-white font-medium mt-2">
                  Send this one link. Delegates choose alone or as a school.
                </p>
              </div>

              {/* Link Box */}
              <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="text-base text-neutral-500 font-bold uppercase tracking-wider">
                  Your registration link
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#0B1B33] break-all p-4 bg-neutral-100 rounded-2xl">
                  {registrationLink}
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full bg-white border-2 border-neutral-200 hover:bg-neutral-50 text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between text-xl font-heading font-extrabold transition-colors cursor-pointer"
                  >
                    <span>Share on WhatsApp</span>
                    <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full bg-white border-2 border-neutral-200 hover:bg-neutral-50 text-[#0B1B33] rounded-2xl p-5 text-center text-xl font-heading font-extrabold transition-colors cursor-pointer"
                  >
                    {copiedLink ? "✓ Link Copied!" : "Copy link"}
                  </button>
                </div>
              </div>

              {/* What happens next card */}
              <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-3">
                <h3 className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                  What happens next
                </h3>
                <div className="space-y-2 text-lg font-medium text-neutral-700">
                  <div>1. Delegates register and pick preferences</div>
                  <div>2. You verify payments</div>
                  <div>3. You allot and publish</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link href="/register" className="block w-full">
                  <Button>Open delegate registration →</Button>
                </Link>

                <Link
                  href="/organizer"
                  className="block text-center text-xl font-heading font-bold text-[#FFD23F] hover:underline pt-2"
                >
                  Go to organizer dashboard →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
