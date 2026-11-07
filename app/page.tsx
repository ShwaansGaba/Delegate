"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { DelegatoIcon } from "@/components/ui/DelegatoBrand";

export default function RootEntryPage() {
  const router = useRouter();
  const { user, isAuthLoaded } = useApp();

  useEffect(() => {
    document.title = "Delegato | Student Events & MUN Platform";
  }, []);

  // When organizer is signed in, redirect straight into My Conferences
  useEffect(() => {
    if (isAuthLoaded && user) {
      router.replace("/organizer/conferences");
    }
  }, [isAuthLoaded, user, router]);

  // Loading state while checking authentication credentials
  if (!isAuthLoaded) {
    return (
      <main className="min-h-screen bg-[#1560BD] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <DelegatoIcon size="lg" rounded="2xl" className="animate-pulse shadow-xl ring-2 ring-white/20" />
          <div className="text-xl font-heading font-extrabold text-blue-100">
            Loading Delegato...
          </div>
        </div>
      </main>
    );
  }

  // Not signed in: Show Delegato Auth Screen
  if (!user) {
    return (
      <AuthScreen
        onSuccess={() => {
          router.push("/organizer/conferences");
        }}
      />
    );
  }

  // Redirecting authenticated user to organizer conferences
  return (
    <main className="min-h-screen bg-[#1560BD] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <DelegatoIcon size="lg" rounded="2xl" className="animate-pulse shadow-xl ring-2 ring-white/20" />
        <div className="text-xl font-heading font-extrabold text-blue-100">
          Opening Conferences...
        </div>
      </div>
    </main>
  );
}
