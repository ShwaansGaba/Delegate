"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { PortfolioCombobox } from "@/components/ui/PortfolioCombobox";
import { CountryPill } from "@/components/ui/CountryPill";
import {
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Globe,
  Landmark,
  Plus,
  X,
  Layers,
} from "lucide-react";
import {
  getConferenceRegistrationLink,
  getConferenceBrowseLink,
} from "@/lib/registrationLinks";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type SetupStep = "basics" | "committees" | "portfolios" | "rules" | "publish";

const COMMITTEE_TEMPLATES = [
  { name: "UNSC", agenda: "Addressing maritime security and sovereignty conflicts" },
  { name: "DISEC", agenda: "Non-proliferation of tactical and cyber ballistic armaments" },
  { name: "UNHRC", agenda: "Protection of vulnerable populations in active war zones" },
  { name: "UNEP", agenda: "Transboundary river basin conservation and climate treaties" },
  { name: "UNGA", agenda: "Equitable development of sovereign AI and technology infrastructure" },
  { name: "WHO", agenda: "Global pandemic preparedness and healthcare distribution equity" },
  { name: "AIPPM", agenda: "Review of national electoral reforms and cooperative federalism" },
  { name: "Lok Sabha", agenda: "National security framework and border infrastructure review" },
  { name: "G20", agenda: "Sustainable global debt architecture and multilateral financing" },
];

const STEP_ORDER: SetupStep[] = ["basics", "committees", "portfolios", "rules", "publish"];

const STEP_LABELS: Record<SetupStep, { title: string; subtitle: string }> = {
  basics: {
    title: "Conference Basics",
    subtitle: "Provide core dates, venue, and registration pricing for your MUN.",
  },
  committees: {
    title: "Committees",
    subtitle: "Set up the committees and agendas for your conference.",
  },
  portfolios: {
    title: "Portfolios",
    subtitle: "Configure portfolios and seat allocations for each committee.",
  },
  rules: {
    title: "Rules & Allotment",
    subtitle: "Configure admission, payment receipts, and delegate preferences.",
  },
  publish: {
    title: "Review & Publish",
    subtitle: "Unlock your unique registration links and launch registrations.",
  },
};

export default function OrganizerSetupPage() {
  const router = useRouter();
  const {
    user,
    isAuthLoaded,
    isLoaded,
    event,
    committees,
    portfolios,
    updateEventRules,
    updateEventBasics,
    addCommittee,
    editCommittee,
    syncCommitteePortfolios,
    autoPopulatePortfolios,
    removeCommittee,
    deletePortfolio,
    deleteMultiplePortfolios,
    addPortfolioToCommittee,
    markConferencePublished,
  } = useApp();

  // Guard against unauthenticated render or pending data load
  if (!isAuthLoaded || !isLoaded || !user) {
    return null;
  }

  // Step state - defaults to basics
  const [currentStep, setCurrentStep] = useState<SetupStep>("basics");

  // On conference load / switch, route cleanly to requested or first incomplete step
  useEffect(() => {
    if (typeof window !== "undefined" && event.id) {
      const sp = new URLSearchParams(window.location.search);
      const urlStep = sp.get("step") as string | null;

      if (urlStep === "countries") {
        setCurrentStep("portfolios");
        return;
      }

      if (urlStep && (STEP_ORDER as string[]).includes(urlStep)) {
        setCurrentStep(urlStep as SetupStep);
        return;
      }

      const savedStep = localStorage.getItem(`delegate_setup_step_${event.id}`) as SetupStep | null;
      if (savedStep && STEP_ORDER.includes(savedStep)) {
        setCurrentStep(savedStep === ("countries" as unknown as SetupStep) ? "portfolios" : savedStep);
      }
    }
  }, [event.id]);

  useEffect(() => {
    if (typeof window !== "undefined" && event.id) {
      localStorage.setItem(`delegate_setup_step_${event.id}`, currentStep);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, event.id]);

  // Basics state with date inputs and separate fees
  const [name, setName] = useState(event.name || "");
  const [dateFrom, setDateFrom] = useState(event.dateFrom || "");
  const [dateTo, setDateTo] = useState(event.dateTo || "");
  const [deadlineDate, setDeadlineDate] = useState(event.deadlineDate || "");
  const [venue, setVenue] = useState(event.venue || "");
  const [fee, setFee] = useState(event.fee ? event.fee.toString() : "1500");
  const [schoolFee, setSchoolFee] = useState(
    event.schoolFeePerStudent ? event.schoolFeePerStudent.toString() : "1200"
  );

  const syncedEventIdRef = React.useRef<string | null>(null);

  useEffect(() => {
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
  }, [event]);

  // Committee form state (NO seats input per user request)
  const [editingCommId, setEditingCommId] = useState<string | null>(null);
  const [newCommName, setNewCommName] = useState("");
  const [newCommAgenda, setNewCommAgenda] = useState("");
  const [guideUploaded, setGuideUploaded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Portfolios step state
  const [activeCommId, setActiveCommId] = useState(committees[0]?.id || "");
  const [selectedPortIds, setSelectedPortIds] = useState<string[]>([]);

  // Auto-Add Portfolios Modal State
  const [showAutoAddModal, setShowAutoAddModal] = useState(false);
  const [autoAddCount, setAutoAddCount] = useState("30");
  const [autoAddType, setAutoAddType] = useState<"countries" | "indian_politicians">("countries");
  const [autoAddMode, setAutoAddMode] = useState<"append" | "replace">("append");
  const [autoAddSuccessToast, setAutoAddSuccessToast] = useState<string | null>(null);

  // Keep active committee in sync with committees list
  useEffect(() => {
    if (committees.length > 0 && !committees.some((c) => c.id === activeCommId)) {
      setActiveCommId(committees[0].id);
    }
  }, [committees, activeCommId]);

  const activeComm = committees.find((c) => c.id === activeCommId);
  const activePortfolios = useMemo(() => {
    return portfolios
      .filter((p) => p.committeeId === activeCommId)
      .sort((a, b) => a.countryName.localeCompare(b.countryName, undefined, { sensitivity: "base" }));
  }, [portfolios, activeCommId]);

  // Requirements checks
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

  const isCommitteesDone = committees.length >= 3;

  const isPortfoliosDone =
    committees.length > 0 &&
    committees.every((c) => portfolios.filter((p) => p.committeeId === c.id).length >= 3);

  const isRulesDone = Boolean(
    event.status === "published" ||
    (typeof window !== "undefined" && Boolean(localStorage.getItem(`delegate_rules_done_${event.id}`)))
  );

  const isConferenceCreated = Boolean(
    event.id &&
    event.id !== "new-conference" &&
    event.name &&
    event.name.trim().toLowerCase() !== "new mun conference" &&
    event.status === "published"
  );

  const handleStepSelect = (step: SetupStep) => {
    setValidationError(null);
    setCurrentStep(step);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("step", step);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Step 1: Save basics and move to committees
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

  // Step 2: Committee management without seat input
  const handleAddCommittee = () => {
    setValidationError(null);
    const cleanName = newCommName.trim().toUpperCase();
    if (!cleanName) {
      setValidationError("Please enter a committee name (e.g. UNSC, DISEC, Lok Sabha).");
      return;
    }
    if (committees.some((c) => c.name.toUpperCase() === cleanName)) {
      setValidationError(`Committee "${cleanName}" already exists. Please choose a unique name.`);
      return;
    }

    addCommittee({
      name: cleanName,
      agenda: newCommAgenda.trim() || "Addressing contemporary international affairs",
      totalSeats: 0,
      backgroundGuideUrl: guideUploaded ? "/guides/UNSC_Background_Guide.pdf" : undefined,
    });
    setNewCommName("");
    setNewCommAgenda("");
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
    if (committees.some((c) => c.id !== editingCommId && c.name.toUpperCase() === cleanName)) {
      setValidationError(`Committee "${cleanName}" already exists. Please choose a unique name.`);
      return;
    }

    editCommittee(editingCommId, {
      name: cleanName,
      agenda: newCommAgenda.trim(),
      backgroundGuideUrl: guideUploaded ? "/guides/UNSC_Background_Guide.pdf" : undefined,
    });
    handleCancelCommitteeEdit();
  };

  const handleCancelCommitteeEdit = () => {
    setEditingCommId(null);
    setNewCommName("");
    setNewCommAgenda("");
    setGuideUploaded(false);
    setValidationError(null);
  };

  const handleContinueToPortfolios = () => {
    setValidationError(null);
    if (committees.length < 3) {
      setValidationError(`A minimum of 3 committees is mandatory before proceeding to portfolios (currently added: ${committees.length}/3).`);
      return;
    }
    // Auto-save committees state
    if (typeof window !== "undefined" && event.id) {
      try {
        localStorage.setItem(`delegate_conf_data_${event.id}`, JSON.stringify({
          committees,
          portfolios,
          registrations: [],
        }));
      } catch {}
    }
    if (isSupabaseConfigured && supabase && event.id && committees.length > 0) {
      supabase.from("committees").upsert(
        committees.map((c) => ({
          id: c.id,
          event_id: event.id,
          name: c.name,
          agenda: c.agenda,
          total_seats: c.totalSeats,
          background_guide_url: c.backgroundGuideUrl || null,
        }))
      ).then();
    }
    setCurrentStep("portfolios");
  };

  // Step 3: Portfolio handlers
  const toggleSelectPort = (id: string) => {
    setSelectedPortIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedPortIds.length === 0) return;
    if (confirm(`Delete ${selectedPortIds.length} selected portfolios?`)) {
      deleteMultiplePortfolios(selectedPortIds);
      setSelectedPortIds([]);
    }
  };

  const handleExecuteAutoAdd = () => {
    if (!activeCommId) return;
    const count = Number(autoAddCount);
    if (isNaN(count) || count < 3 || count > 150) {
      alert("Please choose between 3 and 150 portfolios.");
      return;
    }

    autoPopulatePortfolios(activeCommId, autoAddType, count, autoAddMode);
    setShowAutoAddModal(false);

    const typeLabel = autoAddType === "countries" ? "Country" : "Indian Politician";
    setAutoAddSuccessToast(`✓ Successfully populated ${count} ${typeLabel} portfolios to ${activeComm?.name || "committee"}!`);
    setTimeout(() => setAutoAddSuccessToast(null), 3500);
  };

  const handleContinueToRules = () => {
    setValidationError(null);
    if (committees.length < 3) {
      setValidationError(`A minimum of 3 committees is mandatory before configuring rules (currently added: ${committees.length}/3).`);
      setCurrentStep("committees");
      return;
    }
    const commWithFew = committees.find(
      (c) => portfolios.filter((p) => p.committeeId === c.id).length < 3
    );
    if (commWithFew) {
      setValidationError(
        `Committee "${commWithFew.name}" has fewer than 3 portfolios. Please add at least 3 portfolios so delegates can select preferences.`
      );
      setActiveCommId(commWithFew.id);
      return;
    }

    // Auto-save portfolios & committees state
    if (typeof window !== "undefined" && event.id) {
      try {
        localStorage.setItem(`delegate_conf_data_${event.id}`, JSON.stringify({
          committees,
          portfolios,
          registrations: [],
        }));
      } catch {}
    }
    if (isSupabaseConfigured && supabase && event.id) {
      if (committees.length > 0) {
        supabase.from("committees").upsert(
          committees.map((c) => ({
            id: c.id,
            event_id: event.id,
            name: c.name,
            agenda: c.agenda,
            total_seats: c.totalSeats,
            background_guide_url: c.backgroundGuideUrl || null,
          }))
        ).then();
      }
      if (portfolios.length > 0) {
        for (let i = 0; i < portfolios.length; i += 50) {
          const chunk = portfolios.slice(i, i + 50);
          supabase.from("portfolios").upsert(
            chunk.map((p) => ({
              id: p.id,
              committee_id: p.committeeId,
              country_name: p.countryName,
              country_code: p.code,
              status: p.status,
            }))
          ).then();
        }
      }
    }
    setCurrentStep("rules");
  };

  // Step 4: Rules handler
  const handleContinueToPublish = () => {
    setValidationError(null);
    if (!isBasicsDone) {
      setValidationError("Please complete Conference Basics first.");
      setCurrentStep("basics");
      return;
    }
    if (!isCommitteesDone || committees.length < 3) {
      setValidationError(`A minimum of 3 committees is required to complete conference setup (currently added: ${committees.length}/3).`);
      setCurrentStep("committees");
      return;
    }
    if (!isPortfoliosDone) {
      const commWithFew = committees.find(
        (c) => portfolios.filter((p) => p.committeeId === c.id).length < 3
      );
      setValidationError(
        `Committee "${commWithFew?.name || "One of your committees"}" needs at least 3 portfolios.`
      );
      if (commWithFew) setActiveCommId(commWithFew.id);
      setCurrentStep("portfolios");
      return;
    }
    try {
      localStorage.setItem(`delegate_rules_done_${event.id}`, "true");
    } catch {}

    // Auto-save state
    if (typeof window !== "undefined" && event.id) {
      try {
        localStorage.setItem(`delegate_conf_data_${event.id}`, JSON.stringify({
          committees,
          portfolios,
          registrations: [],
        }));
      } catch {}
    }
    if (isSupabaseConfigured && supabase && event.id) {
      if (committees.length > 0) {
        supabase.from("committees").upsert(
          committees.map((c) => ({
            id: c.id,
            event_id: event.id,
            name: c.name,
            agenda: c.agenda,
            total_seats: c.totalSeats,
            background_guide_url: c.backgroundGuideUrl || null,
          }))
        ).then();
      }
      if (portfolios.length > 0) {
        for (let i = 0; i < portfolios.length; i += 50) {
          const chunk = portfolios.slice(i, i + 50);
          supabase.from("portfolios").upsert(
            chunk.map((p) => ({
              id: p.id,
              committee_id: p.committeeId,
              country_name: p.countryName,
              country_code: p.code,
              status: p.status,
            }))
          ).then();
        }
      }
    }

    setCurrentStep("publish");
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const handleOpenRegistrations = async () => {
    setIsPublishing(true);
    await markConferencePublished();
    setIsPublishing(false);
  };

  const individualLink = getConferenceRegistrationLink(event.id, "individual");
  const teamLink = getConferenceRegistrationLink(event.id, "team");

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

  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Navigation Buttons for created conference */}
      {isConferenceCreated ? (
        <div className="space-y-4 border-b border-white/10 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
                Conference
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mt-0.5">
                Manage basics, committees, portfolios, rules, and registration links for {event.name}.
              </p>
            </div>
            {event.status === "published" && (
              <span className="self-start sm:self-auto px-3.5 py-1 rounded-full text-xs font-heading font-extrabold bg-emerald-400/20 text-emerald-200 border border-emerald-400/40">
                Published & Active
              </span>
            )}
          </div>

          {/* Section Navigation Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            {[
              { id: "basics" as SetupStep, label: "Basics" },
              { id: "committees" as SetupStep, label: "Committees" },
              { id: "portfolios" as SetupStep, label: "Portfolios" },
              { id: "rules" as SetupStep, label: "Rules & Allotment" },
              { id: "publish" as SetupStep, label: "Registration Links" },
            ].map((tab) => {
              const isActive = currentStep === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStepSelect(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white text-[#0B1B33] shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Sequential Progress Bar for new draft conference */
        <div className="space-y-2 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-blue-100">
            <span className="uppercase tracking-wider font-extrabold text-[#FFD23F] flex items-center gap-1.5">
              <span>Step {currentStepIndex + 1} of 5:</span>
              <span>{STEP_LABELS[currentStep].title}</span>
            </span>
            <span className="text-white/80 font-medium hidden sm:inline">
              {STEP_LABELS[currentStep].subtitle}
            </span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#FFD23F] h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-[#FFD23F] text-[#0B1B33] p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between shadow-md animate-fadeIn">
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

      {/* ========================================================
          STEP 1: BASICS
      ======================================================== */}
      {currentStep === "basics" && (
        <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0B1B33]">
              Conference Basics
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
              Enter the conference name, dates, venue, and delegate fees.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                Conference name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Delegato Model UN 2026"
                className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                  Start date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                  End date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                Registration deadline
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                  Individual delegate fee (Rs)
                </label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                  School fee per student (Rs)
                </label>
                <input
                  type="number"
                  value={schoolFee}
                  onChange={(e) => setSchoolFee(e.target.value)}
                  className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Main Auditorium / Campus Campus"
                className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end">
            <Button
              onClick={handleSaveBasics}
              className="w-full sm:w-auto py-3 px-8 text-sm sm:text-base rounded-xl font-heading font-extrabold"
            >
              Save &amp; Continue to Committees →
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: COMMITTEES (No seats input per user request)
      ======================================================== */}
      {currentStep === "committees" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Left: Committees Roster List */}
            <div className="lg:col-span-7 bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold">
                    Committees ({committees.length})
                  </h2>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    Portfolios and seats will be configured in the next step.
                  </p>
                </div>
              </div>

              {committees.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 font-medium text-sm border-2 border-dashed border-neutral-200 rounded-2xl">
                  No committees added yet. Add one on the right or use a template below!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {committees.map((comm) => (
                    <div
                      key={comm.id}
                      className="border border-neutral-200 rounded-xl p-3 sm:p-4 flex items-center justify-between hover:border-neutral-300 transition-colors"
                    >
                      <div className="truncate mr-2">
                        <div className="text-base sm:text-lg font-heading font-extrabold text-[#0B1B33] truncate">
                          {comm.name}
                        </div>
                        <div className="text-xs text-neutral-600 font-medium truncate mt-0.5">
                          {comm.agenda || "No agenda set"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommId(comm.id);
                            setNewCommName(comm.name);
                            setNewCommAgenda(comm.agenda || "");
                            setGuideUploaded(Boolean(comm.backgroundGuideUrl));
                            setValidationError(null);
                          }}
                          className="text-sm font-heading font-extrabold text-[#1560BD] hover:underline cursor-pointer"
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
                          className="text-sm font-heading font-extrabold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Template quick-adds */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Add From MUN Templates
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMITTEE_TEMPLATES.map((tpl) => {
                    const alreadyExists = committees.some(
                      (c) => c.name.toUpperCase() === tpl.name.toUpperCase()
                    );
                    return (
                      <button
                        key={tpl.name}
                        type="button"
                        disabled={alreadyExists}
                        onClick={() => {
                          addCommittee({
                            name: tpl.name,
                            agenda: tpl.agenda,
                            totalSeats: 0,
                            backgroundGuideUrl: `/guides/${tpl.name}_Background_Guide.pdf`,
                          });
                        }}
                        className={`text-xs font-heading font-extrabold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          alreadyExists
                            ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                            : "bg-blue-50 text-[#1560BD] border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        + {tpl.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Add / Edit Committee Form (WITHOUT SEATS INPUT) */}
            <div className="lg:col-span-5 bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-heading font-extrabold">
                  {editingCommId ? "Edit Committee" : "Add a Committee"}
                </h3>
                {editingCommId && (
                  <button
                    type="button"
                    onClick={handleCancelCommitteeEdit}
                    className="text-xs font-heading font-bold text-[#1560BD] hover:underline cursor-pointer"
                  >
                    + Add New Instead
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                    Committee Name
                  </label>
                  <input
                    type="text"
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    placeholder="e.g. UNSC, DISEC, Lok Sabha"
                    className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD]"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1">
                    Agenda / Topic
                  </label>
                  <textarea
                    rows={2}
                    value={newCommAgenda}
                    onChange={(e) => setNewCommAgenda(e.target.value)}
                    placeholder="e.g. Non-proliferation and regional defense alliances"
                    className="w-full bg-neutral-100 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-semibold outline-none focus:ring-2 focus:ring-[#1560BD] resize-none"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setGuideUploaded(!guideUploaded)}
                    className="w-full border border-neutral-300 hover:bg-neutral-100 rounded-xl p-2.5 text-xs sm:text-sm font-heading font-bold text-center transition-colors cursor-pointer"
                  >
                    {guideUploaded ? "Background Guide Attached ✓" : "Attach Background Guide (Optional)"}
                  </button>
                </div>

                <div className="pt-2">
                  {editingCommId ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveCommitteeEdit}
                        className="flex-1 py-2.5 text-sm rounded-xl font-bold"
                      >
                        Save Changes
                      </Button>
                      <button
                        type="button"
                        onClick={handleCancelCommitteeEdit}
                        className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-heading font-bold text-xs sm:text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleAddCommittee}
                      className="w-full py-2.5 text-sm sm:text-base rounded-xl font-bold"
                    >
                      + Add Committee
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sequential Step Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep("basics")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/30 hover:bg-white/10 text-white font-heading font-bold text-xs sm:text-sm transition-colors cursor-pointer w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Basics</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {committees.length < 3 && (
                <span className="text-xs font-bold text-amber-300">
                  {committees.length}/3 committees added ({3 - committees.length} more required)
                </span>
              )}
              <Button
                onClick={handleContinueToPortfolios}
                disabled={committees.length < 3}
                className="py-2.5 px-6 text-xs sm:text-sm rounded-xl font-heading font-extrabold disabled:opacity-50"
              >
                Continue to Portfolios →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: PORTFOLIOS (Manual via Combobox + Auto-Add Dialog)
      ======================================================== */}
      {currentStep === "portfolios" && (
        <div className="space-y-4">
          <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 shadow-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold">
                Committee Portfolios &amp; Seats
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                Select a committee to add portfolios manually or auto-populate seats in bulk.
              </p>
            </div>

            {/* Committee selector pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-neutral-100 pb-3">
              {committees.map((comm) => {
                const count = portfolios.filter((p) => p.committeeId === comm.id).length;
                const isSelected = activeCommId === comm.id;
                return (
                  <button
                    key={comm.id}
                    type="button"
                    onClick={() => {
                      setActiveCommId(comm.id);
                      setSelectedPortIds([]);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#1560BD] text-white shadow-md ring-2 ring-[#1560BD]/20"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    <span>{comm.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {count} seats
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Committee Roster Action Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/60 p-3.5 sm:p-4 rounded-2xl border border-blue-100">
              <div>
                <div className="text-base sm:text-lg font-heading font-extrabold text-[#0B1B33]">
                  {activeComm?.name || "Selected Committee"} Roster
                </div>
                <div className="text-xs text-neutral-600 font-medium">
                  Currently configured: <strong>{activePortfolios.length} portfolios (seats)</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* AUTO-ADD PORTFOLIOS BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowAutoAddModal(true)}
                  className="bg-[#FFD23F] hover:bg-yellow-400 active:scale-95 text-[#0B1B33] px-4 py-2 rounded-xl font-heading font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Add Portfolios</span>
                </button>

                {selectedPortIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-heading font-extrabold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedPortIds.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Success Toast */}
            {autoAddSuccessToast && (
              <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm shadow-md animate-slideDown">
                {autoAddSuccessToast}
              </div>
            )}

            {/* Manual Combobox to add portfolios */}
            <div className="pt-2">
              <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                Manual Add: Search Country, Indian Politician or Party
              </label>
              <PortfolioCombobox
                existingNames={activePortfolios.map((p) => p.countryName)}
                onAdd={(item) => addPortfolioToCommittee(activeCommId, item)}
                placeholder="Search country, party or politician (e.g. India, France, Narendra Modi, BJP)..."
              />
            </div>

            {/* Portfolio Pills Grid */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Assigned Portfolios ({activePortfolios.length})
                </span>
                {activePortfolios.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove all ${activePortfolios.length} portfolios for "${activeComm?.name}"?`)) {
                        deleteMultiplePortfolios(activePortfolios.map((p) => p.id));
                      }
                    }}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-64 sm:max-h-80 overflow-y-auto p-1 border border-neutral-100 rounded-2xl bg-neutral-50/50">
                {activePortfolios.length === 0 ? (
                  <div className="py-8 text-neutral-400 font-medium text-xs sm:text-sm text-center w-full">
                    No portfolios added yet. Click <strong>Auto-Add Portfolios</strong> above or search manually!
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
            </div>
          </div>

          {/* Sequential Step Navigation Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep("committees")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/30 hover:bg-white/10 text-white font-heading font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Committees</span>
            </button>

            <Button
              onClick={handleContinueToRules}
              className="py-2.5 px-6 text-xs sm:text-sm rounded-xl font-heading font-extrabold"
            >
              Continue to Rules →
            </Button>
          </div>
        </div>
      )}

      {/* AUTO-ADD PORTFOLIOS MODAL DIALOG */}
      {showAutoAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-4 shadow-2xl relative animate-scaleIn">
            <button
              type="button"
              onClick={() => setShowAutoAddModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33]">
                  Auto-Add Portfolios
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Populate roster for <strong>{activeComm?.name || "Committee"}</strong>
                </p>
              </div>
            </div>

            {/* 1. Choose Number of Portfolios */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs sm:text-sm font-bold text-neutral-700">
                1. Choose Number of Portfolios:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["15", "30", "45", "50", "75", "100", "150"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAutoAddCount(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold border transition-colors cursor-pointer ${
                      autoAddCount === num
                        ? "bg-[#1560BD] text-white border-[#1560BD]"
                        : "bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200"
                    }`}
                  >
                    {num} seats
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-neutral-500 font-medium">Or custom number:</span>
                <input
                  type="number"
                  min={3}
                  max={150}
                  value={autoAddCount}
                  onChange={(e) => setAutoAddCount(e.target.value)}
                  className="w-20 bg-neutral-100 rounded-lg px-2.5 py-1 text-xs font-bold text-center border border-neutral-300 outline-none focus:ring-1 focus:ring-[#1560BD]"
                />
                <span className="text-[11px] text-neutral-400 font-medium">(min 3, max 150)</span>
              </div>
            </div>

            {/* 2. Choose Type (Countries vs Indian Politicians) */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs sm:text-sm font-bold text-neutral-700">
                2. Choose Portfolio Type:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  onClick={() => setAutoAddType("countries")}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                    autoAddType === "countries"
                      ? "border-[#1560BD] bg-blue-50/70 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1560BD] flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-heading font-extrabold text-[#0B1B33]">
                      Countries / UN
                    </div>
                    <div className="text-[11px] text-neutral-500 font-medium leading-tight mt-0.5">
                      193 UN member states &amp; major world powers
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setAutoAddType("indian_politicians")}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                    autoAddType === "indian_politicians"
                      ? "border-[#1560BD] bg-blue-50/70 shadow-xs"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-heading font-extrabold text-[#0B1B33]">
                      Indian Politicians
                    </div>
                    <div className="text-[11px] text-neutral-500 font-medium leading-tight mt-0.5">
                      PM, Cabinet, CMs, Opposition leaders &amp; MPs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Choose Mode (Append vs Replace) */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs sm:text-sm font-bold text-neutral-700">
                3. Addition Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAutoAddMode("append")}
                  className={`py-2 px-3 rounded-xl text-xs font-heading font-extrabold border transition-colors cursor-pointer ${
                    autoAddMode === "append"
                      ? "bg-neutral-800 text-white border-neutral-800"
                      : "bg-neutral-100 text-neutral-600 border-neutral-200"
                  }`}
                >
                  + Add to Existing
                </button>
                <button
                  type="button"
                  onClick={() => setAutoAddMode("replace")}
                  className={`py-2 px-3 rounded-xl text-xs font-heading font-extrabold border transition-colors cursor-pointer ${
                    autoAddMode === "replace"
                      ? "bg-neutral-800 text-white border-neutral-800"
                      : "bg-neutral-100 text-neutral-600 border-neutral-200"
                  }`}
                >
                  🔄 Replace Roster
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAutoAddModal(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-heading font-bold text-xs sm:text-sm cursor-pointer"
              >
                Cancel
              </button>
              <Button
                onClick={handleExecuteAutoAdd}
                className="py-2.5 px-5 text-xs sm:text-sm rounded-xl font-heading font-extrabold shadow-md"
              >
                ⚡ Populate {autoAddCount || 30} Portfolios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 4: RULES
      ======================================================== */}
      {currentStep === "rules" && (
        <div className="space-y-4">
          <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 shadow-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0B1B33]">
                Conference Rules &amp; Allotment
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
                Set policies for school delegations, payment proofs, and preference allocation.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <Toggle
                label="Allow school delegations"
                description="Schools and faculty advisors can register all their students at once"
                checked={event.rules.allowSchoolTeams}
                onChange={(c) => updateEventRules({ allowSchoolTeams: c })}
              />

              <Toggle
                label="Ask for payment proof receipt"
                description="Delegates must upload payment receipt before organizer verifies admission"
                checked={event.rules.askPaymentProof}
                onChange={(c) => updateEventRules({ askPaymentProof: c })}
              />

              <Toggle
                label="Show taken portfolios live"
                description="Delegates see in real-time which portfolios are already claimed"
                checked={event.rules.showTakenPortfoliosLive}
                onChange={(c) => updateEventRules({ showTakenPortfoliosLive: c })}
              />

              <Toggle
                label="First come, first served"
                description="When turned off, delegate experience and timestamps are weighted evenly"
                checked={event.rules.firstComeFirstServed}
                onChange={(c) => updateEventRules({ firstComeFirstServed: c })}
              />
            </div>
          </div>

          {/* Sequential Step Navigation Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep("portfolios")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/30 hover:bg-white/10 text-white font-heading font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portfolios</span>
            </button>

            <Button
              onClick={handleContinueToPublish}
              className="py-2.5 px-6 text-xs sm:text-sm rounded-xl font-heading font-extrabold"
            >
              Review &amp; Publish →
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 5: PUBLISH
      ======================================================== */}
      {currentStep === "publish" && (
        <div className="space-y-4">
          {event.status !== "published" ? (
            <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 border-2 border-yellow-400 shadow-sm">
              <div className="flex items-center gap-1.5 text-yellow-800">
                <Lock className="w-4 h-4 text-yellow-600" />
                <span className="text-[11px] uppercase font-extrabold tracking-wider">
                  Registration Links Locked
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0B1B33]">
                Ready to Open Registrations
              </h3>
              <p className="text-neutral-600 font-medium text-xs sm:text-sm leading-relaxed">
                This conference is currently in <strong>Draft</strong>. Once published, your unique shareable registration links will be unlocked for delegates and delegations.
              </p>
              <div className="pt-1">
                <Button
                  variant="primary"
                  onClick={handleOpenRegistrations}
                  disabled={isPublishing}
                  className="w-full sm:w-auto py-3 px-8 text-sm sm:text-base font-heading font-extrabold rounded-xl"
                >
                  {isPublishing ? "Publishing Conference..." : "Publish Conference & Open Registrations"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              {/* Left Column: Unique Registration Links */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {/* Individual Delegate */}
                <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Individual Delegate Link
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      ₹{event.fee || 1500}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-700 break-all p-3 bg-neutral-100 rounded-xl">
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

                {/* School Delegation */}
                <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      School Delegation Link
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      ₹{event.schoolFeePerStudent || 1200}/student
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-700 break-all p-3 bg-neutral-100 rounded-xl">
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

              {/* Right Column: Next Steps Guide */}
              <div className="lg:col-span-5 bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-sm">
                <h3 className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33]">
                  What happens next
                </h3>
                <div className="space-y-2.5 text-xs sm:text-sm font-medium text-neutral-700">
                  <div className="flex gap-2.5">
                    <span className="font-heading font-extrabold text-[#1560BD]">1.</span>
                    <span>Delegates register and rank committee preferences</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-heading font-extrabold text-[#1560BD]">2.</span>
                    <span>Verify payment receipts in the Registrations dashboard</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="font-heading font-extrabold text-[#1560BD]">3.</span>
                    <span>Auto or manual allot portfolios and publish allotments</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sequential Step Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep("rules")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/30 hover:bg-white/10 text-white font-heading font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Rules</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
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
        </div>
      )}
    </div>
  );
}
