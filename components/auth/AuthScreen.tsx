"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/Button";
import { DelegatoHorizontalLogo } from "@/components/ui/DelegatoBrand";
import { ArrowLeft, CheckCircle2, RotateCcw, ShieldCheck, Mail, KeyRound } from "lucide-react";

interface AuthScreenProps {
  onSuccess?: () => void;
  onClose?: () => void;
  initialMode?: "login" | "signup";
}

type AuthMode = "login" | "signup" | "verify_otp" | "forgot_password" | "recovery_otp";

export function AuthScreen({ onSuccess, onClose, initialMode = "login" }: AuthScreenProps) {
  const {
    signIn,
    signUp,
    verifyOtp,
    resendOtp,
    resetPasswordForEmail,
    verifyRecoveryOtp,
  } = useApp();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Refs for the 6 individual OTP input boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer for resend OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first OTP input when entering verify mode
  useEffect(() => {
    if (mode === "verify_otp" || mode === "recovery_otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [mode]);

  // Handle Login or Signup submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
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
        const res = await signIn(cleanEmail, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onSuccess?.();
        }
      } else {
        const res = await signUp(cleanEmail, password);
        if (res.status === "already_exists") {
          setMode("login");
          setErrorMsg(res.error || "This email is already registered. Please sign in with your password.");
        } else if (res.status === "logged_in") {
          onSuccess?.();
        } else if (res.status === "verify_otp") {
          setMode("verify_otp");
          setOtpDigits(["", "", "", "", "", ""]);
          setCooldown(60);
          setSuccessMsg(`We sent a 6-digit verification code to ${cleanEmail}`);
        } else if (res.error) {
          setErrorMsg(res.error);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP 6-box input changes
  const handleOtpChange = (index: number, value: string) => {
    setErrorMsg("");
    const cleaned = value.replace(/\D/g, "");

    // Handle full paste (e.g. 6 digits pasted into any box)
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split("");
      const next = [...otpDigits];
      pasted.forEach((char, i) => {
        if (index + i < 6) {
          next[index + i] = char;
        }
      });
      setOtpDigits(next);
      const nextFocus = Math.min(5, index + pasted.length);
      otpInputRefs.current[nextFocus]?.focus();

      // If full 6 digits are now filled, trigger verification
      if (next.every((d) => d.length === 1)) {
        submitOtp(next.join(""));
      }
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned.slice(-1);
    setOtpDigits(next);

    // Auto-advance to next box
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last box is filled
    if (cleaned && index === 5 && next.every((d) => d.length === 1)) {
      submitOtp(next.join(""));
    }
  };

  // Handle backspace navigation in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Submit 6-digit OTP verification
  const submitOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length < 6) {
      setErrorMsg("Please enter all 6 digits of your verification code.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      if (mode === "verify_otp") {
        const res = await verifyOtp(email, code);
        if (res.success) {
          onSuccess?.();
        } else {
          setErrorMsg(res.error || "Invalid verification code. Please check and try again.");
        }
      } else if (mode === "recovery_otp") {
        if (newPassword.length < 6) {
          setErrorMsg("New password must be at least 6 characters.");
          setIsSubmitting(false);
          return;
        }
        const res = await verifyRecoveryOtp(email, code, newPassword);
        if (res.success) {
          onSuccess?.();
        } else {
          setErrorMsg(res.error || "Invalid recovery code.");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP code
  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);
    try {
      if (mode === "recovery_otp") {
        await resetPasswordForEmail(email);
      } else {
        await resendOtp(email);
      }
      setCooldown(60);
      setSuccessMsg("A fresh 6-digit code has been sent to your email.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend code";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const res = await resetPasswordForEmail(cleanEmail);
      if (res.success) {
        setMode("recovery_otp");
        setOtpDigits(["", "", "", "", "", ""]);
        setCooldown(60);
        setSuccessMsg(`We sent a 6-digit recovery code to ${cleanEmail}`);
      } else {
        setErrorMsg(res.error || "Could not send reset code. Please verify your email.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1560BD] flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md my-auto py-2">
        {onClose && (
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs sm:text-sm cursor-pointer transition-colors backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
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

        {/* Brand Header */}
        <div className="text-center mb-5 sm:mb-8 flex flex-col items-center">
          <div className="mb-2 sm:mb-3">
            <DelegatoHorizontalLogo className="h-12 sm:h-16 w-auto object-contain" />
          </div>
          <p className="text-blue-100 text-sm sm:text-base font-medium">
            Official MUN &amp; Student Conference Platform
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-blue-200 shadow-2xl interactive-card text-[#0B1B33]">
          {/* ========================================================================= */}
          {/* VIEW A: 6-DIGIT OTP VERIFICATION SCREEN (SIGNUP / RECOVERY)                */}
          {/* ========================================================================= */}
          {mode === "verify_otp" || mode === "recovery_otp" ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#FFD23F] flex items-center justify-center mx-auto text-2xl shadow-inner border border-amber-200">
                  <ShieldCheck className="w-6 h-6 text-[#1560BD]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] tracking-tight">
                  Enter 6-Digit Code
                </h2>
                <p className="text-neutral-600 text-xs sm:text-sm font-medium">
                  We sent a 6-digit code to <span className="font-bold text-[#1560BD]">{email}</span>
                </p>
              </div>

              {/* 6 Individual Digit Inputs with Auto-Focus */}
              <div className="flex justify-center gap-2 sm:gap-2.5 pt-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1B33] bg-neutral-50 border-2 border-neutral-200 rounded-xl sm:rounded-2xl outline-none focus:border-[#1560BD] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
                  />
                ))}
              </div>

              {/* In recovery mode, also ask for new password */}
              {mode === "recovery_otp" && (
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-bold text-neutral-700">
                    New password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#1560BD]"
                  />
                </div>
              )}

              {/* Alerts */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-bold animate-shake">
                  {errorMsg}
                </div>
              )}
              {successMsg && !errorMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="button"
                onClick={() => submitOtp()}
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting || otpDigits.join("").length < 6}
                className="tactile-btn py-3.5"
              >
                {isSubmitting
                  ? "Verifying..."
                  : mode === "recovery_otp"
                  ? "Reset Password & Log In"
                  : "Verify & Enter Dashboard"}
              </Button>

              {/* Resend & Change Email controls */}
              <div className="pt-2 text-center space-y-2 text-xs sm:text-sm">
                <div>
                  {cooldown > 0 ? (
                    <span className="text-neutral-400 font-medium">
                      Resend code in <strong className="text-neutral-700 font-bold">{cooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSubmitting}
                      className="text-[#1560BD] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend 6-digit code</span>
                    </button>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="text-neutral-500 hover:text-neutral-800 font-medium underline cursor-pointer text-xs"
                  >
                    Wrong email? Change email
                  </button>
                </div>
              </div>
            </div>
          ) : mode === "forgot_password" ? (
            /* ========================================================================= */
            /* VIEW B: FORGOT PASSWORD REQUEST SCREEN                                    */
            /* ========================================================================= */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1560BD] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-heading font-extrabold text-[#0B1B33]">
                  Reset Password
                </h2>
                <p className="text-neutral-500 text-xs sm:text-sm">
                  Enter your registered organizer email and we will send you a 6-digit recovery code.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="organizer@school.edu"
                  required
                  className="w-full p-3 sm:p-3.5 border-2 border-gray-200 rounded-xl text-base text-[#0B1B33] focus:border-[#1560BD] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-bold">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                className="tactile-btn"
              >
                {isSubmitting ? "Sending code..." : "Send Recovery Code"}
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg("");
                  }}
                  className="text-xs sm:text-sm font-bold text-[#1560BD] hover:underline cursor-pointer"
                >
                  ← Back to Log In
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* VIEW C: STANDARD LOGIN & SIGN UP (STEP 1)                                */
            /* ========================================================================= */
            <div>
              {/* Segmented Switcher */}
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
                    setSuccessMsg("");
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
                    setSuccessMsg("");
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
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <label className="block text-[#0B1B33] text-sm sm:text-base font-bold">
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot_password");
                          setErrorMsg("");
                        }}
                        className="text-xs font-bold text-[#1560BD] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
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
                      onClick={() => {
                        setMode("signup");
                        setErrorMsg("");
                      }}
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
                      onClick={() => {
                        setMode("login");
                        setErrorMsg("");
                      }}
                      className="text-[#1560BD] font-bold underline ml-1 cursor-pointer"
                    >
                      Log in to your conference
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
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
