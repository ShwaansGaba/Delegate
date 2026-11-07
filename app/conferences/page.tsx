"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { DelegatoIcon } from "@/components/ui/DelegatoBrand";
import { ArrowLeft, Calendar, MapPin, Users, Award } from "lucide-react";

interface ConferenceItem {
  id: string;
  name: string;
  dates?: string;
  date_from?: string;
  date_to?: string;
  venue?: string;
  fee?: number;
  school_fee_per_student?: number;
  deadline?: string;
  deadline_date?: string;
  status?: string;
  committees?: {
    id: string;
    name: string;
    total_seats: number;
    portfolios?: { id: string; status: string }[];
  }[];
}

export default function AvailableConferencesPage() {
  const router = useRouter();
  const { event, committees, portfolios } = useApp();
  const [selectedConfForModal, setSelectedConfForModal] = useState<string | null>(null);
  const [conferences, setConferences] = useState<ConferenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Available Conferences | Delegato";

    async function loadLiveConferences() {
      setLoading(true);
      const collected: ConferenceItem[] = [];

      // 1. Fetch from Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: eventsData, error: evErr } = await supabase
            .from("events")
            .select("*");

          if (!evErr && eventsData && eventsData.length > 0) {
            const eventIds = eventsData.map((e) => e.id);
            const { data: commsData } = await supabase
              .from("committees")
              .select("*")
              .in("event_id", eventIds);

            const commIds = (commsData || []).map((c) => c.id);
            let portsData: { id: string; committee_id: string; status: string }[] = [];
            if (commIds.length > 0) {
              const res = await supabase
                .from("portfolios")
                .select("id, committee_id, status")
                .in("committee_id", commIds);
              portsData = res.data || [];
            }

            eventsData.forEach((ev) => {
              if (ev.name && ev.name.trim().length > 0) {
                const evComms = (commsData || [])
                  .filter((c) => c.event_id === ev.id)
                  .map((c) => ({
                    id: c.id,
                    name: c.name,
                    total_seats: c.total_seats,
                    portfolios: portsData.filter((p) => p.committee_id === c.id),
                  }));

                collected.push({
                  id: ev.id,
                  name: ev.name,
                  dates: ev.dates,
                  date_from: ev.date_from,
                  date_to: ev.date_to,
                  venue: ev.venue,
                  fee: Number(ev.fee) || 0,
                  school_fee_per_student: Number(ev.school_fee_per_student) || 0,
                  deadline: ev.deadline,
                  deadline_date: ev.deadline_date,
                  status: ev.status,
                  committees: evComms,
                });
              }
            });
          }
        } catch (err) {
          console.warn("Live conferences load notice:", err);
        }
      }

      // 2. Offline / Local Storage fallback & merge
      if (typeof window !== "undefined") {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("delegate_public_conf_") || key.startsWith("delegate_storage_"))) {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                const list: ConferenceItem[] = parsed.myConferences || (parsed.name ? [parsed] : []);
                list.forEach((c) => {
                  if (c.name && c.name.trim() && !collected.some((existing) => existing.id === c.id)) {
                    collected.push({
                      id: c.id,
                      name: c.name,
                      dates: c.dates,
                      date_from: c.date_from || (c as unknown as { dateFrom?: string }).dateFrom,
                      date_to: c.date_to || (c as unknown as { dateTo?: string }).dateTo,
                      venue: c.venue,
                      fee: c.fee,
                      school_fee_per_student: c.school_fee_per_student || (c as unknown as { schoolFeePerStudent?: number }).schoolFeePerStudent,
                      deadline: c.deadline,
                      deadline_date: c.deadline_date || (c as unknown as { deadlineDate?: string }).deadlineDate,
                      status: c.status,
                    });
                  }
                });
              }
            }
          }
        } catch {}
      }

      // 3. Fallback to active conference if valid
      if (event.name && event.name.trim() && !collected.some((c) => c.id === event.id)) {
        collected.push({
          id: event.id,
          name: event.name,
          dates: event.dates,
          date_from: event.dateFrom,
          date_to: event.dateTo,
          venue: event.venue,
          fee: event.fee,
          school_fee_per_student: event.schoolFeePerStudent,
          deadline: event.deadline,
          status: event.status,
          committees: committees.map((c) => ({
            id: c.id,
            name: c.name,
            total_seats: c.totalSeats,
            portfolios: portfolios.filter((p) => p.committeeId === c.id),
          })),
        });
      }

      setConferences(collected);
      setLoading(false);
    }

    loadLiveConferences();

    // Realtime listener for live synchronization
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel("realtime_conferences")
        .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
          loadLiveConferences();
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [event.name, event.id, event.dates, event.dateFrom, event.dateTo, event.venue, event.fee, event.schoolFeePerStudent, event.deadline, event.status, committees, portfolios]);

  return (
    <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-3 py-4 sm:px-8 sm:py-10 text-white page-transition">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-blue-400/30">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-white hover:text-yellow-300 font-bold text-base sm:text-lg cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Home
          </button>

          <Link
            href="/status"
            className="text-white hover:text-yellow-300 underline font-bold text-sm sm:text-base"
          >
            Already registered? Check status
          </Link>
        </div>

        {/* Title */}
        <div className="mb-4 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-blue-100 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 sm:mb-3">
            <DelegatoIcon size="sm" rounded="md" />
            <span>Delegato Conference Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
            Available MUN Conferences
          </h1>
          <p className="text-base sm:text-xl text-blue-100 font-medium mt-1 sm:mt-2">
            Explore upcoming Model United Nations conferences and register your delegation.
          </p>
        </div>

        {/* Conferences List */}
        <div className="space-y-4 sm:space-y-6 flex-1">
          {loading ? (
            <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
              <div className="text-xl sm:text-2xl font-heading font-bold text-gray-700">
                Loading conferences...
              </div>
            </div>
          ) : conferences.length === 0 ? (
            /* Clean Empty State when 0 conferences */
            <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-center border border-blue-100 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-blue-50 text-[#1560BD] mb-3 sm:mb-5">
                <Calendar className="w-7 h-7 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#0B1B33] mb-2 sm:mb-3">
                No Active Conferences
              </h2>
              <p className="text-base sm:text-xl text-gray-600 font-medium max-w-lg mx-auto mb-6 sm:mb-8">
                There are currently no Model United Nations conferences open for registration right now.
                Sign in as an organizer to set up your conference and launch registrations.
              </p>
              <Link href="/organizer/conferences">
                <button
                  type="button"
                  className="bg-[#FFD23F] text-[#0B1B33] px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl text-base sm:text-xl font-heading font-extrabold hover:bg-yellow-400 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Set Up Your Conference →
                </button>
              </Link>
            </div>
          ) : (
            /* Render active conferences */
            conferences.map((conf, index) => {
              const commsCount = conf.committees?.length || committees.length || 0;
              let seatsAvailable = 0;
              if (conf.committees) {
                conf.committees.forEach((c) => {
                  const openCount = c.portfolios?.filter((p) => p.status === "open").length;
                  seatsAvailable += openCount !== undefined ? openCount : c.total_seats;
                });
              } else {
                seatsAvailable = portfolios.filter((p) => p.status === "open").length || 0;
              }

              const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

              return (
                <div
                  key={conf.id}
                  className={`bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-blue-100 interactive-card reveal-item ${staggerClass}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-100">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2">
                        {conf.status === "published" ? "Open for Registrations" : "Registration Open"}
                      </div>
                      <h2 className="text-xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
                        {conf.name}
                      </h2>
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase">Delegate Fee</div>
                      <div className="text-xl sm:text-2xl font-heading font-extrabold text-[#1560BD]">
                        ₹{(conf.fee || 1500).toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        School team: ₹{(conf.school_fee_per_student || conf.fee || 1200).toLocaleString("en-IN")}/student
                      </div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 py-4 sm:py-6 border-b border-gray-100 text-[#0B1B33]">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#1560BD] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase">Dates</div>
                        <div className="text-sm sm:text-base font-bold">
                          {conf.dates || (conf.date_from ? `${conf.date_from} to ${conf.date_to}` : "Dates TBA")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#1560BD] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase">Venue</div>
                        <div className="text-sm sm:text-base font-bold line-clamp-2">
                          {conf.venue || "Main Auditorium"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#1560BD] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase">Committees & Seats</div>
                        <div className="text-sm sm:text-base font-bold">
                          {commsCount} Committees {seatsAvailable > 0 ? `• ${seatsAvailable} Open Seats` : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <Link
                      href={`/browse?event=${encodeURIComponent(conf.id)}`}
                      className="w-full sm:w-auto text-[#1560BD] hover:text-[#0F4C96] font-heading font-bold text-sm sm:text-base underline flex items-center justify-center gap-1.5 py-1 sm:py-2"
                    >
                      <Award className="w-4 h-4" />
                      Browse committee agendas & guides
                    </Link>

                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedConfForModal(conf.id)}
                        className="w-full sm:w-auto bg-[#FFD23F] text-[#0B1B33] px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl text-base sm:text-lg font-heading font-extrabold hover:bg-yellow-400 active:scale-95 transition-all text-center cursor-pointer"
                      >
                        Register for this MUN
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-blue-200 text-sm">
          Are you a school organizer?{" "}
          <Link href="/organizer/conferences" className="text-white underline font-bold ml-1 hover:text-yellow-300">
            Log in to manage or host a conference
          </Link>
        </div>
      </div>

      {/* Registration Mode Modal */}
      {selectedConfForModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1B33]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-[#0B1B33] border border-gray-200 animate-slideUp">
            <h3 className="text-2xl font-heading font-extrabold mb-1 text-[#0B1B33]">
              Choose Registration Type
            </h3>
            <p className="text-gray-500 text-sm mb-5 font-medium">
              Unique link: <span className="font-mono text-xs bg-slate-100 p-1 rounded font-bold text-[#1560BD] break-all">?event={selectedConfForModal}</span>
            </p>

            <div className="space-y-3 sm:space-y-4">
              <button
                type="button"
                onClick={() => router.push(`/register?event=${encodeURIComponent(selectedConfForModal)}`)}
                className="w-full p-4 sm:p-5 text-left border-2 border-gray-200 hover:border-[#1560BD] rounded-2xl transition-all duration-200 hover:bg-blue-50/50 cursor-pointer group"
              >
                <div className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33] group-hover:text-[#1560BD]">
                  Individual Delegate
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">
                  Pick 3 committee preferences and submit your portfolio preferences directly.
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/register/team?event=${encodeURIComponent(selectedConfForModal)}`)}
                className="w-full p-4 sm:p-5 text-left border-2 border-gray-200 hover:border-[#1560BD] rounded-2xl transition-all duration-200 hover:bg-blue-50/50 cursor-pointer group"
              >
                <div className="text-lg sm:text-xl font-heading font-extrabold text-[#0B1B33] group-hover:text-[#1560BD]">
                  School Delegation Team
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">
                  Head delegate or teacher coordinator registering multiple delegates with discounted fees.
                </div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}${window.location.pathname.startsWith("/Delegate") ? "/Delegate" : ""}/register?event=${encodeURIComponent(selectedConfForModal)}`;
                  navigator.clipboard?.writeText(link);
                  alert("Conference registration link copied!");
                }}
                className="text-[#1560BD] font-bold text-sm underline cursor-pointer"
              >
                Copy registration link
              </button>

              <button
                type="button"
                onClick={() => setSelectedConfForModal(null)}
                className="text-gray-500 hover:text-gray-800 font-bold text-base px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
