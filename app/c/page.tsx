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
            };
            setConference(ev);
            document.title = `${ev.name} | Delegate`;

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

      // 2. Fallback: check localStorage mock store
      try {
        const localData = localStorage.getItem("mun_platform_database_clean_v2");
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.event && (parsed.event.id === queryId || parsed.event.slug === queryId)) {
            setConference(parsed.event);
            setCommittees(parsed.committees || []);
            document.title = `${parsed.event.name} | Delegate`;
            setLoading(false);
            return;
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
            {conference ? conference.name : "Delegate Platform"}
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

  return (
    <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-12 text-white">
      <div className="max-w-xl w-full mx-auto space-y-6 flex-1 flex flex-col justify-between">
        {/* Conference Header Card */}
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wider font-bold text-blue-200">
            Official MUN Registration Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
            {conference.name}
          </h1>

          {/* Details metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {conference.dates && (
              <div className="flex items-center gap-2.5 text-blue-100 font-medium text-sm sm:text-base bg-white/10 p-3 rounded-xl border border-white/10">
                <Calendar className="w-5 h-5 shrink-0 text-yellow-300" />
                <span>{conference.dates}</span>
              </div>
            )}
            {conference.venue && (
              <div className="flex items-center gap-2.5 text-blue-100 font-medium text-sm sm:text-base bg-white/10 p-3 rounded-xl border border-white/10">
                <MapPin className="w-5 h-5 shrink-0 text-yellow-300" />
                <span className="truncate">{conference.venue}</span>
              </div>
            )}
            {conference.deadline && (
              <div className="flex items-center gap-2.5 text-blue-100 font-medium text-sm sm:text-base bg-white/10 p-3 rounded-xl border border-white/10 sm:col-span-2">
                <Clock className="w-5 h-5 shrink-0 text-yellow-300" />
                <span>Registration deadline: <strong className="text-white">{conference.deadline}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Selection Card */}
        <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
            Select Registration Type
          </div>

          <div className="space-y-3">
            {/* Individual Option */}
            <button
              type="button"
              onClick={() => router.push(`/register?event=${encodeURIComponent(conference.id)}`)}
              className="w-full text-left bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-200 hover:border-[#1560BD] p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <div>
                <div className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33]">
                  Individual Delegate
                </div>
                <div className="text-sm text-neutral-600 font-medium mt-0.5">
                  Choose 3 committee preferences & 3 ranked portfolios
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#1560BD]">
                  ₹{(conference.fee || 2500).toLocaleString()}
                </div>
                <div className="text-xs text-neutral-500 font-bold">per delegate</div>
              </div>
            </button>

            {/* School Delegation Option */}
            {conference.rules.allowSchoolTeams && (
              <button
                type="button"
                onClick={() => router.push(`/register/team?event=${encodeURIComponent(conference.id)}`)}
                className="w-full text-left bg-neutral-50 hover:bg-neutral-100 border-2 border-neutral-200 hover:border-[#1560BD] p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33]">
                    School Delegation Team
                  </div>
                  <div className="text-sm text-neutral-600 font-medium mt-0.5">
                    Register multiple students together under one school
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-xl sm:text-2xl font-heading font-extrabold text-emerald-700">
                    ₹{(conference.schoolFeePerStudent || 1200).toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-500 font-bold">per student</div>
                </div>
              </button>
            )}
          </div>

          {/* Quick Links */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-medium">
            <Link
              href={`/browse?event=${encodeURIComponent(conference.id)}`}
              className="text-[#1560BD] font-heading font-bold hover:underline flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              Browse committees & agendas ({committees.length})
            </Link>

            <Link
              href={`/status?event=${encodeURIComponent(conference.id)}`}
              className="text-neutral-700 hover:text-black font-heading font-bold underline"
            >
              Already registered? Check status
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-blue-200">
          Powered by Delegate Multi-Tenant MUN Platform
        </div>
      </div>
    </main>
  );
}
