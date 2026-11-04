import React from "react";
import { Button } from "../ui/Button";

interface ReviewPreference {
  committeeName: string;
  portfolios: string[];
}

interface CredentialReviewProps {
  name: string;
  school: string;
  classYear: string;
  preferences: ReviewPreference[];
  fee: number;
  onChangeSomething: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function CredentialReview({
  name,
  school,
  classYear,
  preferences,
  fee,
  onChangeSomething,
  onConfirm,
  isSubmitting = false,
}: CredentialReviewProps) {
  return (
    <div className="w-full space-y-6">
      {/* Review Card styled exactly like Page 7 */}
      <div className="bg-white text-[#0B1B33] rounded-3xl p-6 sm:p-8 animate-slideUp">
        <div>
          <h3 className="text-3xl font-heading font-extrabold text-[#0B1B33]">
            {name}
          </h3>
          <p className="text-lg text-neutral-600 font-medium mt-1">
            {school}, Class {classYear}
          </p>
        </div>

        {preferences.map((pref, idx) => (
          <div key={idx}>
            <div className="border-t border-dashed border-neutral-300 my-5" />
            <div>
              <div className="text-xl font-heading font-extrabold text-[#0B1B33]">
                {idx + 1}. {pref.committeeName}
              </div>
              <div className="text-lg text-neutral-700 font-medium mt-1">
                {pref.portfolios.join(", ")}
              </div>
            </div>
          </div>
        ))}

        <div className="border-t border-dashed border-neutral-300 my-5" />

        <div className="flex items-center justify-between text-2xl font-heading font-extrabold text-[#0B1B33]">
          <span>Fee</span>
          <span>Rs {fee.toLocaleString()}</span>
        </div>
      </div>

      {/* Change something link */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onChangeSomething}
          className="text-xl font-heading font-bold text-[#FFD23F] hover:underline cursor-pointer"
        >
          Change something
        </button>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-4">
        <Button onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Confirming..." : "Confirm registration"}
        </Button>
      </div>
    </div>
  );
}
