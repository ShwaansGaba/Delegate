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
  { name: "UNHRC", agenda: "Protection of vulnerable populations in active war zones", totalSeats: 30 },
  { name: "UNEP", agenda: "Transboundary river basin conservation and climate treaties", totalSeats: 25 },
  { name: "UNGA", agenda: "Equitable development of sovereign AI and technology infrastructure", totalSeats: 40 },
  { name: "WHO", agenda: "Global pandemic preparedness and healthcare distribution equity", totalSeats: 25 },
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

  // On conference load / switch, ALWAYS ensure the user is routed to the first incomplete step
  React.useEffect(() => {
    if (typeof window !== "undefined" && event.id) {
      const firstIncomplete = computeFirstIncompleteStep(
        name,
        dateFrom,
        dateTo,
        deadlineDate,
        venue,
        committees,
        portfolios,
        event.status === "published"
      );

      const savedStep = localStorage.getItem(`delegate_setup_step_${event.id}`);
      const stepOrder: SetupStep[] = ["basics", "committees", "countries", "rules", "publish"];
      const incompleteIdx = stepOrder.indexOf(firstIncomplete);
      const savedIdx = savedStep ? stepOrder.indexOf(savedStep as SetupStep) : -1;

      // If saved step is ahead of the first incomplete step or missing, clamp to first incomplete step!
      if (savedIdx === -1 || savedIdx > incompleteIdx) {
        setCurrentStep(firstIncomplete);
      } else {
        setCurrentStep(savedStep as SetupStep);
      }
    }
  }, [event.id, committees.length, portfolios.length]);

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
    if (isNaN(seats) || seats <= 0) {
      setValidationError("Seats must be a positive number.");
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
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
          Set up your conference
        </h1>
      </div>

      {validationError && (
        <div className="bg-[#FFD23F] text-[#0B1B33] p-4 rounded-2xl font-bold text-base flex items-center justify-between shadow-lg">
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

      {/* Stepper Navigation Pills matching Page 26-28 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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
            className={`px-6 py-3 rounded-2xl text-xl font-heading font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
              currentStep === st.id
                ? "bg-white text-[#0B1B33]"
                : "border-2 border-white text-white hover:bg-white/10"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* STEP 1: BASICS */}
      {currentStep === "basics" && (
        <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 max-w-2xl space-y-5">
          <h2 className="text-3xl font-heading font-extrabold">Conference Basics</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-bold text-neutral-700 mb-1">Conference name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
              />
            </div>

            {/* Date From and Date To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-bold text-neutral-700 mb-1">Date from</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-neutral-700 mb-1">Date to</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-neutral-700 mb-1">Registration deadline</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-bold text-neutral-700 mb-1">Individual fee (Rs)</label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-neutral-700 mb-1">School fee / student (Rs)</label>
                <input
                  type="number"
                  value={schoolFee}
                  onChange={(e) => setSchoolFee(e.target.value)}
                  className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-neutral-700 mb-1">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Committees list */}
          <div className="lg:col-span-7 bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-5">
            <h2 className="text-3xl font-heading font-extrabold">Committees</h2>

            <div className="space-y-4">
              {committees.map((comm) => (
                <div
                  key={comm.id}
                  className="border border-neutral-200 rounded-2xl p-5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                      {comm.name}
                    </div>
                    <div className="text-lg text-neutral-600 font-medium mt-0.5">
                      {comm.totalSeats} seats, {portfolios.filter(p => p.committeeId === comm.id).length} portfolios
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
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
                      className="text-lg font-heading font-extrabold text-[#1560BD] hover:underline cursor-pointer"
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
                      className="text-lg font-heading font-extrabold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
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
                className="text-xl font-heading font-extrabold text-[#1560BD] underline hover:text-[#0F4C96] cursor-pointer"
              >
                Start from a template
              </button>
            </div>
          </div>

          {/* Right Column: Add or Edit a committee form */}
          <div className="lg:col-span-5 bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-heading font-extrabold">
                {editingCommId ? "Edit committee" : "Add a committee"}
              </h2>
              {editingCommId && (
                <button
                  type="button"
                  onClick={handleCancelCommitteeEdit}
                  className="text-sm font-heading font-bold text-[#1560BD] hover:underline cursor-pointer"
                >
                  + Add new
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-neutral-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="UNGA"
                  className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-neutral-700 mb-1">Agenda</label>
                <input
                  type="text"
                  value={newCommAgenda}
                  onChange={(e) => setNewCommAgenda(e.target.value)}
                  placeholder="Agenda title"
                  className="w-full bg-neutral-100 rounded-2xl p-4 text-xl font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-neutral-700 mb-1">Seats</label>
                <input
                  type="number"
                  value={newCommSeats}
                  onChange={(e) => setNewCommSeats(e.target.value)}
                  placeholder="40"
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
                {editingCommId ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSaveCommitteeEdit} className="flex-1">
                      Save committee
                    </Button>
                    <button
                      type="button"
                      onClick={handleCancelCommitteeEdit}
                      className="px-5 py-3 rounded-2xl border-2 border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-heading font-bold text-base transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <Button onClick={handleAddCommittee}>Add committee</Button>
                )}
              </div>

              <div className="pt-4">
                <Button onClick={handleContinueToCountries}>
                  Continue to countries
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COUNTRIES PER COMMITTEE */}
      {currentStep === "countries" && (
        <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 max-w-3xl space-y-6">
          <div>
            <h2 className="text-3xl font-heading font-extrabold">Countries & Portfolios</h2>
            <p className="text-lg text-neutral-600 font-medium mt-1">
              Hover over monogram circle to delete, or select checkboxes to delete in bulk.
            </p>
          </div>

          {/* Committee selector tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {committees.map((comm) => (
              <button
                key={comm.id}
                type="button"
                onClick={() => {
                  setCountryFilterComm(comm.id);
                  setSelectedPortIds([]);
                }}
                className={`px-4 py-2 rounded-xl text-lg font-heading font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                  countryFilterComm === comm.id
                    ? "bg-[#1560BD] text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {comm.name}
              </button>
            ))}
          </div>

          {/* Bulk delete action header */}
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

          {/* Country Pills list with hover circle delete and checkbox */}
          <div className="flex flex-wrap gap-2.5 max-h-72 overflow-y-auto p-1">
            {activePortfolios.length === 0 ? (
              <div className="py-6 text-neutral-400 font-medium text-center w-full">
                No portfolios added for this committee.
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
            <label className="block text-base font-heading font-extrabold text-neutral-800 mb-2">
              Add countries or politicians (Combobox)
            </label>
            <PortfolioCombobox
              existingNames={activePortfolios.map((p) => p.countryName)}
              onAdd={(item) => addPortfolioToCommittee(countryFilterComm, item)}
              placeholder="Search country or Indian politician (e.g. India, Amit Shah)..."
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleContinueToRules}>Continue to rules</Button>
          </div>
        </div>
      )}

      {/* STEP 4: RULES (Pages 15 & 27) */}
      {currentStep === "rules" && (
        <div className="max-w-3xl space-y-6">
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-3xl font-heading font-extrabold text-[#0B1B33]">
                How should registration work?
              </h2>

              <div className="space-y-3 pt-2">
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
                  label="Show taken portfolios live"
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

              <p className="text-base text-neutral-600 font-medium pt-2">
                Turn off first come, first served and every preference is weighed together.
              </p>
            </div>
          </div>

          <div>
            {isBasicsDone && isCommitteesDone && isCountriesDone ? (
              <Button onClick={handleContinueToPublish}>
                Review &amp; Publish →
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

      {/* STEP 5: PUBLISH (Pages 16 & 28) */}
      {currentStep === "publish" && (
        <div className="space-y-6">
          {event.status !== "published" ? (
            <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-5 border-2 border-yellow-400">
              <div className="flex items-center gap-2 text-yellow-800">
                <Lock className="w-5 h-5 text-yellow-600" />
                <span className="text-xs uppercase font-extrabold tracking-wider">Registration Links Locked</span>
              </div>
              <h3 className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                Setup In Progress
              </h3>
              <p className="text-neutral-600 font-medium text-base leading-relaxed max-w-xl">
                This conference is currently in <strong>Draft</strong>. Delegate registration links are locked until you officially publish the conference.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleOpenRegistrations}
                  className="font-heading font-extrabold"
                >
                  Publish Conference &amp; Open Registrations
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Card: Distinct links */}
              <div className="lg:col-span-7 space-y-4">
                {/* Individual Delegate */}
                <div className="bg-white text-[#0B1B33] rounded-3xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Individual Delegate Link
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      ₹{event.fee || 2500}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-neutral-700 break-all p-3 bg-neutral-100 rounded-xl">
                    {individualLink}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(individualLink, "individual")}
                      className="w-full bg-white border-2 border-neutral-200 hover:bg-neutral-50 text-[#0B1B33] rounded-xl p-3 text-center text-sm font-heading font-extrabold transition-colors cursor-pointer"
                    >
                      {copiedType === "individual" ? "✓ Copied!" : "Copy link"}
                    </button>
                    <Button
                      variant="primary"
                      onClick={() => handleShareWhatsApp(individualLink, "Individual Registration")}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>

                {/* School Team */}
                <div className="bg-white text-[#0B1B33] rounded-3xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      School Delegation Team Link
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ₹{event.schoolFeePerStudent || 1200}/student
                    </span>
                  </div>
                  <div className="text-sm font-mono text-neutral-700 break-all p-3 bg-neutral-100 rounded-xl">
                    {teamLink}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(teamLink, "team")}
                      className="w-full bg-white border-2 border-neutral-200 hover:bg-neutral-50 text-[#0B1B33] rounded-xl p-3 text-center text-sm font-heading font-extrabold transition-colors cursor-pointer"
                    >
                      {copiedType === "team" ? "✓ Copied!" : "Copy link"}
                    </button>
                    <Button
                      variant="primary"
                      onClick={() => handleShareWhatsApp(teamLink, "School Delegation Registration")}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Card: What happens next (Page 28) */}
              <div className="lg:col-span-5 bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                  What happens next
                </h3>

                <div className="space-y-4 text-xl font-medium text-neutral-800">
                  <div className="flex gap-3">
                    <span className="font-heading font-extrabold text-[#0B1B33]">1.</span>
                    <span>Delegates register and pick preferences</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-heading font-extrabold text-[#0B1B33]">2.</span>
                    <span>You verify payments</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-heading font-extrabold text-[#0B1B33]">3.</span>
                    <span>You allot and publish</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => router.push("/organizer/conferences")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-neutral-200 hover:bg-neutral-50 text-[#0B1B33] font-heading font-extrabold text-base transition-colors cursor-pointer text-center"
            >
              ← Return to My Conferences
            </button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/organizer")}
              className="w-full sm:w-auto px-8"
            >
              Open Dashboard →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
