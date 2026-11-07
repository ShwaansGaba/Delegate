"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { EventModel, MunCommittee } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Calendar, MapPin, Clock, Users, BookOpen } from "lucide-react";

export default function PublicConferencePage() {
  const router = useRouter();
  const [conference, setConference] = useState<EventModel | null>(null);
  const [committees, setCommittees] = useState<MunCommittee[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadConference() {
      if (typeof window === "undefined") return;

      const sp = new URLSearchParams(window.location.search);
      const queryId = sp.get("id") || sp.get("c") || sp.get("event") || "";

      if (!queryId) {
        setErrorMsg("No conference specified.");
        setLoading(false);
        return;
      }

      // 1. Try Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .or(`id.eq.${queryId},slug.eq.${queryId}`)
            .maybeSingle();

          if (!error && data) {
            const ev: EventModel = {
              id: data.id,
              ownerId: data.owner_id,
              slug: data.slug,
              organizationId: data.organization_id || "org-1",
              type: data.type || "mun",
              name: data.name,
              dates: data.dates,
              dateFrom: data.date_from,
              dateTo: data.date_to,
              deadline: data.deadline,
              deadlineDate: data.deadline_date,
              venue: data.venue,
              fee: Number(data.fee) || 0,
              schoolFeePerStudent: Number(data.school_fee_per_student) || 0,
              status: data.status,
              rules: data.rules || {},
              branding: data.branding || undefined,
            };
            setConference(ev);
            document.title = `${ev.name} | Delegato`;

            // Load committees
            const { data: commsData } = await supabase
              .from("committees")
              .select("*")
              .eq("event_id", ev.id);

            if (commsData) {
              setCommittees(
                commsData.map((c) => ({
                  id: c.id,
                  eventId: c.event_id,
                  name: c.name,
                  agenda: c.agenda,
                  totalSeats: c.total_seats,
                  backgroundGuideUrl: c.background_guide_url,
                }))
              );
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Supabase public load failed:", err);
        }
      }

      // 2. Fallback: check localStorage for public conference data
      try {
        const directPublicConf = localStorage.getItem(`delegate_public_conf_${queryId}`);
        if (directPublicConf) {
          const parsed = JSON.parse(directPublicConf);
          setConference(parsed);
          document.title = `${parsed.name} | Delegato`;
          const savedData = localStorage.getItem(`delegate_conf_data_${parsed.id}`);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            setCommittees(parsedData.committees || []);
          }
          setLoading(false);
          return;
        }

        // Search through all local organizer store keys
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("delegate_storage_")) {
            const val = localStorage.getItem(k);
            if (val) {
              const parsedStore = JSON.parse(val);
              const found = (parsedStore.myConferences || []).find(
                (c: EventModel) => c.id === queryId || c.slug === queryId
              );
              if (found) {
                setConference(found);
                document.title = `${found.name} | Delegato`;
                const savedData = localStorage.getItem(`delegate_conf_data_${found.id}`);
                if (savedData) {
                  const parsedData = JSON.parse(savedData);
                  setCommittees(parsedData.committees || []);
                }
                setLoading(false);
                return;
              }
            }
          }
        }
      } catch {}

      setErrorMsg("Conference not found.");
      setLoading(false);
    }

    loadConference();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1560BD] flex items-center justify-center p-6 text-white">
        <div className="text-xl font-heading font-extrabold text-blue-100">
          Loading conference...
        </div>
      </main>
    );
  }

  // If conference does not exist or is not published
  if (!conference || conference.status !== "published") {
    return (
      <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-4 py-8 sm:px-8 sm:py-16 text-white">
        <div className="max-w-md w-full mx-auto my-auto bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="text-xs uppercase tracking-wider font-bold text-neutral-500">
            {conference ? conference.name : "Delegato"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0B1B33] leading-tight">
            Registrations are not open
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 font-medium leading-relaxed">
            {conference
              ? "This conference is currently in preparation or registrations have concluded. Please check back later or contact the secretariat."
              : errorMsg || "The conference link you opened does not exist."}
          </p>
          <div className="pt-2">
            <Link
              href="/conferences"
              className="inline-block text-[#1560BD] font-heading font-bold hover:underline text-base"
            >
              ← View available conferences
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const branding = conference.branding || {};
  const primaryColor = branding.primaryColor || "#1560BD";
  const accentColor = branding.accentColor || "#FFD23F";
  const bgEffect = branding.backgroundEffect || "none";
  const cardStyle = branding.cardStyle || "solid";
  const monogram = branding.monogram || "D";

  return (
    <main
      className="min-h-screen flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-12 text-white transition-colors duration-300"
      style={{ backgroundColor: primaryColor }}
      data-bg-effect={bgEffect}
    >
      <div className="max-w-xl w-full mx-auto space-y-6 flex-1 flex flex-col justify-between">
        {/* Conference Header Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-extrabold text-base shadow-sm shrink-0"
              style={{ backgroundColor: "#FFFFFF", color: primaryColor }}
            >
              {monogram}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-white/80">
                Delegato MUN Portal
              </div>
              <div className="text-xs text-white/60 font-medium">
                Delegate Admissions
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
            {conference.name}
          </h1>

          {/* Details metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {conference.dates && (
              <div className="flex items-center gap-2.5 text-white/90 font-medium text-sm sm:text-base bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                <Calendar className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
                <span>{conference.dates}</span>
              </div>
            )}
            {conference.venue && (
              <div className="flex items-center gap-2.5 text-white/90 font-medium text-sm sm:text-base bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                <MapPin className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
                <span className="truncate">{conference.venue}</span>
              </div>
            )}
            {conference.deadline && (
              <div className="flex items-center gap-2.5 text-white/90 font-medium text-sm sm:text-base bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm sm:col-span-2">
                <Clock className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
                <span>Registration deadline: <strong className="text-white">{conference.deadline}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Selection Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 space-y-5 transition-all ${
            cardStyle === "glass"
              ? "bg-white/15 backdrop-blur-xl border border-white/25 text-white shadow-2xl"
              : cardStyle === "minimal"
              ? "bg-[#0B1B33]/90 border border-white/20 text-white shadow-xl"
              : "bg-white text-[#0B1B33] shadow-xl"
          }`}
        >
          <div
            className={`text-xs uppercase tracking-wider font-bold ${
              cardStyle === "solid" ? "text-neutral-500" : "text-white/70"
            }`}
          >
            Select Registration Type
          </div>

          <div className="space-y-3">
            {/* Individual Option */}
            <button
              type="button"
              onClick={() => router.push(`/register?event=${encodeURIComponent(conference.id)}`)}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer border-2 ${
                cardStyle === "solid"
                  ? "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 hover:border-blue-500"
                  : "bg-white/10 hover:bg-white/15 border-white/15 hover:border-white/30 text-white"
              }`}
            >
              <div>
                <div
                  className={`text-lg sm:text-xl font-heading font-extrabold ${
                    cardStyle === "solid" ? "text-[#0B1B33]" : "text-white"
                  }`}
                >
                  Individual Delegate
                </div>
                <div
                  className={`text-sm font-medium mt-0.5 ${
                    cardStyle === "solid" ? "text-neutral-600" : "text-white/80"
                  }`}
                >
                  Choose 3 committee preferences & 3 ranked portfolios
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div
                  className="text-xl sm:text-2xl font-heading font-extrabold"
                  style={{ color: cardStyle === "solid" ? primaryColor : accentColor }}
                >
                  ₹{(conference.fee || 2500).toLocaleString()}
                </div>
                <div
                  className={`text-xs font-bold ${
                    cardStyle === "solid" ? "text-neutral-500" : "text-white/60"
                  }`}
                >
                  per delegate
                </div>
              </div>
            </button>

            {/* School Delegation Option */}
            {conference.rules.allowSchoolTeams && (
              <button
                type="button"
                onClick={() => router.push(`/register/team?event=${encodeURIComponent(conference.id)}`)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer border-2 ${
                  cardStyle === "solid"
                    ? "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 hover:border-emerald-500"
                    : "bg-white/10 hover:bg-white/15 border-white/15 hover:border-white/30 text-white"
                }`}
              >
                <div>
                  <div
                    className={`text-lg sm:text-xl font-heading font-extrabold ${
                      cardStyle === "solid" ? "text-[#0B1B33]" : "text-white"
                    }`}
                  >
                    School Delegation Team
                  </div>
                  <div
                    className={`text-sm font-medium mt-0.5 ${
                      cardStyle === "solid" ? "text-neutral-600" : "text-white/80"
                    }`}
                  >
                    Register multiple students together under one school
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div
                    className="text-xl sm:text-2xl font-heading font-extrabold"
                    style={{ color: cardStyle === "solid" ? "#047857" : accentColor }}
                  >
                    ₹{(conference.schoolFeePerStudent || 1200).toLocaleString()}
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      cardStyle === "solid" ? "text-neutral-500" : "text-white/60"
                    }`}
                  >
                    per student
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Quick Links */}
          <div
            className={`pt-2 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-medium ${
              cardStyle === "solid" ? "border-neutral-100" : "border-white/15"
            }`}
          >
            <Link
              href={`/browse?event=${encodeURIComponent(conference.id)}`}
              className={`font-heading font-bold hover:underline flex items-center gap-1.5 ${
                cardStyle === "solid" ? "text-[#1560BD]" : "text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Browse committees & agendas ({committees.length})
            </Link>

            <Link
              href={`/status?event=${encodeURIComponent(conference.id)}`}
              className={`font-heading font-bold underline ${
                cardStyle === "solid" ? "text-neutral-700 hover:text-black" : "text-white/90 hover:text-white"
              }`}
            >
              Already registered? Check status
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/70 flex items-center justify-center gap-1.5 pt-2">
          <span>Powered by</span>
          <span className="font-heading font-extrabold text-white">Deleg<span className="text-[#FFD23F]">ato</span></span>
        </div>
      </div>
    </main>
  );
}
