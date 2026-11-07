"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthLoaded } = useApp();

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
      onSuccess={() => {
        router.push("/organizer/conferences");
      }}
      onClose={() => {
        router.push("/");
      }}
    />
  );
}
