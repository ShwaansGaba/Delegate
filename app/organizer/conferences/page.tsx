"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { EventModel } from "@/lib/types";
import { getConferencePublicLink } from "@/lib/registrationLinks";
import { Plus, ArrowRight, Copy, Check, Calendar, MapPin, Users, Settings } from "lucide-react";

export default function MyConferencesPage() {
  const router = useRouter();
  const {
    myConferences,
    event,
    selectConference,
    createNewConference,
    deleteConference,
  } = useApp();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDateFrom, setNewDateFrom] = useState("2026-11-20");
  const [newDateTo, setNewDateTo] = useState("2026-11-22");
  const [newVenue, setNewVenue] = useState("Campus Auditorium");
  const [newFee, setNewFee] = useState("1800");
  const [newSchoolFee, setNewSchoolFee] = useState("1400");
  const [newDeadline, setNewDeadline] = useState("2026-11-15");

  const handleCopyLink = (conf: EventModel) => {
    const link = getConferencePublicLink(conf.slug || conf.id);
    navigator.clipboard?.writeText(link);
    setCopiedId(conf.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenConference = async (confId: string) => {
    await selectConference(confId);
    router.push("/organizer");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newConf = await createNewConference({
      name: newName.trim(),
      dateFrom: newDateFrom,
      dateTo: newDateTo,
      dates: `${newDateFrom} to ${newDateTo}`,
      venue: newVenue.trim(),
      fee: Number(newFee) || 1500,
      schoolFeePerStudent: Number(newSchoolFee) || 1200,
      deadline: newDeadline,
      deadlineDate: newDeadline,
    });

    setShowCreateModal(false);
    setNewName("");
    if (newConf) {
      router.push("/organizer/setup");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            My Conferences
          </h1>
          <p className="text-blue-100 text-sm sm:text-base font-medium mt-1">
            Conferences managed under your organizer account ({myConferences.length})
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-[#FFD23F] hover:bg-yellow-400 text-[#0B1B33] px-5 py-3 rounded-2xl font-heading font-extrabold text-base flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          <span>Create New Conference</span>
        </button>
      </div>

      {/* Conferences List */}
      {myConferences.length === 0 ? (
        <div className="bg-white text-[#0B1B33] rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
          <h3 className="text-2xl font-heading font-extrabold">No conferences yet</h3>
          <p className="text-neutral-600 font-medium text-base">
            Create your first MUN conference to set up committees, portfolios, and start accepting delegate registrations.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1560BD] hover:bg-[#0F4C96] text-white px-6 py-3.5 rounded-2xl font-heading font-extrabold text-base transition-colors cursor-pointer"
          >
            Create Conference Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myConferences.map((conf) => {
            const isActive = conf.id === event.id;
            const publicLink = getConferencePublicLink(conf.slug || conf.id);

            return (
              <div
                key={conf.id}
                className={`bg-white text-[#0B1B33] rounded-3xl p-6 space-y-5 transition-all duration-200 border-2 ${
                  isActive ? "border-[#FFD23F] ring-2 ring-yellow-400/30" : "border-transparent"
                }`}
              >
                {/* Status & Active badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs uppercase font-extrabold px-2.5 py-1 rounded-lg ${
                        conf.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : conf.status === "closed"
                          ? "bg-neutral-200 text-neutral-700"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {conf.status === "published"
                        ? "Published"
                        : conf.status === "closed"
                        ? "Closed"
                        : "Draft"}
                    </span>
                    {isActive && (
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Active in portal
                      </span>
                    )}
                  </div>

                  <span className="text-sm font-heading font-extrabold text-[#1560BD]">
                    ₹{(conf.fee || 2500).toLocaleString()}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-2xl font-heading font-extrabold text-[#0B1B33] leading-tight">
                    {conf.name}
                  </h3>
                  <div className="text-xs text-neutral-400 font-mono mt-1 truncate">
                    ID: {conf.id}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm text-neutral-600 font-medium">
                  {conf.dates && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{conf.dates}</span>
                    </div>
                  )}
                  {conf.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="truncate">{conf.venue}</span>
                    </div>
                  )}
                </div>

                {/* Public Link Box */}
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs flex items-center justify-between gap-2">
                  <span className="font-mono text-neutral-600 truncate">{publicLink}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(conf)}
                    className="shrink-0 font-heading font-extrabold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1"
                  >
                    {copiedId === conf.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenConference(conf.id)}
                    className="flex-1 bg-[#1560BD] hover:bg-[#0F4C96] text-white py-2.5 px-4 rounded-xl font-heading font-extrabold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await selectConference(conf.id);
                      router.push("/organizer/setup");
                    }}
                    className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-sm cursor-pointer"
                    title="Setup & Rules"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Conference Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-[#0B1B33] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                  Create New MUN Conference
                </h3>
                <p className="text-neutral-500 text-sm font-medium mt-0.5">
                  This conference will be isolated to your organizer account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-black p-1 text-2xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                  Conference Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Model UN 2026"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-neutral-200 text-base font-bold outline-none focus:border-[#1560BD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newDateFrom}
                    onChange={(e) => setNewDateFrom(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newDateTo}
                    onChange={(e) => setNewDateTo(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                  Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium, City Campus"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                    Individual Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                    School Fee (₹/student)
                  </label>
                  <input
                    type="number"
                    value={newSchoolFee}
                    onChange={(e) => setNewSchoolFee(e.target.value)}
                    className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-neutral-600 mb-1 tracking-wider">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-bold outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1560BD] hover:bg-[#0F4C96] text-white px-6 py-2.5 rounded-xl font-heading font-extrabold text-sm transition-colors cursor-pointer"
                >
                  Create Conference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
