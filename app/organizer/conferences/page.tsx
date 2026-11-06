"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { EventModel } from "@/lib/types";
import { getConferencePublicLink } from "@/lib/registrationLinks";
import { Plus, ArrowRight, Copy, Check, Calendar, MapPin, Users, Settings, Trash2, Lock } from "lucide-react";

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
  const [confToDelete, setConfToDelete] = useState<EventModel | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCopyLink = (conf: EventModel) => {
    const link = getConferencePublicLink(conf.slug || conf.id);
    navigator.clipboard?.writeText(link);
    setCopiedId(conf.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenConference = async (conf: EventModel) => {
    await selectConference(conf.id);
    router.push("/organizer");
  };

  const handleCreateNew = async () => {
    setIsCreating(true);
    const newConf = await createNewConference({
      name: "",
      status: "draft",
    });
    setIsCreating(false);
    if (newConf) {
      router.push("/organizer/setup?step=basics");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 sm:pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white">
            My Conferences
          </h1>
          <p className="text-blue-100 text-xs sm:text-base font-medium mt-0.5">
            Conferences managed under your organizer account ({myConferences.length})
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          disabled={isCreating}
          className="bg-[#FFD23F] hover:bg-yellow-400 text-[#0B1B33] px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl font-heading font-extrabold text-xs sm:text-base flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
          <span>{isCreating ? "Creating..." : "Create New Conference"}</span>
        </button>
      </div>

      {/* Conferences List */}
      {(() => {
        const visibleConferences = myConferences.filter(
          (c) => c.name && c.name.trim().length > 0 && c.id !== "new-conference"
        );

        if (visibleConferences.length === 0) {
          return (
            <div className="bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center space-y-3 sm:space-y-4 max-w-lg mx-auto shadow-sm">
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold">No conferences yet</h3>
              <p className="text-neutral-600 font-medium text-xs sm:text-base">
                Create your first MUN conference to set up committees, portfolios, and start accepting delegate registrations.
              </p>
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={isCreating}
                className="bg-[#1560BD] hover:bg-[#0F4C96] text-white px-5 py-3 rounded-xl sm:rounded-2xl font-heading font-extrabold text-sm sm:text-base transition-colors cursor-pointer"
              >
                Create Your First Conference
              </button>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {visibleConferences.map((conf) => {
              const isActive = conf.id === event.id;
              const isPublished = conf.status === "published";
              const isClosed = conf.status === "closed";
              const publicLink = getConferencePublicLink(conf.slug || conf.id);

              return (
                <div
                  key={conf.id}
                  className={`bg-white text-[#0B1B33] rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 transition-all duration-200 border-2 ${
                    isActive ? "border-[#FFD23F] ring-2 ring-yellow-400/30" : "border-transparent"
                  }`}
                >
                  {/* Status & Active badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs uppercase font-extrabold px-2.5 py-1 rounded-lg ${
                          isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : isClosed
                            ? "bg-neutral-200 text-neutral-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isPublished ? "Published" : isClosed ? "Closed" : "In Setup (Draft)"}
                      </span>
                      {isActive && (
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                          Active in portal
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-heading font-extrabold text-[#1560BD]">
                      ₹{(conf.fee || 1500).toLocaleString()}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0B1B33] leading-tight">
                      {conf.name}
                    </h3>
                    <div className="text-xs text-neutral-400 font-mono mt-0.5 truncate">
                      ID: {conf.id}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs sm:text-sm text-neutral-600 font-medium">
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

                  {/* Public Link Box: ONLY show link and copy button if published */}
                  {isPublished ? (
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-xs flex items-center justify-between gap-2">
                      <span className="font-mono text-neutral-600 truncate">{publicLink}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(conf)}
                        className="shrink-0 font-heading font-extrabold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === conf.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-200/80 text-xs flex items-center gap-2 text-amber-800">
                      <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span className="font-medium">Registration link locked until setup is published</span>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                    {isPublished ? (
                      <button
                        type="button"
                        onClick={() => handleOpenConference(conf)}
                        className="flex-1 bg-[#1560BD] hover:bg-[#0F4C96] text-white py-2.5 px-4 rounded-xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          await selectConference(conf.id);
                          router.push("/organizer/setup?step=basics");
                        }}
                        className="flex-1 bg-[#FFD23F] hover:bg-yellow-400 text-[#0B1B33] py-2.5 px-4 rounded-xl font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Continue Setup →</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        await selectConference(conf.id);
                        router.push("/organizer/setup?step=basics");
                      }}
                      className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs sm:text-sm cursor-pointer"
                      title="Setup & Rules"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfToDelete(conf)}
                      className="p-2.5 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-heading font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Delete Conference"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Delete Conference Confirmation Modal */}
      {confToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-[#0B1B33] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-2xl font-heading font-extrabold text-red-600">
                Delete Conference?
              </h3>
              <button
                type="button"
                onClick={() => setConfToDelete(null)}
                className="text-neutral-400 hover:text-black p-1 text-2xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-neutral-600 font-medium text-base leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0B1B33]">{confToDelete.name || "this conference"}</strong>?
              This will permanently delete all its committees, country portfolios, and delegate registrations. This action cannot be undone.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfToDelete(null)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = confToDelete.id;
                  setConfToDelete(null);
                  await deleteConference(id);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-heading font-extrabold text-sm transition-colors cursor-pointer"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
