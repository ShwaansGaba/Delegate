"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/Button";

interface AuthScreenProps {
  onSuccess?: () => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        const res = await signIn(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onSuccess?.();
        }
      } else {
        const res = await signUp(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onSuccess?.();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1560BD] flex flex-col items-center justify-center p-4">
      {/* Conference / Product Monogram */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-[#1560BD] font-heading font-extrabold text-2xl mb-4">
            UN
          </div>
          <h1 className="text-4xl text-white font-heading font-extrabold tracking-tight">
            Delegate
          </h1>
          <p className="text-blue-100 text-lg mt-2 font-medium">
            Student Events & Conference Platform
          </p>
        </div>

        {/* White Card */}
        <div className="bg-white rounded-3xl p-8 border border-blue-200 interactive-card">
          {/* Animated Sliding Pill Segmented Switch */}
          <div className="tab-slider-container mb-6">
            <div
              className="tab-slider-indicator"
              style={{
                left: mode === "login" ? "0.35rem" : "calc(50% + 0.15rem)",
                width: "calc(50% - 0.5rem)",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              className={`relative z-10 flex-1 text-center py-2.5 text-lg font-heading font-bold transition-colors duration-200 cursor-pointer ${
                mode === "login" ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
              }}
              className={`relative z-10 flex-1 text-center py-2.5 text-lg font-heading font-bold transition-colors duration-200 cursor-pointer ${
                mode === "signup" ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form key={mode} onSubmit={handleSubmit} className="space-y-5 page-transition">
            <div className="reveal-item stagger-1">
              <label className="block text-[#0B1B33] text-base font-bold mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="organizer@school.edu"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg text-[#0B1B33] input-smooth focus:border-[#1560BD] focus:outline-none"
              />
            </div>

            <div className="reveal-item stagger-2">
              <label className="block text-[#0B1B33] text-base font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg text-[#0B1B33] input-smooth focus:border-[#1560BD] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-base font-medium space-y-1 reveal-item stagger-3">
                <div className="font-bold">{errorMsg}</div>
                {errorMsg.toLowerCase().includes("disabled") && (
                  <p className="text-sm text-red-700 font-normal mt-1">
                    To enable: Go to{" "}
                    <a
                      href="https://supabase.com/dashboard/project/znhbotfzmmrsibazlraw/auth/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold"
                    >
                      Supabase Dashboard → Authentication → Providers → Email
                    </a>
                    , toggle <strong>Enable Email provider</strong> to <strong>ON</strong>, and click <strong>Save</strong>.
                  </p>
                )}
              </div>
            )}

            <div className="reveal-item stagger-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                className="tactile-btn"
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "login"
                  ? "Log in"
                  : "Create account"}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            {mode === "login" ? (
              <p className="text-gray-600 text-base">
                New organizer?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-[#1560BD] font-bold underline ml-1"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-gray-600 text-base">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#1560BD] font-bold underline ml-1"
                >
                  Log in to your conference
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Delegate options */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-blue-100 text-base">Delegate attending a conference?</p>
          <div className="flex justify-center space-x-6 text-base">
            <Link
              href="/conferences"
              className="text-white underline font-bold hover:text-yellow-200"
            >
              Register for MUN
            </Link>
            <span className="text-blue-300">•</span>
            <Link
              href="/status"
              className="text-white underline font-bold hover:text-yellow-200"
            >
              Check allotment status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
