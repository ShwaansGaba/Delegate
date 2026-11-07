"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Row } from "@/components/ui/Row";
import { PortfolioCombobox } from "@/components/ui/PortfolioCombobox";
import { CountryPill } from "@/components/ui/CountryPill";
import { Trash2, Lock, ArrowRight, Check } from "lucide-react";
import { getConferenceRegistrationLink, getConferenceBrowseLink } from "@/lib/registrationLinks";

type SetupStep = "basics" | "committees" | "countries" | "rules" | "publish";

const COMMITTEE_TEMPLATES = [
  { name: "UNSC", agenda: "Addressing maritime security and sovereignty conflicts", totalSeats: 15 },
  { name: "DISEC", agenda: "Non-proliferation of tactical and cyber ballistic armaments", totalSeats: 40 },
  { name: "UNHRC", agenda: "Protection of vulnerable populations in active war zones", totalSeats: 47 },
  { name: "UNEP", agenda: "Transboundary river basin conservation and climate treaties", totalSeats: 30 },
  { name: "UNGA", agenda: "Equitable development of sovereign AI and technology infrastructure", totalSeats: 60 },
  { name: "WHO", agenda: "Global pandemic preparedness and healthcare distribution equity", totalSeats: 35 },
  { name: "AIPPM", agenda: "Review of national electoral reforms and cooperative federalism", totalSeats: 50 },
  { name: "Lok Sabha", agenda: "National security framework and border infrastructure review", totalSeats: 45 },
  { name: "G20", agenda: "Sustainable global debt architecture and multilateral financing", totalSeats: 21 },
];

export default function OrganizerSetupPage() {
  const router = useRouter();
  const {
    event,
    committees,
    portfolios,
    updateEventRules,
    updateEventBasics,
    addCommittee,
    editCommittee,
    syncCommitteePortfolios,
    removeCommittee,
    deletePortfolio,
    deleteMultiplePortfolios,
    addPortfolioToCommittee,
    markConferencePublished,
  } = useApp();

  // Helper to determine the first incomplete step in the setup flow
  const computeFirstIncompleteStep = (
    evName: string,
    evDateFrom: string,
    evDateTo: string,
    evDeadline: string,
    evVenue: string,
    commList: typeof committees,
    portList: typeof portfolios,
    isPub: boolean
  ): SetupStep => {
    // 1. Check Basics
    const cleanName = (evName || "").trim();
    const cleanVenue = (evVenue || "").trim();
    const basicsComplete = Boolean(
      cleanName.length > 0 &&
      cleanName.toLowerCase() !== "new mun conference" &&
      evDateFrom &&
      evDateTo &&
      evDateTo >= evDateFrom &&
      evDeadline &&
      evDeadline <= evDateFrom &&
      cleanVenue.length > 0
    );
    if (!basicsComplete) return "basics";

    // 2. Check Committees
    if (!commList || commList.length === 0) return "committees";

    // 3. Check Countries (at least 3 portfolios per committee)
    const countriesComplete = commList.every(
      (c) => portList.filter((p) => p.committeeId === c.id).length >= 3
    );
    if (!countriesComplete) return "countries";

    // 4. Check Rules
    const rulesDone =
      isPub ||
      (typeof window !== "undefined" &&
        Boolean(localStorage.getItem(`delegate_rules_done_${event.id}`)));
    if (!rulesDone && !isPub) return "rules";

    // 5. If all complete
    return isPub ? "basics" : "publish";
  };

  // Step state - always initialized to basics
  const [currentStep, setCurrentStep] = useState<SetupStep>("basics");

  // On conference load / switch, route cleanly to the requested or first incomplete step
  React.useEffect(() => {
    if (typeof window !== "undefined" && event.id) {
      const validSteps: SetupStep[] = ["basics", "committees", "countries", "rules", "publish"];
      const urlStep = new URLSearchParams(window.location.search).get("step") as SetupStep | null;

      if (urlStep && validSteps.includes(urlStep)) {
        setCurrentStep(urlStep);
        return;
      }

      // If the conference is already published, open on basics so user can review/edit
      if (event.status === "published") {
        setCurrentStep("basics");
        return;
      }

      const firstIncomplete = computeFirstIncompleteStep(
        name,
        dateFrom,
        dateTo,
        deadlineDate,
        venue,
        committees,
        portfolios,
        false
      );

      const savedStep = localStorage.getItem(`delegate_setup_step_${event.id}`) as SetupStep | null;
      if (savedStep && validSteps.includes(savedStep)) {
        setCurrentStep(savedStep);
      } else {
        // Default to first incomplete step, but never land unexpectedly on publish
        setCurrentStep(firstIncomplete === "publish" ? "basics" : firstIncomplete);
      }
    }
  }, [event.id]);

  React.useEffect(() => {
    if (typeof window !== "undefined" && event.id) {
      localStorage.setItem(`delegate_setup_step_${event.id}`, currentStep);
    }
    // Scroll to top on every step change
    window.scrollTo({ top: 0, behavior: "smooth" });
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, event.id]);

  // Basics state with date inputs and separate fees
  const [name, setName] = useState(event.name);
  const [dateFrom, setDateFrom] = useState(event.dateFrom || "");
  const [dateTo, setDateTo] = useState(event.dateTo || "");
  const [deadlineDate, setDeadlineDate] = useState(event.deadlineDate || "");
  const [venue, setVenue] = useState(event.venue);
  const [fee, setFee] = useState(event.fee.toString());
  const [schoolFee, setSchoolFee] = useState(
    event.schoolFeePerStudent ? event.schoolFeePerStudent.toString() : "1200"
  );

  // Track event ID to only sync initial data once per conference load
  const syncedEventIdRef = React.useRef<string | null>(null);

  // Sync state if event loads asynchronously or user switches conference
  React.useEffect(() => {
    if (event.id && event.id !== syncedEventIdRef.current) {
      syncedEventIdRef.current = event.id;
      setName(event.name || "");
      setDateFrom(event.dateFrom || "");
      setDateTo(event.dateTo || "");
      setDeadlineDate(event.deadlineDate || "");
      setVenue(event.venue || "");
      setFee(event.fee ? event.fee.toString() : "1500");
      setSchoolFee(
        event.schoolFeePerStudent ? event.schoolFeePerStudent.toString() : "1200"
      );
    }
  }, [event.id]);

  // Auto-sync basics draft live so reloads never lose typed data (NEVER TRIM while actively typing)
  React.useEffect(() => {
    if (event.id && (name !== undefined || dateFrom || dateTo || venue !== undefined)) {
      const computedDates = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : event.dates;
      updateEventBasics({
        name: name, // Preserve spaces while typing!
        dates: computedDates,
        dateFrom,
        dateTo,
        venue: venue, // Preserve spaces while typing!
        fee: Math.max(0, Number(fee) || 0),
        schoolFeePerStudent: Math.max(0, Number(schoolFee) || 0),
        deadline: deadlineDate,
        deadlineDate,
      });
    }
  }, [name, dateFrom, dateTo, deadlineDate, venue, fee, schoolFee, event.id]);

  // New committee form
  const [editingCommId, setEditingCommId] = useState<string | null>(null);
  const [newCommName, setNewCommName] = useState("");
  const [newCommAgenda, setNewCommAgenda] = useState("");
  const [newCommSeats, setNewCommSeats] = useState("40");
  const [guideUploaded, setGuideUploaded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Country multi-select state
  const [countryFilterComm, setCountryFilterComm] = useState(committees[0]?.id || "unsc");
  const [selectedPortIds, setSelectedPortIds] = useState<string[]>([]);

  const activeComm = committees.find((c) => c.id === countryFilterComm);
  const [quickSeatsInput, setQuickSeatsInput] = useState(activeComm?.totalSeats?.toString() || "30");

  React.useEffect(() => {
    if (activeComm) {
      setQuickSeatsInput(activeComm.totalSeats.toString());
    }
  }, [countryFilterComm, activeComm?.totalSeats]);

  // Keep country filter in sync with existing committees
  React.useEffect(() => {
    if (committees.length > 0 && !committees.some((c) => c.id === countryFilterComm)) {
      setCountryFilterComm(committees[0].id);
    }
  }, [committees, countryFilterComm]);

  // Practical status checks: Real requirements without fake defaults
  const isBasicsDone = Boolean(
    name.trim().length > 0 &&
    name.trim().toLowerCase() !== "new mun conference" &&
    dateFrom &&
    dateTo &&
    dateTo >= dateFrom &&
    deadlineDate &&
    deadlineDate <= dateFrom &&
    venue.trim().length > 0
  );

  const isCommitteesDone = committees.length > 0;

  const isCountriesDone =
    committees.length > 0 &&
    committees.every((c) => portfolios.filter((p) => p.committeeId === c.id).length >= 3);

  const isRulesDone = Boolean(
    event.status === "published" ||
    (typeof window !== "undefined" && Boolean(localStorage.getItem(`delegate_rules_done_${event.id}`)))
  );

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
    if (!venue.trim()) {
      setValidationError("Please enter the conference venue.");
      return;
    }

    const computedDates = `${dateFrom} to ${dateTo}`;
    updateEventBasics({
      name: name.trim(),
      dates: computedDates,
      dateFrom,
      dateTo,
      venue: venue.trim(),
      fee: Math.max(0, Number(fee) || 0),
      schoolFeePerStudent: Math.max(0, Number(schoolFee) || 0),
      deadline: deadlineDate,
      deadlineDate,
    });
    setCurrentStep("committees");
  };

  const toggleSelectPort = (id: string) => {
    setSelectedPortIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedPortIds.length === 0) return;
    if (confirm(`Delete ${selectedPortIds.length} selected countries?`)) {
      deleteMultiplePortfolios(selectedPortIds);
      setSelectedPortIds([]);
    }
  };

  const activePortfolios = portfolios.filter((p) => p.committeeId === countryFilterComm);

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
    if (isNaN(seats) || seats < 3 || seats > 150) {
      setValidationError("Portfolios / seats must be between 3 and 150.");
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

  const handleSaveCommitteeEdit = () => {
    if (!editingCommId) return;
    setValidationError(null);
    const cleanName = newCommName.trim().toUpperCase();
    if (!cleanName) {
      setValidationError("Please enter a committee name (e.g. UNSC, DISEC).");
      return;
    }
    // Only check duplicates against OTHER committees!
    if (committees.some((c) => c.id !== editingCommId && c.name.toUpperCase() === cleanName)) {
      setValidationError(`Committee "${cleanName}" already exists. Please choose a unique name.`);
      return;
    }
    const seats = Number(newCommSeats);
    if (isNaN(seats) || seats < 3 || seats > 150) {
      setValidationError("Portfolios / seats must be between 3 and 150.");
      return;
    }

    editCommittee(editingCommId, {
      name: cleanName,
      agenda: newCommAgenda.trim() || "Addressing contemporary international affairs",
      totalSeats: seats,
    });
    setEditingCommId(null);
    setNewCommName("");
    setNewCommAgenda("");
    setNewCommSeats("30");
    setGuideUploaded(false);
  };

  const handleCancelCommitteeEdit = () => {
    setEditingCommId(null);
    setNewCommName("");
    setNewCommAgenda("");
    setNewCommSeats("30");
    setGuideUploaded(false);
    setValidationError(null);
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
      setCountryFilterComm(commWithFewPortfolios.id);
      return;
    }
    setCurrentStep("rules");
  };

  const handleContinueToPublish = () => {
    setValidationError(null);
    if (!isBasicsDone) {
      setValidationError("Please complete Conference Basics (Name, Dates, Deadline, Venue) first.");
      setCurrentStep("basics");
      return;
    }
    if (!isCommitteesDone) {
      setValidationError("Please add at least one committee first before continuing.");
      setCurrentStep("committees");
      return;
    }
    if (!isCountriesDone) {
      const commWithFew = committees.find(
        (c) => portfolios.filter((p) => p.committeeId === c.id).length < 3
      );
      setValidationError(
        `Each committee must have at least 3 portfolios. Please add portfolios for "${commWithFew?.name || "your committee"}".`
      );
      if (commWithFew) setCountryFilterComm(commWithFew.id);
      setCurrentStep("countries");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(`delegate_rules_done_${event.id}`, "true");
    }
    setCurrentStep("publish");
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
      setCountryFilterComm(commWithFewPortfolios.id);
      setCurrentStep("countries");
      return;
    }

    const computedDates = `${dateFrom} to ${dateTo}`;
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

  const individualLink = getConferenceRegistrationLink(event.id, "individual");
  const teamLink = getConferenceRegistrationLink(event.id, "team");
  const browseLink = getConferenceBrowseLink(event.id);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (url: string, typeName: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedType(typeName);
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleShareWhatsApp = (url: string, label: string) => {
    const text = encodeURIComponent(
      `Registrations are now open for ${event.name}! Dates: ${event.dates}. ${label}: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-3xl font-heading font-extrabold text-white leading-tight">
          Set up your conference
        </h1>
      </div>

      {validationError && (
        <div className="bg-[#FFD23F] text-[#0B1B33] p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between shadow-md">
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-[#0B1B33] font-extrabold ml-3 hover:opacity-75 cursor-pointer text-base"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stepper Navigation Pills matching Page 26-28 */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        {[
          { id: "basics", label: "Basics" },
          { id: "committees", label: "Committees" },
          { id: "countries", label: "Countries" },
          { id: "rules", label: "Rules" },
          { id: "publish", label: "Publish" },
        ].map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => {
              setValidationError(null);
              if (st.id === "basics") {
                setCurrentStep("basics");
                return;
              }
              if (!isBasicsDone) {
                setValidationError("Please complete Conference Basics (Name, Dates, Deadline, Venue) first.");
                setCurrentStep("basics");
                return;
              }
              if (st.id === "committees") {
                setCurrentStep("committees");
                return;
              }
              if (!isCommitteesDone) {
                setValidationError("Please add at least one committee first before configuring countries.");
                setCurrentStep("committees");
                return;
              }
              if (st.id === "countries") {
                setCurrentStep("countries");
                return;
              }
              if (!isCountriesDone) {
                const commWithFew = committees.find(
                  (c) => portfolios.filter((p) => p.committeeId === c.id).length < 3
                );
                setValidationError(
                  `Each committee must have at least 3 portfolios. Please add portfolios for "${commWithFew?.name || "your committee"}".`
                );
                if (commWithFew) setCountryFilterComm(commWithFew.id);
                setCurrentStep("countries");
                return;
              }
              if (st.id === "rules") {
                setCurrentStep("rules");
                return;
              }
              if (st.id === "publish") {
                if (event.status !== "published" && !isRulesDone) {
                  setValidationError("Please review conference rules first before publishing.");
                  setCurrentStep("rules");
                  return;
                }
                setCurrentStep("publish");
              }
            }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
              currentStep === st.id
                ? "bg-white text-[#0B1B33] shadow-sm"
                : "border border-white/60 text-white hover:bg-white/10"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* STEP 1: BASICS */}
      {currentStep === "basics" && (
        <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl space-y-3 sm:space-y-4 shadow-sm">
          <h2 className="text-lg sm:text-2xl font-heading font-extrabold">Conference Basics</h2>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">Conference name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Model UN 2026"
                className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
              />
            </div>

            {/* Date From and Date To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">Date from</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">Date to</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">Registration deadline</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">Individual fee (Rs)</label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">School fee / student (Rs)</label>
                <input
                  type="number"
                  value={schoolFee}
                  onChange={(e) => setSchoolFee(e.target.value)}
                  className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Main Auditorium"
                className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
              />
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveBasics} className="w-full sm:w-auto py-2.5 px-6 text-sm sm:text-base rounded-xl font-bold">
              Save &amp; Next →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: COMMITTEES (Pages 14 & 26) */}
      {currentStep === "committees" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-start">
          {/* Left Column: Committees list */}
          <div className="lg:col-span-7 bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
            <h2 className="text-lg sm:text-2xl font-heading font-extrabold">Committees</h2>

            <div className="space-y-2.5 sm:space-y-3">
              {committees.map((comm) => (
                <div
                  key={comm.id}
                  className="border border-neutral-200 rounded-xl p-3 sm:p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-base sm:text-lg font-heading font-extrabold text-[#0B1B33]">
                      {comm.name}
                    </div>
                    <div className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                      {comm.totalSeats} seats, {portfolios.filter(p => p.committeeId === comm.id).length} portfolios
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommId(comm.id);
                        setNewCommName(comm.name);
                        setNewCommAgenda(comm.agenda);
                        setNewCommSeats(comm.totalSeats.toString());
                        setGuideUploaded(Boolean(comm.backgroundGuideUrl));
                        setValidationError(null);
                      }}
                      className="text-sm sm:text-base font-heading font-extrabold text-[#1560BD] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete committee "${comm.name}" and all its portfolios?`)) {
                          removeCommittee(comm.id);
                          if (editingCommId === comm.id) {
                            handleCancelCommitteeEdit();
                          }
                        }
                      }}
                      className="text-sm sm:text-base font-heading font-extrabold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const t =
                    COMMITTEE_TEMPLATES.find((item) => !committees.some((c) => c.name.toUpperCase() === item.name.toUpperCase())) ||
                    COMMITTEE_TEMPLATES[committees.length % COMMITTEE_TEMPLATES.length];
                  addCommittee({
                    name: t.name,
                    agenda: t.agenda,
                    totalSeats: t.totalSeats,
                  });
                }}
                className="text-sm sm:text-base font-heading font-extrabold text-[#1560BD] underline hover:text-[#0F4C96] cursor-pointer"
              >
                + Add from template
              </button>
            </div>
          </div>

          {/* Right Column: Add or Edit a committee form */}
          <div className="lg:col-span-5 bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-heading font-extrabold">
                {editingCommId ? "Edit committee" : "Add a committee"}
              </h2>
              {editingCommId && (
                <button
                  type="button"
                  onClick={handleCancelCommitteeEdit}
                  className="text-xs font-heading font-bold text-[#1560BD] hover:underline cursor-pointer"
                >
                  + Add new
                </button>
              )}
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">Name</label>
                <input
                  type="text"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="e.g. UNGA, DISEC"
                  className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-600 mb-1">Agenda</label>
                <input
                  type="text"
                  value={newCommAgenda}
                  onChange={(e) => setNewCommAgenda(e.target.value)}
                  placeholder="e.g. Addressing climate security"
                  className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs sm:text-sm font-bold text-neutral-600">Portfolios / Seats</label>
                  <span className="text-[11px] text-neutral-400 font-bold">Min 3, Max 150</span>
                </div>
                <input
                  type="number"
                  min={3}
                  max={150}
                  value={newCommSeats}
                  onChange={(e) => setNewCommSeats(e.target.value)}
                  placeholder="30"
                  className="w-full bg-neutral-100 rounded-xl px-3 py-2 sm:py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]/30"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Setting {newCommSeats || 30} seats will automatically generate {newCommSeats || 30} portfolios in the next step.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setGuideUploaded(true)}
                  className="w-full border border-neutral-300 hover:bg-neutral-100 rounded-xl p-2.5 text-xs sm:text-sm font-heading font-bold text-center transition-colors cursor-pointer"
                >
                  {guideUploaded ? "Background guide uploaded ✓" : "Upload background guide (optional)"}
                </button>
              </div>

              <div className="pt-2">
                {editingCommId ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveCommitteeEdit} className="flex-1 py-2 sm:py-2.5 text-sm rounded-xl">
                      Save committee
                    </Button>
                    <button
                      type="button"
                      onClick={handleCancelCommitteeEdit}
                      className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-heading font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <Button onClick={handleAddCommittee} className="w-full py-2 sm:py-2.5 text-sm rounded-xl">
                    Add committee
                  </Button>
                )}
              </div>

              <div className="pt-2">
                <Button onClick={handleContinueToCountries} className="w-full py-2.5 text-sm sm:text-base rounded-xl">
                  Continue to countries →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COUNTRIES PER COMMITTEE */}
      {currentStep === "countries" && (
        <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-3xl space-y-3 sm:space-y-4 shadow-sm">
          <div>
            <h2 className="text-lg sm:text-2xl font-heading font-extrabold">Countries &amp; Portfolios</h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
              Select committee below to manage its portfolio roster.
            </p>
          </div>

          {/* Committee selector tabs */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
            {committees.map((comm) => (
              <button
                key={comm.id}
                type="button"
                onClick={() => {
                  setCountryFilterComm(comm.id);
                  setSelectedPortIds([]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                  countryFilterComm === comm.id
                    ? "bg-[#1560BD] text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {comm.name}
              </button>
            ))}
          </div>

          {/* Portfolio count & fast auto-fill sync header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-heading font-extrabold text-neutral-800">
                Portfolios ({activePortfolios.length} / {activeComm?.totalSeats || activePortfolios.length} seats)
              </span>
              {activeComm && activePortfolios.length !== activeComm.totalSeats && (
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {activePortfolios.length < activeComm.totalSeats ? "Under capacity" : "Over capacity"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-100 rounded-xl px-2 py-1">
                <span className="text-xs font-bold text-neutral-500">Seats:</span>
                <input
                  type="number"
                  min={3}
                  max={150}
                  value={quickSeatsInput}
                  onChange={(e) => setQuickSeatsInput(e.target.value)}
                  className="w-12 bg-white rounded-lg px-1 py-0.5 text-xs font-extrabold text-center outline-none border border-neutral-200"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const target = Number(quickSeatsInput);
                  if (!isNaN(target) && target >= 3 && target <= 150) {
                    syncCommitteePortfolios(countryFilterComm, target);
                  }
                }}
                className="bg-[#1560BD] hover:bg-[#0F4C96] text-white px-2.5 py-1.5 rounded-xl text-xs font-heading font-extrabold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                title={`Generate/synchronize portfolios to match ${quickSeatsInput} seats`}
              >
                ⚡ Auto-Fill to {quickSeatsInput || 30}
              </button>

              {selectedPortIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedPortIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Country Pills list with hover circle delete and checkbox */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-56 sm:max-h-72 overflow-y-auto p-1">
            {activePortfolios.length === 0 ? (
              <div className="py-4 text-neutral-400 font-medium text-xs sm:text-sm text-center w-full">
                No portfolios added for this committee yet.
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

          {/* Combobox to Add Countries & Indian Politicians */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
              Add country or portfolio (Type &amp; Press Enter)
            </label>
            <PortfolioCombobox
              existingNames={activePortfolios.map((p) => p.countryName)}
              onAdd={(item) => addPortfolioToCommittee(countryFilterComm, item)}
              placeholder="Search or enter country name (e.g. India, France)..."
            />
          </div>

          <div className="pt-2">
            <Button onClick={handleContinueToRules} className="w-full sm:w-auto py-2.5 px-6 text-sm sm:text-base rounded-xl font-bold">
              Continue to rules →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: RULES (Pages 15 & 27) */}
      {currentStep === "rules" && (
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
            <h2 className="text-lg sm:text-2xl font-heading font-extrabold text-[#0B1B33]">
              Conference Rules &amp; Allotment
            </h2>

            <div className="space-y-2.5 sm:space-y-3 pt-1">
              <Toggle
                label="Allow school teams"
                description="Schools can register all their delegates at once"
                checked={event.rules.allowSchoolTeams}
                onChange={(c) => updateEventRules({ allowSchoolTeams: c })}
              />

              <Toggle
                label="Ask for payment proof"
                description="Delegates must upload receipt before verification"
                checked={event.rules.askPaymentProof}
                onChange={(c) => updateEventRules({ askPaymentProof: c })}
              />

              <Toggle
                label="Show taken portfolios live"
                description="Delegates see what is taken while choosing preferences"
                checked={event.rules.showTakenPortfoliosLive}
                onChange={(c) => updateEventRules({ showTakenPortfoliosLive: c })}
              />

              <Toggle
                label="First come, first served"
                description="Off means every preference is weighted together"
                checked={event.rules.firstComeFirstServed}
                onChange={(c) => updateEventRules({ firstComeFirstServed: c })}
              />
            </div>
          </div>

          <div>
            {isBasicsDone && isCommitteesDone && isCountriesDone ? (
              <Button onClick={handleContinueToPublish} className="w-full sm:w-auto py-2.5 px-6 text-sm sm:text-base rounded-xl font-bold">
                Review &amp; Publish →
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="bg-[#FFD23F] text-[#0B1B33] p-3 rounded-xl font-bold text-xs sm:text-sm">
                  ⚠️ Complete earlier steps first:{" "}
                  {!isBasicsDone
                    ? "Conference Basics are incomplete."
                    : !isCommitteesDone
                    ? "Add at least one committee."
                    : "Each committee needs at least 3 portfolios."}
                </div>
                <Button
                  onClick={() => {
                    setValidationError(null);
                    if (!isBasicsDone) setCurrentStep("basics");
                    else if (!isCommitteesDone) setCurrentStep("committees");
                    else setCurrentStep("countries");
                  }}
                  className="w-full sm:w-auto py-2.5 px-6 text-sm sm:text-base rounded-xl font-bold"
                >
                  {!isBasicsDone
                    ? "Go to Basics"
                    : !isCommitteesDone
                    ? "Go to Committees"
                    : "Go to Countries"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: PUBLISH (Pages 16 & 28) */}
      {currentStep === "publish" && (
        <div className="space-y-3 sm:space-y-4">
          {event.status !== "published" ? (
            <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 border-2 border-yellow-400 shadow-sm max-w-2xl">
              <div className="flex items-center gap-1.5 text-yellow-800">
                <Lock className="w-4 h-4 text-yellow-600" />
                <span className="text-[11px] uppercase font-extrabold tracking-wider">Registration Links Locked</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-heading font-extrabold text-[#0B1B33]">
                Ready to Open Registrations
              </h3>
              <p className="text-neutral-600 font-medium text-xs sm:text-sm leading-relaxed">
                This conference is currently in <strong>Draft</strong>. Once published, your unique shareable registration links will be unlocked.
              </p>
              <div className="pt-1">
                <Button
                  variant="primary"
                  onClick={handleOpenRegistrations}
                  className="w-full sm:w-auto py-2.5 sm:py-3 px-6 text-sm sm:text-base font-heading font-extrabold rounded-xl"
                >
                  Publish Conference &amp; Open Registrations
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-start">
              {/* Left Card: Distinct links */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {/* Individual Delegate */}
                <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Individual Delegate Link
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      ₹{event.fee || 1500}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-700 break-all p-2.5 bg-neutral-100 rounded-xl">
                    {individualLink}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(individualLink, "individual")}
                      className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-[#0B1B33] rounded-xl py-2 px-3 text-center text-xs sm:text-sm font-heading font-extrabold transition-colors cursor-pointer"
                    >
                      {copiedType === "individual" ? "✓ Copied!" : "Copy link"}
                    </button>
                    <Button
                      variant="primary"
                      onClick={() => handleShareWhatsApp(individualLink, "Individual Registration")}
                      className="py-2 text-xs sm:text-sm rounded-xl font-bold"
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>

                {/* School Team */}
                <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      School Delegation Link
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ₹{event.schoolFeePerStudent || 1200}/student
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-700 break-all p-2.5 bg-neutral-100 rounded-xl">
                    {teamLink}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(teamLink, "team")}
                      className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-[#0B1B33] rounded-xl py-2 px-3 text-center text-xs sm:text-sm font-heading font-extrabold transition-colors cursor-pointer"
                    >
                      {copiedType === "team" ? "✓ Copied!" : "Copy link"}
                    </button>
                    <Button
                      variant="primary"
                      onClick={() => handleShareWhatsApp(teamLink, "School Delegation Registration")}
                      className="py-2 text-xs sm:text-sm rounded-xl font-bold"
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Card: What happens next (Page 28) */}
              <div className="lg:col-span-5 bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3 shadow-sm">
                <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33]">
                  What happens next
                </h3>

                <div className="space-y-2 text-xs sm:text-sm font-medium text-neutral-700">
                  <div className="flex gap-2">
                    <span className="font-heading font-extrabold text-[#0B1B33]">1.</span>
                    <span>Delegates register and rank committee preferences</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-heading font-extrabold text-[#0B1B33]">2.</span>
                    <span>Organizer verifies payments on the Registrations tab</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-heading font-extrabold text-[#0B1B33]">3.</span>
                    <span>Auto or manual allot and publish allotments</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => router.push("/organizer/conferences")}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/40 hover:bg-white/10 text-white font-heading font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
            >
              ← My Conferences
            </button>
            {event.status === "published" && (
              <Button
                variant="primary"
                onClick={() => router.push("/organizer")}
                className="w-full sm:w-auto py-2.5 px-6 text-xs sm:text-sm rounded-xl font-bold"
              >
                Open Dashboard →
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
