"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Calendar, MapPin, Users, Award, ExternalLink } from "lucide-react";

export default function AvailableConferencesPage() {
  const router = useRouter();
  const { event, committees, portfolios } = useApp();
  const [selectedConfForModal, setSelectedConfForModal] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Available Conferences | Delegate";
  }, []);

  // Active primary conference from database / state
  const primaryConference = {
    id: event.id || "primary-mun",
    name: event.name || "National Youth Model United Nations 2026",
    dates: event.dates || "March 14–16, 2026",
    venue: event.venue || "Main Auditorium, Campus Block A",
    fee: event.fee || 1500,
    schoolFee: event.schoolFeePerStudent || 1200,
    deadline: event.deadline || "March 1, 2026",
    status: "Open for Registrations",
    committeesCount: committees.length > 0 ? committees.length : 6,
    seatsLeft: portfolios.filter((p) => p.status === "open").length || 180,
    isPrimary: true,
  };

  // Additional available conferences on the platform
  const sampleConferences = [
    {
      id: "delhi-youth-summit-2026",
      name: "Delhi Youth Summit Model UN 2026",
      dates: "April 10–12, 2026",
      venue: "Sanskriti School Auditorium, Chanakyapuri",
      fee: 1600,
      schoolFee: 1300,
      deadline: "March 25, 2026",
      status: "Open for Registrations",
      committeesCount: 5,
      seatsLeft: 120,
      isPrimary: false,
    },
    {
      id: "national-inter-school-mun-2026",
      name: "National Inter-School Diplomacy Conference 2026",
      dates: "May 2–4, 2026",
      venue: "Convention Centre, New Delhi",
      fee: 1800,
      schoolFee: 1400,
      deadline: "April 15, 2026",
      status: "Open for Registrations",
      committeesCount: 8,
      seatsLeft: 240,
      isPrimary: false,
    },
  ];

  const allConferences = [primaryConference, ...sampleConferences];

  return (
    <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-4 py-8 sm:px-8 sm:py-12 text-white">
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
            Select a conference below to view committee portfolios and register.
          </p>
        </div>

        {/* Conferences List */}
        <div className="space-y-6 flex-1">
          {allConferences.map((conf) => (
            <div
              key={conf.id}
              className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 border border-blue-100 interactive-card transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-sm font-bold mb-2">
                    {conf.status}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
                    {conf.name}
                  </h2>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <div className="text-sm text-gray-500 font-semibold uppercase">Delegate Fee</div>
                  <div className="text-2xl font-heading font-extrabold text-[#1560BD]">
                    ₹{conf.fee.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    School team: ₹{conf.schoolFee.toLocaleString("en-IN")}/student
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-gray-100 text-[#0B1B33]">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#1560BD] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Dates</div>
                    <div className="text-base font-bold">{conf.dates}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#1560BD] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Venue</div>
                    <div className="text-base font-bold line-clamp-2">{conf.venue}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#1560BD] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Committees & Seats</div>
                    <div className="text-base font-bold">
                      {conf.committeesCount} Committees • {conf.seatsLeft} Open Seats
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
          ))}
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
