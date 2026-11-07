"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Row } from "@/components/ui/Row";

export default function ConfirmationPage() {
  const router = useRouter();
  const { event, loadEventById, findRegistrationByNumber, verifyPayment } = useApp();

  const [regNum, setRegNum] = useState("MUN 2048");
  const [proofUploaded, setProofUploaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Registration Confirmed | Delegato";
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const num = sp.get("num");
      if (num) setRegNum(num);
      const evParam = sp.get("event") || sp.get("eventId");
      if (evParam && evParam !== event.id) {
        loadEventById(evParam);
      }
    }
  }, [event.id, loadEventById]);

  const registration = findRegistrationByNumber(regNum);
  const feeAmount = registration?.feeAmount || event.fee;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofUploaded(true);
      if (registration) {
        verifyPayment(registration.id);
      }
    }
  };

  const handleOnlinePayPlaceholder = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setProofUploaded(true);
      if (registration) {
        verifyPayment(registration.id);
      }
      alert("UPI / Card payment simulated successfully. Payment verified!");
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#1560BD] flex flex-col justify-between px-6 py-12 sm:px-8 sm:py-16">
      <div className="max-w-md w-full mx-auto space-y-8 flex-1 flex flex-col justify-center">
        {/* Title */}
        <div>
          <h1 className="text-5xl sm:text-6xl font-heading font-extrabold text-white leading-tight">
            We have your <br />
            registration.
          </h1>
        </div>

        {/* RECEIVED Stamp Badge matching Page 9 */}
        <div>
          <div className="inline-block border-4 border-[#FFD23F] text-[#FFD23F] font-heading font-extrabold text-3xl px-6 py-2 rounded-xl uppercase tracking-widest -rotate-2 select-none animate-pop hover:rotate-0 transition-transform duration-300">
            RECEIVED
          </div>
        </div>

        {/* Number Block */}
        <div className="space-y-1">
          <p className="text-2xl text-white font-medium">Your number is</p>
          <div className="text-5xl sm:text-6xl font-heading font-extrabold text-white tracking-tight">
            {regNum}
          </div>
        </div>

        {/* Payment CTA */}
        <div className="space-y-4 pt-2">
          <p className="text-2xl font-heading font-extrabold text-white">
            Pay Rs {feeAmount.toLocaleString()} to hold your seat
          </p>

          <Row
            title="Pay online"
            onClick={handleOnlinePayPlaceholder}
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />

          <Row
            title={proofUploaded ? "Proof uploaded ✓" : "Upload proof"}
            subtitle="Camera or gallery"
            onClick={() => fileInputRef.current?.click()}
          />
        </div>

        {/* Hold deadline text */}
        <div className="space-y-4 pt-2">
          <p className="text-xl text-white font-medium leading-relaxed">
            Your choices are held until {event.deadline}.
          </p>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href={`/status?num=${encodeURIComponent(regNum)}`}
              className="text-xl font-heading font-extrabold text-[#FFD23F] hover:underline"
            >
              Check status with this number →
            </Link>
            <Link
              href="/"
              className="text-lg text-white/80 hover:text-white underline font-medium"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
