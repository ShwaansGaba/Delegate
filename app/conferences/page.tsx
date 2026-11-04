"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ArrowLeft, Calendar, MapPin, Users, Award } from "lucide-react";

interface DatabaseConference {
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
  const [conferences, setConferences] = useState<DatabaseConference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Available Conferences | Delegate";

    async function loadLiveConferences() {
      setLoading(true);
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .select("*, committees(*, portfolios(*))")
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            setConferences(data as DatabaseConference[]);
          } else if (event.name && event.name.trim()) {
            setConferences([
              {
                id: event.id,
                name: event.name,
                dates: event.dates,
                date_from: event.dateFrom,
                date_to: event.dateTo,
                venue: event.venue,
                fee: event.fee,
                school_fee_per_student: event.schoolFeePerStudent,
                deadline: event.deadline,
                deadline_date: event.deadlineDate,
                status: event.status,
                committees: committees.map((c) => ({
                  id: c.id,
                  name: c.name,
                  total_seats: c.totalSeats,
                  portfolios: portfolios.filter((p) => p.committeeId === c.id),
                })),
              },
            ]);
          } else {
            setConferences([]);
          }
        } catch {
          if (event.name && event.name.trim()) {
            setConferences([
              {
                id: event.id,
                name: event.name,
                dates: event.dates,
                venue: event.venue,
                fee: event.fee,
                school_fee_per_student: event.schoolFeePerStudent,
              },
            ]);
          } else {
            setConferences([]);
          }
        }
      } else if (event.name && event.name.trim()) {
        setConferences([
          {
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
          },
        ]);
      } else {
        setConferences([]);
      }
      setLoading(false);
    }

    loadLiveConferences();

    // Realtime listener for live database synchronization
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
  }, [event.name, event.id, committees, portfolios]);

  return (
    <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-4 py-8 sm:px-8 sm:py-12 text-white page-transition">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-blue-400/30">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-white hover:text-yellow-300 font-bold text-lg cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <Link
            href="/status"
            className="text-white hover:text-yellow-300 underline font-bold text-base"
          >
            Already registered? Check status
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-sm font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Delegate Registration Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
            Available MUN Conferences
          </h1>
          <p className="text-xl text-blue-100 font-medium mt-2">
            Conferences configured in the database appear here in real-time.
          </p>
        </div>

        {/* Conferences List */}
        <div className="space-y-6 flex-1">
          {loading ? (
            <div className="bg-white text-[#0B1B33] rounded-3xl p-12 text-center">
              <div className="text-2xl font-heading font-bold text-gray-700">
                Loading live database...
              </div>
            </div>
          ) : conferences.length === 0 ? (
            /* Clean Empty State when database has 0 conferences */
            <div className="bg-white text-[#0B1B33] rounded-3xl p-10 sm:p-14 text-center border border-blue-100 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-[#1560BD] mb-5">
                <Calendar className="w-10 h-10" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0B1B33] mb-3">
                No Active Conferences in Database
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 font-medium max-w-lg mx-auto mb-8">
                There are currently no Model United Nations conferences created in your Supabase database.
                Sign in as an organizer to set up your first conference and publish registrations.
              </p>
              <Link href="/">
                <button
                  type="button"
                  className="bg-[#FFD23F] text-[#0B1B33] px-8 py-4 rounded-xl text-xl font-heading font-extrabold hover:bg-yellow-400 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Set Up Your Conference →
                </button>
              </Link>
            </div>
          ) : (
            /* Render ONLY actual database conferences */
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
                  className={`bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 border border-blue-100 interactive-card reveal-item ${staggerClass}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                    <div>
                      <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-sm font-bold mb-2">
                        {conf.status === "published" ? "Open for Registrations" : "Registration Open"}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
                        {conf.name}
                      </h2>
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      <div className="text-sm text-gray-500 font-semibold uppercase">Delegate Fee</div>
                      <div className="text-2xl font-heading font-extrabold text-[#1560BD]">
                        ₹{(conf.fee || 1500).toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        School team: ₹{(conf.school_fee_per_student || conf.fee || 1200).toLocaleString("en-IN")}/student
                      </div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-gray-100 text-[#0B1B33]">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#1560BD] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase">Dates</div>
                        <div className="text-base font-bold">
                          {conf.dates || (conf.date_from ? `${conf.date_from} to ${conf.date_to}` : "Dates TBA")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#1560BD] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase">Venue</div>
                        <div className="text-base font-bold line-clamp-2">
                          {conf.venue || "Main Auditorium"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-[#1560BD] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500 font-bold uppercase">Committees & Seats</div>
                        <div className="text-base font-bold">
                          {commsCount} Committees {seatsAvailable > 0 ? `• ${seatsAvailable} Open Seats` : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                      href="/browse"
                      className="w-full sm:w-auto text-[#1560BD] hover:text-[#0F4C96] font-heading font-bold text-base underline flex items-center justify-center gap-1.5 py-2"
                    >
                      <Award className="w-4 h-4" />
                      Browse committee agendas & guides
                    </Link>

                    <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedConfForModal(conf.id)}
                        className="w-full sm:w-auto bg-[#FFD23F] text-[#0B1B33] px-6 py-3.5 rounded-xl text-lg font-heading font-extrabold hover:bg-yellow-400 active:scale-95 transition-all text-center cursor-pointer"
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
          <Link href="/" className="text-white underline font-bold ml-1 hover:text-yellow-300">
            Log in to manage or host a conference
          </Link>
        </div>
      </div>

      {/* Registration Mode Modal */}
      {selectedConfForModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1B33]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-[#0B1B33] border border-gray-200 animate-slideUp">
            <h3 className="text-2xl font-heading font-extrabold mb-2 text-[#0B1B33]">
              Choose Registration Type
            </h3>
            <p className="text-gray-600 text-base mb-6 font-medium">
              Are you registering as an individual delegate or with a school delegation?
            </p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="w-full p-5 text-left border-2 border-gray-200 hover:border-[#1560BD] rounded-2xl transition-all duration-200 hover:bg-blue-50/50 cursor-pointer group"
              >
                <div className="text-xl font-heading font-extrabold text-[#0B1B33] group-hover:text-[#1560BD]">
                  Individual Delegate
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">
                  Pick 3 committee preferences and submit your portfolio preferences directly.
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push("/register/team")}
                className="w-full p-5 text-left border-2 border-gray-200 hover:border-[#1560BD] rounded-2xl transition-all duration-200 hover:bg-blue-50/50 cursor-pointer group"
              >
                <div className="text-xl font-heading font-extrabold text-[#0B1B33] group-hover:text-[#1560BD]">
                  School Delegation Team
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">
                  Head delegate or teacher coordinator registering multiple delegates with discounted fees.
                </div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedConfForModal(null)}
                className="text-gray-500 hover:text-gray-800 font-bold text-base px-4 py-2 cursor-pointer"
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
