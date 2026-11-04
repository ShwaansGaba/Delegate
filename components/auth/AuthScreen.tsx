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
        <div className="bg-white rounded-3xl p-8 border border-blue-200">
          <div className="flex border-b border-gray-200 mb-6 pb-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              className={`flex-1 text-center py-2 text-lg font-heading font-bold transition-colors ${
                mode === "login"
                  ? "text-[#1560BD] border-b-4 border-[#1560BD] -mb-2.5"
                  : "text-gray-400 hover:text-gray-700"
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
              className={`flex-1 text-center py-2 text-lg font-heading font-bold transition-colors ${
                mode === "signup"
                  ? "text-[#1560BD] border-b-4 border-[#1560BD] -mb-2.5"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#0B1B33] text-base font-bold mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="organizer@school.edu"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg text-[#0B1B33] focus:border-[#1560BD] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#0B1B33] text-base font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg text-[#0B1B33] focus:border-[#1560BD] focus:outline-none transition-colors"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-base font-medium">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                ? "Log in"
                : "Create account"}
            </Button>
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
