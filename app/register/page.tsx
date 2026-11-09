"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { CredentialReview } from "@/components/mun/CredentialReview";

const PRESET_SCHOOLS = [
  "Delhi Public School",
  "Delhi Presidency School",
  "Delhi Model School",
  "Delhi Heritage School",
  "Modern School Barakhamba",
  "The Mother's International School",
  "Sanskriti School",
  "Springdales School Pusa Road",
  "The British School New Delhi",
  "Vasant Valley School",
];

export default function IndividualRegisterPage() {
  const router = useRouter();
  const { committees, portfolios, event, theme, loadEventById, refreshPortfoliosLive, addRegistration } = useApp();

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

  // Wizard steps:
  // Step 1: Name
  // Step 2: Contact, School & Class
  // Step 3: Committee 1 + 3 Portfolios
  // Step 4: Committee 2 + 3 Portfolios
  // Step 5: Committee 3 + 3 Portfolios
  // Step 6: Credential Review
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Form state
  const [name, setName] = useState("");

  React.useEffect(() => {
    document.title = event.name ? `Register - ${event.name} | Delegato` : "Register for MUN | Delegato";
  }, [event.name]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [classYear, setClassYear] = useState("12");
  const [experienceMuns, setExperienceMuns] = useState(3);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");

  // Committee preferences
  // Each committee has 1 chosen committeeId and 3 chosen portfolioIds
  const [pref1Comm, setPref1Comm] = useState("");
  const [pref1Port1, setPref1Port1] = useState("");
  const [pref1Port2, setPref1Port2] = useState("");
  const [pref1Port3, setPref1Port3] = useState("");

  const [pref2Comm, setPref2Comm] = useState("");
  const [pref2Port1, setPref2Port1] = useState("");
  const [pref2Port2, setPref2Port2] = useState("");
  const [pref2Port3, setPref2Port3] = useState("");

  const [pref3Comm, setPref3Comm] = useState("");
  const [pref3Port1, setPref3Port1] = useState("");
  const [pref3Port2, setPref3Port2] = useState("");
  const [pref3Port3, setPref3Port3] = useState("");

  // Sync committee defaults from conference
  React.useEffect(() => {
    if (committees.length > 0) {
      if (!pref1Comm && committees[0]) setPref1Comm(committees[0].id);
      if (!pref2Comm && committees[1]) setPref2Comm(committees[1].id);
      if (!pref3Comm && committees[2]) setPref3Comm(committees[2].id);
    }
  }, [committees]);

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get portfolio options for a committee, excluding already selected portfolios (sorted alphabetically)
  const getPortOptions = (committeeId: string, currentSelectedIds: string[]) => {
    return portfolios
      .filter((p) => p.committeeId === committeeId)
      .filter((p) => !currentSelectedIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.countryName,
        code: p.code,
        isTaken: event.rules.showTakenPortfoliosLive ? p.status === "taken" : false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg("Please enter your name.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!school.trim()) {
        setErrorMsg("Please enter or select your school.");
        return;
      }
      if (!email.trim()) {
        setErrorMsg("Please enter your email address.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      if (!phone.trim()) {
        setErrorMsg("Please enter your phone number.");
        return;
      }
      if (phone.trim().replace(/\D/g, "").length < 8) {
        setErrorMsg("Please enter a valid phone number (at least 8 digits).");
        return;
      }
      setStep(3);
      refreshPortfoliosLive();
    } else if (step === 3) {
      if (!pref1Comm || !pref1Port1 || !pref1Port2 || !pref1Port3) {
        setErrorMsg("Please select all 3 portfolio choices for Committee 1.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!pref2Comm || !pref2Port1 || !pref2Port2 || !pref2Port3) {
        setErrorMsg("Please select all 3 portfolio choices for Committee 2.");
        return;
      }
      if (pref2Comm === pref1Comm) {
        setErrorMsg("Please choose a different committee for your second preference.");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      if (!pref3Comm || !pref3Port1 || !pref3Port2 || !pref3Port3) {
        setErrorMsg("Please select all 3 portfolio choices for Committee 3.");
        return;
      }
      if (pref3Comm === pref1Comm || pref3Comm === pref2Comm) {
        setErrorMsg("Please choose 3 different committees.");
        return;
      }
      setStep(6);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setErrorMsg("");
      setStep(step - 1);
    } else {
      router.push("/");
    }
  };

  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    try {
      const newReg = await addRegistration({
        eventId: event.id || "conference",
        delegateName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        school: school.trim(),
        classYear,
        experienceMuns,
        registrationType: "individual",
        paymentStatus: "unpaid",
        feeAmount: event.fee || 2500,
        preferences: [
          {
            committeeRank: 1,
            committeeId: pref1Comm,
            portfolioIds: [pref1Port1, pref1Port2, pref1Port3],
          },
          {
            committeeRank: 2,
            committeeId: pref2Comm,
            portfolioIds: [pref2Port1, pref2Port2, pref2Port3],
          },
          {
            committeeRank: 3,
            committeeId: pref3Comm,
            portfolioIds: [pref3Port1, pref3Port2, pref3Port3],
          },
        ],
      });

      const nextUrl = `/register/confirmation?num=${encodeURIComponent(newReg.registrationNumber)}&event=${encodeURIComponent(event.id)}`;
      router.push(nextUrl);
    } catch (err) {
      console.error("Error creating registration:", err);
      setIsSubmitting(false);
      setErrorMsg("Failed to complete registration. Please try again.");
    }
  };

  // Build review data for Step 6
  const getPortName = (id: string) => {
    return portfolios.find((p) => p.id === id)?.countryName || id;
  };

  const getCommName = (id: string) => {
    return committees.find((c) => c.id === id)?.name || id.toUpperCase();
  };

  const reviewPreferences = [
    {
      committeeName: getCommName(pref1Comm),
      portfolios: [getPortName(pref1Port1), getPortName(pref1Port2), getPortName(pref1Port3)],
    },
    {
      committeeName: getCommName(pref2Comm),
      portfolios: [getPortName(pref2Port1), getPortName(pref2Port2), getPortName(pref2Port3)],
    },
    {
      committeeName: getCommName(pref3Comm),
      portfolios: [getPortName(pref3Port1), getPortName(pref3Port2), getPortName(pref3Port3)],
    },
  ];

  return (
    <main
      className="min-h-screen flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 overflow-x-hidden page-transition"
      style={{ backgroundColor: primaryColor }}
      data-bg-effect={bgEffect}
    >
      <div className="max-w-[360px] sm:max-w-md w-full mx-auto flex-1 flex flex-col justify-between">
        {/* Progress bar with back arrow */}
        <ProgressBar
          currentStep={step}
          totalSteps={totalSteps}
          onBack={handleBack}
        />

        {/* Conference Header Card */}
        <div className="bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 mt-2 mb-1 text-white flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-blue-200 block font-bold">Registering for</span>
            <span className="text-sm sm:text-base font-heading font-extrabold truncate block">{event.name || "MUN Conference"}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-blue-200 block font-bold">Delegate Fee</span>
            <span className="text-sm sm:text-base font-heading font-extrabold text-[#FFD23F]">₹{(event.fee || 2500).toLocaleString()}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-[#FFD23F] text-[#0B1B33] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl font-bold mt-2 sm:mt-4 text-sm sm:text-base">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: What is your name? (Page 3) */}
        {step === 1 && (
          <div key="step-1" className="flex-1 flex flex-col justify-between pt-3 sm:pt-6 page-transition">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                What is your <br />
                name?
              </h1>

              <div className="pt-3 sm:pt-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Mehta"
                  autoFocus
                  className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-xl sm:text-2xl font-heading font-extrabold outline-none placeholder:text-neutral-400 input-smooth focus:ring-4 focus:ring-blue-300"
                />
              </div>
            </div>

            <div className="pt-4 pb-2 sm:pt-8 sm:pb-4">
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 2: Where do you study? (Page 4) */}
        {step === 2 && (
          <div key="step-2" className="flex-1 flex flex-col justify-between pt-3 sm:pt-6 page-transition">
            <div className="space-y-3 sm:space-y-5">
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                Where do you <br />
                study?
              </h1>

              {/* School typable search */}
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  value={schoolSearchQuery !== "" ? schoolSearchQuery : school}
                  onChange={(e) => {
                    setSchoolSearchQuery(e.target.value);
                    setSchool(e.target.value);
                  }}
                  placeholder="Type school name..."
                  className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg font-heading font-bold outline-none placeholder:text-neutral-400 input-smooth focus:ring-4 focus:ring-blue-300"
                />

                {/* Suggestions ONLY when someone starts typing */}
                {schoolSearchQuery.trim().length > 0 && (
                  <div className="space-y-1.5 sm:space-y-2">
                    {PRESET_SCHOOLS.filter((s) =>
                      s.toLowerCase().includes(schoolSearchQuery.toLowerCase())
                    )
                      .slice(0, 3)
                      .map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSchool(s);
                            setSchoolSearchQuery("");
                          }}
                          className={`w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left text-sm sm:text-lg font-heading font-extrabold transition-colors cursor-pointer ${
                            school === s ? "ring-4 ring-[#FFD23F]" : "hover:bg-neutral-50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}

                    <button
                      type="button"
                      onClick={() => {
                        setSchool(schoolSearchQuery.trim());
                        setSchoolSearchQuery("");
                      }}
                      className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left text-sm sm:text-lg font-heading font-extrabold hover:bg-neutral-50 cursor-pointer"
                    >
                      Add &ldquo;{schoolSearchQuery.trim()}&rdquo; as a new school
                    </button>
                  </div>
                )}
              </div>

              {/* Contact info - Email & Phone Mandatory */}
              <div className="space-y-2 sm:space-y-3 pt-1">
                <div>
                  <label className="block text-xs sm:text-sm font-heading font-bold text-white/90 mb-1">
                    Email address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    required
                    className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg font-medium outline-none placeholder:text-neutral-400 input-smooth"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-heading font-bold text-white/90 mb-1">
                    Phone number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    required
                    className="w-full bg-white text-[#0B1B33] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg font-medium outline-none placeholder:text-neutral-400 input-smooth"
                  />
                </div>
              </div>

              {/* Class pills: 6 to 12 */}
              <div className="pt-1">
                <label className="block text-base sm:text-xl font-heading font-extrabold text-white mb-2">
                  Which class?
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
                  {["6", "7", "8", "9", "10", "11", "12"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setClassYear(c)}
                      className={`h-10 sm:h-12 rounded-xl text-base sm:text-xl font-heading font-extrabold transition-colors cursor-pointer flex items-center justify-center ${
                        classYear === c
                          ? "bg-white text-[#0B1B33]"
                          : "border-2 border-white text-white hover:bg-white/10"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="pt-1">
                <label className="block text-base sm:text-xl font-heading font-extrabold text-white mb-1.5">
                  MUNs attended
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[0, 1, 2, 3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setExperienceMuns(count)}
                      className={`h-10 sm:h-12 rounded-xl text-base sm:text-xl font-heading font-bold transition-colors cursor-pointer flex items-center justify-center ${
                        experienceMuns === count
                          ? "bg-white text-[#0B1B33]"
                          : "border border-white/60 text-white hover:bg-white/10"
                      }`}
                    >
                      {count === 5 ? "5+" : count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 pb-2 sm:pt-8 sm:pb-4">
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Committee 1 (Page 5) */}
        {step === 3 && (
          <div key="step-3" className="flex-1 flex flex-col justify-between pt-3 sm:pt-6 page-transition">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                Your first <br />
                committee
              </h1>

              <div>
                <SearchableSelect
                  label="Committee"
                  value={pref1Comm}
                  options={committees.map((c) => ({ id: c.id, name: c.name }))}
                  onSelect={(opt) => {
                    setPref1Comm(opt.id);
                    setPref1Port1("");
                    setPref1Port2("");
                    setPref1Port3("");
                  }}
                  sheetTitle="Pick committee"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="block text-base sm:text-xl font-heading font-extrabold text-white">
                  Your 3 portfolios, in order
                </label>

                {/* Portfolio 1 */}
                <SearchableSelect
                  value={pref1Port1}
                  placeholder="1. Type a portfolio"
                  sheetTitle="Pick portfolio 1"
                  sheetSubtitle={`For ${getCommName(pref1Comm)}`}
                  options={getPortOptions(pref1Comm, [pref1Port2, pref1Port3].filter(Boolean))}
                  onSelect={(opt) => setPref1Port1(opt.id)}
                />

                {/* Portfolio 2 */}
                <SearchableSelect
                  value={pref1Port2}
                  placeholder="2. Type a portfolio"
                  sheetTitle="Pick portfolio 2"
                  sheetSubtitle={`For ${getCommName(pref1Comm)}`}
                  options={getPortOptions(pref1Comm, [pref1Port1, pref1Port3].filter(Boolean))}
                  onSelect={(opt) => setPref1Port2(opt.id)}
                />

                {/* Portfolio 3 (Matches Page 5 & 6) */}
                <SearchableSelect
                  value={pref1Port3}
                  placeholder="3. Type a portfolio"
                  sheetTitle="Pick portfolio 3"
                  sheetSubtitle={`For ${getCommName(pref1Comm)}`}
                  options={getPortOptions(pref1Comm, [pref1Port1, pref1Port2].filter(Boolean))}
                  onSelect={(opt) => setPref1Port3(opt.id)}
                />
              </div>
            </div>

            <div className="pt-4 pb-2 sm:pt-8 sm:pb-4">
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 4: Committee 2 */}
        {step === 4 && (
          <div key="step-4" className="flex-1 flex flex-col justify-between pt-3 sm:pt-6 page-transition">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                Your second <br />
                committee
              </h1>

              <div>
                <SearchableSelect
                  label="Committee"
                  value={pref2Comm}
                  options={committees
                    .filter((c) => c.id !== pref1Comm)
                    .map((c) => ({ id: c.id, name: c.name }))}
                  onSelect={(opt) => {
                    setPref2Comm(opt.id);
                    setPref2Port1("");
                    setPref2Port2("");
                    setPref2Port3("");
                  }}
                  sheetTitle="Pick committee 2"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="block text-base sm:text-xl font-heading font-extrabold text-white">
                  Your 3 portfolios, in order
                </label>

                <SearchableSelect
                  value={pref2Port1}
                  placeholder="1. Type a portfolio"
                  sheetTitle="Pick portfolio 1"
                  sheetSubtitle={`For ${getCommName(pref2Comm)}`}
                  options={getPortOptions(pref2Comm, [pref2Port2, pref2Port3].filter(Boolean))}
                  onSelect={(opt) => setPref2Port1(opt.id)}
                />

                <SearchableSelect
                  value={pref2Port2}
                  placeholder="2. Type a portfolio"
                  sheetTitle="Pick portfolio 2"
                  sheetSubtitle={`For ${getCommName(pref2Comm)}`}
                  options={getPortOptions(pref2Comm, [pref2Port1, pref2Port3].filter(Boolean))}
                  onSelect={(opt) => setPref2Port2(opt.id)}
                />

                <SearchableSelect
                  value={pref2Port3}
                  placeholder="3. Type a portfolio"
                  sheetTitle="Pick portfolio 3"
                  sheetSubtitle={`For ${getCommName(pref2Comm)}`}
                  options={getPortOptions(pref2Comm, [pref2Port1, pref2Port2].filter(Boolean))}
                  onSelect={(opt) => setPref2Port3(opt.id)}
                />
              </div>
            </div>

            <div className="pt-4 pb-2 sm:pt-8 sm:pb-4">
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 5: Committee 3 */}
        {step === 5 && (
          <div key="step-5" className="flex-1 flex flex-col justify-between pt-3 sm:pt-6 page-transition">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                Your third <br />
                committee
              </h1>

              <div>
                <SearchableSelect
                  label="Committee"
                  value={pref3Comm}
                  options={committees
                    .filter((c) => c.id !== pref1Comm && c.id !== pref2Comm)
                    .map((c) => ({ id: c.id, name: c.name }))}
                  onSelect={(opt) => {
                    setPref3Comm(opt.id);
                    setPref3Port1("");
                    setPref3Port2("");
                    setPref3Port3("");
                  }}
                  sheetTitle="Pick committee 3"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="block text-base sm:text-xl font-heading font-extrabold text-white">
                  Your 3 portfolios, in order
                </label>

                <SearchableSelect
                  value={pref3Port1}
                  placeholder="1. Type a portfolio"
                  sheetTitle="Pick portfolio 1"
                  sheetSubtitle={`For ${getCommName(pref3Comm)}`}
                  options={getPortOptions(pref3Comm, [pref3Port2, pref3Port3].filter(Boolean))}
                  onSelect={(opt) => setPref3Port1(opt.id)}
                />

                <SearchableSelect
                  value={pref3Port2}
                  placeholder="2. Type a portfolio"
                  sheetTitle="Pick portfolio 2"
                  sheetSubtitle={`For ${getCommName(pref3Comm)}`}
                  options={getPortOptions(pref3Comm, [pref3Port1, pref3Port3].filter(Boolean))}
                  onSelect={(opt) => setPref3Port2(opt.id)}
                />

                <SearchableSelect
                  value={pref3Port3}
                  placeholder="3. Type a portfolio"
                  sheetTitle="Pick portfolio 3"
                  sheetSubtitle={`For ${getCommName(pref3Comm)}`}
                  options={getPortOptions(pref3Comm, [pref3Port1, pref3Port2].filter(Boolean))}
                  onSelect={(opt) => setPref3Port3(opt.id)}
                />
              </div>
            </div>

            <div className="pt-4 pb-2 sm:pt-8 sm:pb-4">
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 6: Check your details (Page 7) */}
        {step === 6 && (
          <div key="step-6" className="flex-1 flex flex-col justify-between pt-3 sm:pt-6 page-transition">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
                Check your <br />
                details
              </h1>

              <CredentialReview
                name={name}
                school={school}
                classYear={classYear}
                preferences={reviewPreferences}
                fee={event.fee}
                onChangeSomething={() => setStep(1)}
                onConfirm={handleConfirmRegistration}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
