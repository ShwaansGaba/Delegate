"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export default function BrowseCommitteesPage() {
  const router = useRouter();
  const { committees, portfolios, event, loadEventById } = useApp();
  const [expandedId, setExpandedId] = useState<string>("disec");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const evParam = sp.get("event") || sp.get("eventId");
      if (evParam && evParam !== event.id) {
        loadEventById(evParam);
      }
    }
  }, [event.id, loadEventById]);

  useEffect(() => {
    document.title = event.name ? `Committees - ${event.name} | Delegate` : "Committees | Delegate";
  }, [event.name]);

  return (
    <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-12 overflow-x-hidden">
      <div className="max-w-[350px] sm:max-w-md w-full mx-auto flex-1 flex flex-col">
        {/* Progress & Back arrow */}
        <ProgressBar
          currentStep={1}
          totalSteps={1}
          onBack={() => router.push("/conferences")}
        />

        <div className="my-5">
          <div className="text-xs uppercase tracking-wider text-blue-200 font-bold mb-1">
            {event.name || "Conference Directory"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            Committees & Agendas
          </h1>
          {event.dates && (
            <p className="text-blue-100 text-sm mt-1 font-medium">{event.dates} • {event.venue || "Campus Venue"}</p>
          )}
        </div>

        {/* Committees List */}
        <div className="space-y-4 flex-1">
          {committees.map((comm) => {
            const commPorts = portfolios.filter((p) => p.committeeId === comm.id);
            const openPorts = commPorts.filter((p) => p.status === "open");
            const takenPorts = commPorts.filter((p) => p.status === "taken");
            
            // Vacancies based on live portfolios
            const seatsLeft = openPorts.length > 0 ? openPorts.length : Math.max(0, comm.totalSeats - takenPorts.length);

            const isExpanded = expandedId === comm.id;

            return (
              <div
                key={comm.id}
                className="bg-white text-[#0B1B33] rounded-2xl overflow-hidden interactive-card transition-all duration-300"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? "" : comm.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-2xl font-heading font-extrabold">{comm.name}</span>
                  <span className="text-xl font-heading font-bold text-neutral-800">
                    {seatsLeft} left
                  </span>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-4 border-t border-neutral-100 animate-slideDown">
                    {comm.agenda && (
                      <p className="text-base text-neutral-600 font-medium">
                        {comm.agenda}
                      </p>
                    )}
                    <div>
                      <span className="font-heading font-extrabold text-lg text-[#0B1B33]">
                        Open:{" "}
                      </span>
                      <span className="text-lg text-neutral-800 font-medium">
                        {openPorts.slice(0, 6).map((p) => p.countryName).join(", ") || "All positions filled"}
                      </span>
                    </div>

                    {takenPorts.length > 0 && (
                      <div>
                        <span className="font-heading font-extrabold text-lg text-neutral-700">
                          Taken:{" "}
                        </span>
                        <span className="text-lg text-neutral-500 font-medium line-through">
                          {takenPorts.slice(0, 4).map((p) => p.countryName).join(", ")}
                        </span>
                      </div>
                    )}

                    <div className="pt-1">
                      <a
                        href={comm.backgroundGuideUrl || "/guides/UNSC_Background_Guide.pdf"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-heading font-bold text-[#1560BD] underline hover:text-[#0F4C96]"
                      >
                        Read the guide
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Yellow Register Button */}
        <div className="pt-8 pb-4">
          <Button onClick={() => router.push(event.id ? `/register?event=${encodeURIComponent(event.id)}` : "/register")}>
            Register for this MUN
          </Button>
        </div>
      </div>
    </main>
  );
}
