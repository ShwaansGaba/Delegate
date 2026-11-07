"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { AuthScreen } from "@/components/auth/AuthScreen";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthLoaded } = useApp();

  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";

  useEffect(() => {
    document.title = "Log in to Delegato";
  }, []);

  useEffect(() => {
    if (isAuthLoaded && user) {
      router.replace("/organizer/conferences");
    }
  }, [isAuthLoaded, user, router]);

  return (
    <AuthScreen
      initialMode={mode}
      onSuccess={() => {
        router.push("/organizer/conferences");
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1560BD]" />}>
      <LoginContent />
    </Suspense>
  );
}
