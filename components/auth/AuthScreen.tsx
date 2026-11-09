"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/Button";
import { DelegatoIcon, DelegatoWordmark, DelegatoHorizontalLogo } from "@/components/ui/DelegatoBrand";

interface AuthScreenProps {
  onSuccess?: () => void;
  onClose?: () => void;
  initialMode?: "login" | "signup";
}

export function AuthScreen({ onSuccess, onClose, initialMode = "login" }: AuthScreenProps) {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
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
    <div className="min-h-screen bg-[#1560BD] flex flex-col items-center justify-center p-3 sm:p-4">
      {/* Conference / Product Monogram & Brand */}
      <div className="w-full max-w-md my-auto py-2">
        {onClose && (
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs sm:text-sm cursor-pointer transition-colors backdrop-blur-md"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer transition-colors backdrop-blur-md"
            >
              ✕
            </button>
          </div>
        )}
        <div className="text-center mb-5 sm:mb-8 flex flex-col items-center">
          <div className="mb-2 sm:mb-3">
            <DelegatoHorizontalLogo className="h-12 sm:h-16 w-auto object-contain" />
          </div>
          <p className="text-blue-100 text-sm sm:text-base font-medium">
            Official MUN & Student Conference Platform
          </p>
        </div>

        {/* White Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-blue-200 interactive-card">
          {/* Animated Sliding Pill Segmented Switch */}
          <div className="tab-slider-container mb-4 sm:mb-6">
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
              className={`relative z-10 flex-1 text-center py-2 sm:py-2.5 text-base sm:text-lg font-heading font-bold transition-colors duration-200 cursor-pointer ${
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
              className={`relative z-10 flex-1 text-center py-2 sm:py-2.5 text-base sm:text-lg font-heading font-bold transition-colors duration-200 cursor-pointer ${
                mode === "signup" ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form key={mode} onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5 page-transition">
            <div className="reveal-item stagger-1">
              <label className="block text-[#0B1B33] text-sm sm:text-base font-bold mb-1 sm:mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="organizer@school.edu"
                required
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-base sm:text-lg text-[#0B1B33] input-smooth focus:border-[#1560BD] focus:outline-none"
              />
            </div>

            <div className="reveal-item stagger-2">
              <label className="block text-[#0B1B33] text-sm sm:text-base font-bold mb-1 sm:mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl text-base sm:text-lg text-[#0B1B33] input-smooth focus:border-[#1560BD] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 sm:p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-sm sm:text-base font-medium space-y-1 reveal-item stagger-3">
                <div className="font-bold">{errorMsg}</div>
                {errorMsg.toLowerCase().includes("disabled") && (
                  <p className="text-xs sm:text-sm text-red-700 font-normal mt-1">
                    Email signups are currently restricted. Please log in with existing credentials or contact the organizer.
                  </p>
                )}
              </div>
            )}

            <div className="reveal-item stagger-3 pt-1">
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

            {/* Terms and Conditions Legal Link */}
            <p className="text-[11px] sm:text-xs text-gray-500 text-center leading-normal pt-1">
              By continuing, you agree to Delegato&apos;s{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-[#1560BD] underline font-bold hover:text-blue-800"
              >
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </form>

          <div className="mt-4 pt-4 sm:mt-6 sm:pt-6 border-t border-gray-100 text-center">
            {mode === "login" ? (
              <p className="text-gray-600 text-sm sm:text-base">
                New organizer?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-[#1560BD] font-bold underline ml-1 cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-gray-600 text-sm sm:text-base">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#1560BD] font-bold underline ml-1 cursor-pointer"
                >
                  Log in to your conference
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Delegate options */}
        <div className="mt-5 sm:mt-8 text-center space-y-1.5 sm:space-y-2">
          <p className="text-blue-100 text-sm sm:text-base">Delegate attending a conference?</p>
          <div className="flex justify-center space-x-5 sm:space-x-6 text-sm sm:text-base flex-wrap">
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
              Check status
            </Link>
            <span className="text-blue-300">•</span>
            <Link
              href="/"
              className="text-white underline font-bold hover:text-yellow-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
