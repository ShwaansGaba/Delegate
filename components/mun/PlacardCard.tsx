import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PlacardCardProps {
  committeeName: string;
  countryName: string;
  delegateName: string;
  schoolName: string;
  guideUrl?: string;
  onViewRegistration?: () => void;
}

export function PlacardCard({
  committeeName,
  countryName,
  delegateName,
  schoolName,
  guideUrl = "/guides/UNSC_Background_Guide.pdf",
  onViewRegistration,
}: PlacardCardProps) {
  return (
    <div className="w-full space-y-6 animate-slideUp">
      {/* Placard Card */}
      <div className="bg-white text-[#0B1B33] rounded-3xl p-8 sm:p-10 text-center interactive-card">
        <div className="text-xl sm:text-2xl font-heading font-extrabold uppercase tracking-wider text-neutral-800 mb-2">
          {committeeName}
        </div>
        <div className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold uppercase tracking-tight text-[#0B1B33] py-3 break-words">
          {countryName}
        </div>
        <div className="w-full border-t-2 border-[#0B1B33] my-6" />
        <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33]">
          {delegateName}
        </div>
        <div className="text-lg text-neutral-600 font-medium mt-1">
          {schoolName}
        </div>
      </div>

      <p className="text-xl text-white font-medium text-center">
        Your first committee and first portfolio.
      </p>

      {/* Action links */}
      <div className="space-y-4 pt-4">
        <a
          href={guideUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
        >
          <span className="text-xl font-heading font-extrabold">Background guide</span>
          <ArrowRight className="w-6 h-6 text-[#0B1B33]" strokeWidth={2.5} />
        </a>

        {onViewRegistration ? (
          <button
            type="button"
            onClick={onViewRegistration}
            className="w-full bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer text-left"
          >
            <span className="text-xl font-heading font-extrabold">Your registration</span>
            <ArrowRight className="w-6 h-6 text-[#0B1B33]" strokeWidth={2.5} />
          </button>
        ) : (
          <Link
            href="/status"
            className="bg-white text-[#0B1B33] rounded-2xl p-5 flex items-center justify-between hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
          >
            <span className="text-xl font-heading font-extrabold">Your registration</span>
            <ArrowRight className="w-6 h-6 text-[#0B1B33]" strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </div>
  );
}
