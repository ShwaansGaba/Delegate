"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { event, registrations, committees, portfolios } = useApp();
  const [filter, setFilter] = useState<"all" | "unpaid" | "first_comm">("all");

  const totalRegistered = registrations.length;
  const paidCount = registrations.filter((r) => r.paymentStatus === "verified").length;
  const unpaidCount = registrations.filter((r) => r.paymentStatus !== "verified").length;
  const notAllottedCount = registrations.filter((r) => !r.allotment).length;

  const firstComm = committees[0];

  const filteredRegistrations = registrations.filter((r) => {
    if (filter === "unpaid") return r.paymentStatus !== "verified";
    if (filter === "first_comm" && firstComm) {
      return r.preferences.some((p) => p.committeeId === firstComm.id);
    }
    return true;
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white">
            Dashboard
          </h1>
          <p className="text-blue-100 text-sm font-medium mt-1">
            {event.name || "Conference Overview"}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Button
            size="md"
            fullWidth={false}
            onClick={() => router.push("/organizer/allotment")}
            className="w-full sm:w-auto px-8"
          >
            Go to allotment
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards matching Page 17 & 22 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value={totalRegistered}
          label="Registered"
          onClick={() => router.push("/organizer/registrations")}
        />
        <StatCard
          value={paidCount}
          label="Paid"
          onClick={() => router.push("/organizer/registrations?filter=paid")}
        />
        <StatCard
          value={unpaidCount}
          label="Unpaid"
          onClick={() => router.push("/organizer/registrations?filter=unpaid")}
        />
        <StatCard
          value={notAllottedCount}
          label="Not allotted"
          onClick={() => router.push("/organizer/allotment")}
        />
      </div>

      {/* Filter Chips for Mobile / quick filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-5 py-2.5 rounded-2xl text-lg font-heading font-extrabold transition-colors cursor-pointer capitalize ${
            filter === "all"
              ? "bg-white text-[#0B1B33]"
              : "border-2 border-white text-white hover:bg-white/10"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("unpaid")}
          className={`px-5 py-2.5 rounded-2xl text-lg font-heading font-extrabold transition-colors cursor-pointer capitalize ${
            filter === "unpaid"
              ? "bg-white text-[#0B1B33]"
              : "border-2 border-white text-white hover:bg-white/10"
          }`}
        >
          Unpaid
        </button>
        {firstComm && (
          <button
            type="button"
            onClick={() => setFilter("first_comm")}
            className={`px-5 py-2.5 rounded-2xl text-lg font-heading font-extrabold transition-colors cursor-pointer capitalize ${
              filter === "first_comm"
                ? "bg-white text-[#0B1B33]"
                : "border-2 border-white text-white hover:bg-white/10"
            }`}
          >
            {firstComm.name}
          </button>
        )}
      </div>

      {/* Main Grid: Latest Registrations (Left) + Seats Filled (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Registrations Card (2 Cols on desktop) */}
        <div className="lg:col-span-2 bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
              Latest registrations
            </h2>
            <Link
              href="/organizer/registrations"
              className="text-base font-heading font-bold text-[#1560BD] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-heading font-bold text-base">
                  <th className="pb-3 pr-4">Delegate</th>
                  <th className="pb-3 px-4 hidden sm:table-cell">First choice</th>
                  <th className="pb-3 pl-4 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredRegistrations.slice(0, 6).map((reg) => {
                  const firstComm =
                    committees.find((c) => c.id === reg.preferences[0]?.committeeId)?.name || "UNSC";
                  const isPaid = reg.paymentStatus === "verified";

                  return (
                    <tr
                      key={reg.id}
                      onClick={() => router.push(`/organizer/registrations?id=${reg.id}`)}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="text-lg font-heading font-extrabold text-[#0B1B33]">
                          {reg.delegateName}
                        </div>
                        <div className="text-base text-neutral-600 font-medium">
                          {reg.school}
                        </div>
                        <div className="text-sm text-neutral-500 sm:hidden mt-0.5">
                          {firstComm} first
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell text-lg font-medium text-neutral-800">
                        {firstComm} first
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <span
                          className={`inline-block text-lg font-heading font-extrabold ${
                            isPaid ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seats Filled Card (1 Col on desktop) matching Page 22 */}
        <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
            Seats filled
          </h2>

          <div className="space-y-6">
            {committees.length === 0 ? (
              <p className="text-neutral-500 font-medium">No committees added yet.</p>
            ) : (
              committees.slice(0, 6).map((comm) => {
                const commPorts = portfolios.filter((p) => p.committeeId === comm.id);
                // Count actual allotments from registrations
                const filled = registrations.filter((r) => r.allotment?.committeeId === comm.id).length;
                const totalSeats = Math.max(comm.totalSeats || 0, commPorts.length, 1);
                const percent = Math.min(100, Math.round((filled / totalSeats) * 100));

                return (
                  <div key={comm.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xl font-heading font-extrabold text-[#0B1B33]">
                      <span>{comm.name}</span>
                      <span className="text-neutral-700 font-bold">
                        {filled} of {totalSeats}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1560BD] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/organizer/allotment")}
            >
              Go to allotment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
