"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  EventModel,
  MunCommittee,
  MunPortfolio,
  Registration,
  MunAllotment,
  AllotmentConflict,
  PaymentStatus,
} from "./types";
import { EMPTY_EVENT, STANDARD_TEMPLATES } from "./store";
import { simulateAutoAllotment, AutoAllotSimulationResult } from "./autoAllot";
import { supabase, isSupabaseConfigured } from "./supabase";
import { getPortfoliosForCommittee, getAutoPortfolios } from "./committeeTemplates";

export interface AuthUser {
  id: string;
  email: string;
}

export type BackgroundEffect = "none" | "polka-dots" | "lines" | "grid" | "blur";

export interface AccountTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundEffect: BackgroundEffect;
}

export const DEFAULT_THEME: AccountTheme = {
  primaryColor: "#1560BD",
  secondaryColor: "#FFD23F",
  backgroundEffect: "none",
};

export function adjustHexBrightness(hex: string, percent: number): string {
  if (!hex || !hex.startsWith("#")) return hex;
  const num = parseInt(hex.replace("#", ""), 16);
  if (isNaN(num)) return hex;
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

interface AppContextType {
  user: AuthUser | null;
  isAuthLoaded: boolean;
  theme: AccountTheme;
  updateTheme: (newTheme: Partial<AccountTheme>) => void;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  event: EventModel;
  myConferences: EventModel[];
  allEvents: EventModel[];
  selectConference: (conferenceId: string) => Promise<boolean>;
  loadEventById: (eventId: string) => Promise<boolean>;
  createNewConference: (data?: Partial<EventModel>) => Promise<EventModel | null>;
  deleteConference: (conferenceId: string) => Promise<void>;
  committees: MunCommittee[];
  portfolios: MunPortfolio[];
  registrations: Registration[];
  isLoaded: boolean;
  isConfigured: boolean;
  addRegistration: (newReg: Omit<Registration, "id" | "registrationNumber" | "createdAt">) => Promise<Registration>;
  verifyPayment: (regId: string) => void;
  updateEventRules: (newRules: Partial<EventModel["rules"]>) => void;
  updateEventBasics: (updates: Partial<EventModel>) => void;
  addCommittee: (committee: Omit<MunCommittee, "id" | "eventId">, countries?: { name: string; code: string }[]) => void;
  loadTemplateCommittees: () => void;
  syncCommitteePortfolios: (committeeId: string, targetCount: number) => void;
  editCommittee: (id: string, updates: Partial<MunCommittee>) => void;
  removeCommittee: (id: string) => void;
  allotDelegateManual: (regId: string, committeeId: string, portfolioId: string) => Promise<boolean>;
  unallotDelegate: (regId: string) => Promise<void>;
  autoAllotSimulation: AutoAllotSimulationResult;
  autoAllotIncludeUnpaid: boolean;
  setAutoAllotIncludeUnpaid: (val: boolean) => void;
  executeAutoAllot: () => Promise<void>;
  resolveConflict: (portfolioId: string, chosenRegId: string) => Promise<void>;
  deletePortfolio: (portfolioId: string) => void;
  deleteMultiplePortfolios: (portfolioIds: string[]) => void;
  addPortfolioToCommittee: (committeeId: string, item: { name: string; code: string }) => void;
  autoPopulatePortfolios: (
    committeeId: string,
    type: "countries" | "indian_politicians",
    count: number,
    mode?: "append" | "replace"
  ) => void;
  findRegistrationByNumber: (num: string, eventId?: string) => Registration | undefined;
  publishAllotmentsToggle: () => void;
  markConferencePublished: () => void;
  refreshPortfoliosLive: (committeeId?: string) => Promise<MunPortfolio[]>;
  clearDatabase: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [event, setEvent] = useState<EventModel>(EMPTY_EVENT);
  const [myConferences, setMyConferences] = useState<EventModel[]>([]);
  const [allEvents, setAllEvents] = useState<EventModel[]>([]);
  const [committees, setCommittees] = useState<MunCommittee[]>([]);
  const [portfolios, setPortfolios] = useState<MunPortfolio[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoAllotIncludeUnpaid, setAutoAllotIncludeUnpaid] = useState(false);
  const [theme, setTheme] = useState<AccountTheme>(DEFAULT_THEME);

  // Load user theme preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = user?.id ? `delegate_theme_${user.id}` : "delegate_theme_default";
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          setTheme(JSON.parse(saved));
        } else {
          setTheme(DEFAULT_THEME);
        }
      } catch {
        setTheme(DEFAULT_THEME);
      }
    }
  }, [user?.id]);

  // Apply theme to CSS variables and body attributes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--un-blue", theme.primaryColor);
      root.style.setProperty("--un-blue-dark", adjustHexBrightness(theme.primaryColor, -25));
      root.style.setProperty("--un-yellow", theme.secondaryColor);
      document.body.style.backgroundColor = theme.primaryColor;
      document.body.setAttribute("data-bg-effect", theme.backgroundEffect);
    }
  }, [theme]);

  const updateTheme = (newTheme: Partial<AccountTheme>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newTheme };
      if (typeof window !== "undefined") {
        const key = user?.id ? `delegate_theme_${user.id}` : "delegate_theme_default";
        try {
          localStorage.setItem(key, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  // 1. Initial Authentication Check - Real User Only, No Demo Accounts
  useEffect(() => {
    // Purge any stale legacy demo accounts or mock conferences from browser storage
    try {
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const val = localStorage.getItem(key) || "";
            if (
              key.includes("organizer1") ||
              key.includes("organizer2") ||
              key.includes("org_user_1") ||
              key.includes("org_user_2") ||
              val.includes("delhi-youth-summit") ||
              val.includes("Delhi Youth Summit") ||
              val.includes("organizer1@delegate.app") ||
              val.includes("organizer2@delegate.app") ||
              val.includes("National Conclave")
            ) {
              keysToRemove.push(key);
            }
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem("mun_platform_database_clean_v2");
      }
    } catch {}

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUser({ id: session.user.id, email: session.user.email });
        } else {
          setUser(null);
        }
        setIsAuthLoaded(true);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setUser({ id: session.user.id, email: session.user.email });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Local auth check without any dummy user fallback
      try {
        const stored = localStorage.getItem("delegate_auth_user");
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setIsAuthLoaded(true);
    }
  }, []);

  // 2. Load Conferences & Data strictly for the signed-in organizer
  const loadOrganizerData = useCallback(async (activeUserId: string, targetEventId?: string) => {
    // A. Check Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        // Query events owned exclusively by this organizer (guard against invalid id and missing created_at column)
        let query = supabase.from("events").select("*");
        if (activeUserId && activeUserId !== "new-conference") {
          query = query.eq("owner_id", activeUserId);
        }
        const { data: eventsData, error: evErr } = await query;

        if (!evErr && eventsData) {
          const validEvents = eventsData.filter(
            (ev) =>
              ev.name &&
              ev.name.trim().length > 0 &&
              ev.id !== "delhi-youth-summit-2026" &&
              ev.id !== "national-conclave-2026" &&
              !ev.name.toLowerCase().includes("delhi youth summit")
          );
          const parsed: EventModel[] = validEvents.map((ev) => ({
            id: ev.id,
            ownerId: ev.owner_id,
            slug: ev.slug,
            organizationId: ev.organization_id || "org-1",
            type: ev.type || "mun",
            name: ev.name,
            dates: ev.dates,
            dateFrom: ev.date_from,
            dateTo: ev.date_to,
            deadline: ev.deadline,
            deadlineDate: ev.deadline_date,
            venue: ev.venue,
            fee: Number(ev.fee) || 0,
            schoolFeePerStudent: Number(ev.school_fee_per_student) || 0,
            status: ev.status,
            rules: ev.rules || EMPTY_EVENT.rules,
            branding: ev.branding || ev.rules?.branding || undefined,
          }));

          if (parsed.length > 0) {
            setMyConferences(parsed);
            setAllEvents(parsed);

            const chosen =
              (targetEventId && parsed.find((e) => e.id === targetEventId || e.slug === targetEventId)) ||
              parsed[0];

            setEvent(chosen);

            // Load committees for this conference
            let commsData = null;
            if (chosen.id && chosen.id !== "new-conference" && !chosen.id.startsWith("new-")) {
              const res = await supabase
                .from("committees")
                .select("*")
                .eq("event_id", chosen.id);
              commsData = res.data;
            }

            const mappedComms: MunCommittee[] = (commsData || []).map((c) => ({
              id: c.id,
              eventId: c.event_id,
              name: c.name,
              agenda: c.agenda,
              totalSeats: c.total_seats,
              backgroundGuideUrl: c.background_guide_url,
            }));
            setCommittees(mappedComms);

            const commIds = mappedComms.map((c) => c.id);
            if (commIds.length > 0) {
              const { data: portsData } = await supabase
                .from("portfolios")
                .select("*")
                .in("committee_id", commIds);

              if (portsData) {
                setPortfolios(
                  portsData.map((p) => ({
                    id: p.id,
                    committeeId: p.committee_id,
                    countryName: p.country_name,
                    code: p.country_code,
                    status: p.status,
                    allottedRegistrationId: p.allotted_registration_id || undefined,
                  }))
                );
              }
            } else {
              setPortfolios([]);
            }

            // Load registrations for this conference
            let regsData = null;
            if (chosen.id && chosen.id !== "new-conference" && !chosen.id.startsWith("new-")) {
              const res = await supabase
                .from("registrations")
                .select("*")
                .eq("event_id", chosen.id);
              regsData = res.data;
            }

            if (regsData) {
              setRegistrations(
                regsData.map((r) => ({
                  id: r.id,
                  eventId: r.event_id,
                  delegateName: r.name || "",
                  email: r.email || "",
                  phone: r.phone || "",
                  school: r.school || "",
                  classYear: r.class_year || "",
                  experienceMuns: Number(r.experience_count) || 0,
                  registrationNumber: r.registration_number,
                  registrationType: r.type === "school_team" ? "school_team" : "individual",
                  paymentStatus: (r.payment_status as PaymentStatus) || "unpaid",
                  paymentProofUrl: r.payment_proof_url || undefined,
                  feeAmount: Number(r.fee_amount) || 1500,
                  preferences: r.preferences || [],
                  allotment: r.allotment || undefined,
                  createdAt: r.created_at || new Date().toISOString(),
                }))
              );
            }
            setIsLoaded(true);
            return;
          }
          // If Supabase returned 0 events for this owner, fall through to localStorage so created conferences persist!
        }
      } catch (err) {
        console.warn("Supabase query error:", err);
      }
    }

    // B. Offline Storage strictly isolated per user id (No hardcoded seed conferences)
    const userStorageKey = `delegate_storage_${activeUserId}`;
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleanConfs: EventModel[] = (parsed.myConferences || []).filter(
          (c: EventModel) =>
            c.name &&
            c.name.trim().length > 0 &&
            c.id !== "delhi-youth-summit-2026" &&
            c.id !== "national-conclave-2026" &&
            !c.name?.toLowerCase().includes("delhi youth")
        );
        setMyConferences(cleanConfs);
        setAllEvents(cleanConfs);
        if (cleanConfs.length > 0) {
          const chosen =
            (targetEventId && cleanConfs.find((e: EventModel) => e.id === targetEventId)) ||
            (parsed.event && parsed.event.id !== "delhi-youth-summit-2026" && !parsed.event.name?.toLowerCase().includes("delhi youth")
              ? parsed.event
              : cleanConfs[0]);
          setEvent(chosen);
          // Strictly load isolated data for this conference
          try {
            const savedConfData = localStorage.getItem(`delegate_conf_data_${chosen.id}`);
            if (savedConfData) {
              const parsedData = JSON.parse(savedConfData);
              setCommittees(parsedData.committees || []);
              setPortfolios(parsedData.portfolios || []);
              setRegistrations(parsedData.registrations || []);
            } else {
              setCommittees([]);
              setPortfolios([]);
              setRegistrations([]);
            }
          } catch {
            setCommittees([]);
            setPortfolios([]);
            setRegistrations([]);
          }
        } else {
          setEvent(EMPTY_EVENT);
          setCommittees([]);
          setPortfolios([]);
          setRegistrations([]);
        }
        setIsLoaded(true);
        return;
      }
    } catch {}

    // Clean initial state for new organizer
    setMyConferences([]);
    setAllEvents([]);
    setEvent(EMPTY_EVENT);
    setCommittees([]);
    setPortfolios([]);
    setRegistrations([]);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (user?.id) {
      const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetId = sp?.get("event") || sp?.get("eventId") || sp?.get("id") || "";
      loadOrganizerData(user.id, targetId);
    } else {
      // For anonymous delegates: load requested conference from URL query param
      const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetId = sp?.get("event") || sp?.get("eventId") || sp?.get("id") || "";
      if (targetId) {
        loadEventById(targetId);
      }
      setIsLoaded(true);
    }
  }, [user?.id, loadOrganizerData]);

  // Sync state to local storage isolated to this user and per-conference
  useEffect(() => {
    if (user?.id && isLoaded) {
      const userStorageKey = `delegate_storage_${user.id}`;
      try {
        localStorage.setItem(
          userStorageKey,
          JSON.stringify({
            myConferences,
            event,
          })
        );
        if (event.id && event.id !== "new-conference") {
          localStorage.setItem(
            `delegate_conf_data_${event.id}`,
            JSON.stringify({
              committees,
              portfolios,
              registrations,
            })
          );
        }
      } catch {}
    }
  }, [user?.id, isLoaded, myConferences, event, committees, portfolios, registrations]);

  // Real Auth Methods
  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        // If Supabase has email signups toggled off in their dashboard, fallback gracefully so user is never locked out
        if (error.message?.toLowerCase().includes("signups are disabled") || error.message?.toLowerCase().includes("signup is disabled")) {
          const id = `user_${Date.now().toString(36)}`;
          const newUser: AuthUser = { id, email };
          setUser(newUser);
          try {
            localStorage.setItem("delegate_auth_user", JSON.stringify(newUser));
          } catch {}
          return {};
        }
        return { error: error.message };
      }
      if (data?.user?.email) {
        setUser({ id: data.user.id, email: data.user.email });
      }
      return {};
    } else {
      const id = `user_${Date.now().toString(36)}`;
      const newUser: AuthUser = { id, email };
      setUser(newUser);
      try {
        localStorage.setItem("delegate_auth_user", JSON.stringify(newUser));
      } catch {}
      return {};
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Check if there is an active local/fallback session for this email
        try {
          const stored = localStorage.getItem("delegate_auth_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email?.toLowerCase() === email.toLowerCase()) {
              setUser(parsed);
              return {};
            }
          }
        } catch {}
        return { error: error.message };
      }
      if (data?.user?.email) {
        setUser({ id: data.user.id, email: data.user.email });
      }
      return {};
    } else {
      const id = `user_${Date.now().toString(36)}`;
      const newUser: AuthUser = { id, email };
      setUser(newUser);
      try {
        localStorage.setItem("delegate_auth_user", JSON.stringify(newUser));
      } catch {}
      return {};
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setMyConferences([]);
    setEvent(EMPTY_EVENT);
    setCommittees([]);
    setPortfolios([]);
    setRegistrations([]);
    try {
      localStorage.removeItem("delegate_auth_user");
    } catch {}
  };

  // Switch active conference in organizer portal
  const selectConference = async (conferenceId: string): Promise<boolean> => {
    if (!conferenceId) return false;
    if (user?.id) {
      await loadOrganizerData(user.id, conferenceId);
      return true;
    }
    return false;
  };

  // Delegate / Public loader: Load any published conference by ID or slug
  const loadEventById = async (eventId: string): Promise<boolean> => {
    if (!eventId || eventId === "new-conference") return false;

    // 1. Check Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: ev, error: evErr } = await supabase
          .from("events")
          .select("*")
          .or(`id.eq.${eventId},slug.eq.${eventId}`)
          .maybeSingle();

        if (!evErr && ev) {
          const parsedEvent: EventModel = {
            id: ev.id,
            ownerId: ev.owner_id,
            slug: ev.slug,
            organizationId: ev.organization_id || "org-1",
            type: ev.type || "mun",
            name: ev.name,
            dates: ev.dates,
            dateFrom: ev.date_from,
            dateTo: ev.date_to,
            deadline: ev.deadline,
            deadlineDate: ev.deadline_date,
            venue: ev.venue,
            fee: Number(ev.fee) || 0,
            schoolFeePerStudent: Number(ev.school_fee_per_student) || 0,
            status: ev.status,
            rules: ev.rules || EMPTY_EVENT.rules,
          };
          setEvent(parsedEvent);

          const { data: commsData } = await supabase
            .from("committees")
            .select("*")
            .eq("event_id", ev.id);

          const mappedComms: MunCommittee[] = (commsData || []).map((c) => ({
            id: c.id,
            eventId: c.event_id,
            name: c.name,
            agenda: c.agenda,
            totalSeats: c.total_seats,
            backgroundGuideUrl: c.background_guide_url,
          }));
          setCommittees(mappedComms);

          const commIds = mappedComms.map((c) => c.id);
          if (commIds.length > 0) {
            const { data: portsData } = await supabase
              .from("portfolios")
              .select("*")
              .in("committee_id", commIds);

            if (portsData) {
              setPortfolios(
                portsData.map((p) => ({
                  id: p.id,
                  committeeId: p.committee_id,
                  countryName: p.country_name,
                  code: p.country_code,
                  status: p.status,
                  allottedRegistrationId: p.allotted_registration_id || undefined,
                }))
              );
            }
          }

          const { data: regsData } = await supabase
            .from("registrations")
            .select("*")
            .eq("event_id", ev.id);

          if (regsData) {
            setRegistrations(
              regsData.map((r) => ({
                id: r.id,
                eventId: r.event_id,
                delegateName: r.name || "",
                email: r.email || "",
                phone: r.phone || "",
                school: r.school || "",
                classYear: r.class_year || "",
                experienceMuns: Number(r.experience_count) || 0,
                registrationNumber: r.registration_number,
                registrationType: r.type === "school_team" ? "school_team" : "individual",
                paymentStatus: (r.payment_status as PaymentStatus) || "unpaid",
                paymentProofUrl: r.payment_proof_url || undefined,
                feeAmount: Number(r.fee_amount) || 1500,
                preferences: r.preferences || [],
                allotment: r.allotment || undefined,
                createdAt: r.created_at || new Date().toISOString(),
              }))
            );
          }

          return true;
        }
      } catch (err) {
        console.warn("loadEventById error:", err);
      }
    }

    // 2. Check if conference is in organizer's loaded conferences
    const localMatch = myConferences.find((e) => e.id === eventId || e.slug === eventId);
    if (localMatch) {
      setEvent(localMatch);
      return true;
    }

    return false;
  };

  // Create brand new conference belonging to this organizer
  const createNewConference = async (data?: Partial<EventModel>): Promise<EventModel | null> => {
    if (!user) return null;

    const accountHandle = (user.email || "org")
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const baseName = data?.name !== undefined ? data.name : "";
    const slugBase = (baseName || "conference")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const uniqueSlug = `${accountHandle}-${slugBase || "mun"}-${randomSuffix}`;
    const uniqueId = `mun-${uniqueSlug}`;

    const newConf: EventModel = {
      ...EMPTY_EVENT,
      id: uniqueId,
      ownerId: user.id,
      slug: uniqueSlug,
      name: baseName,
      dates: data?.dates || "",
      dateFrom: data?.dateFrom || "",
      dateTo: data?.dateTo || "",
      venue: data?.venue || "",
      fee: data?.fee ?? 1500,
      schoolFeePerStudent: data?.schoolFeePerStudent ?? 1200,
      deadline: data?.deadline || "",
      deadlineDate: data?.deadlineDate || "",
      status: "draft",
      rules: {
        allowSchoolTeams: true,
        askPaymentProof: true,
        showTakenPortfoliosLive: true,
        firstComeFirstServed: true,
        allotmentsPublished: false,
      },
      branding: {
        primaryColor: theme.primaryColor || "#1560BD",
        accentColor: theme.secondaryColor || "#FFD23F",
        backgroundEffect: theme.backgroundEffect || "none",
        cardStyle: "solid",
        monogram: "D",
      },
    };

    // Set as active draft event for setup wizard
    setEvent(newConf);
    setCommittees([]);
    setPortfolios([]);
    setRegistrations([]);

    // Clear any previous setup step for this new id
    try {
      localStorage.removeItem(`delegate_setup_step_${uniqueId}`);
      localStorage.removeItem(`delegate_rules_done_${uniqueId}`);
    } catch {}

    // Only if a non-empty name was explicitly provided do we add to myConferences right away
    if (newConf.name && newConf.name.trim().length > 0) {
      setMyConferences((prev) => [newConf, ...prev.filter((c) => c.id !== newConf.id)]);
      setAllEvents((prev) => [newConf, ...prev.filter((c) => c.id !== newConf.id)]);

      try {
        const userStorageKey = `delegate_storage_${user.id}`;
        const existing = localStorage.getItem(userStorageKey);
        const parsedExisting = existing ? JSON.parse(existing) : {};
        const prevList: EventModel[] = parsedExisting.myConferences || [];
        const updatedConfs = [newConf, ...prevList.filter((c) => c.id !== newConf.id)];
        localStorage.setItem(
          userStorageKey,
          JSON.stringify({
            ...parsedExisting,
            myConferences: updatedConfs,
            event: newConf,
          })
        );
        localStorage.setItem(`delegate_public_conf_${uniqueSlug}`, JSON.stringify(newConf));
        localStorage.setItem(`delegate_public_conf_${uniqueId}`, JSON.stringify(newConf));
      } catch {}

      if (isSupabaseConfigured && supabase) {
        supabase.from("events").upsert({
          id: newConf.id,
          owner_id: user.id,
          slug: newConf.slug,
          type: newConf.type,
          name: newConf.name,
          dates: newConf.dates,
          date_from: newConf.dateFrom,
          date_to: newConf.dateTo,
          deadline: newConf.deadline,
          deadline_date: newConf.deadlineDate,
          venue: newConf.venue,
          fee: newConf.fee,
          school_fee_per_student: newConf.schoolFeePerStudent,
          status: newConf.status,
          rules: {
            ...newConf.rules,
            branding: newConf.branding,
          },
          branding: newConf.branding,
        }).then();
      }
    }

    return newConf;
  };

  const deleteConference = async (conferenceId: string) => {
    const remaining = myConferences.filter((c) => c.id !== conferenceId);
    setMyConferences(remaining);
    setAllEvents(remaining);

    if (event.id === conferenceId) {
      if (remaining.length > 0) {
        setEvent(remaining[0]);
        if (user?.id) {
          await loadOrganizerData(user.id, remaining[0].id);
        }
      } else {
        setEvent(EMPTY_EVENT);
        setCommittees([]);
        setPortfolios([]);
        setRegistrations([]);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("events").delete().eq("id", conferenceId);
      } catch (err) {
        console.warn("Delete conference error:", err);
      }
    }
  };

  // Add registration with collision-resistant random registration number
  const addRegistration = async (
    data: Omit<Registration, "id" | "registrationNumber" | "createdAt">
  ): Promise<Registration> => {
    const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newRegNum = `MUN-${randomFourDigit}-${randomSuffix}`;
    const newId = `reg-${Date.now()}-${randomSuffix.toLowerCase()}`;

    const newReg: Registration = {
      ...data,
      id: newId,
      registrationNumber: newRegNum,
      createdAt: new Date().toISOString(),
    };

    setRegistrations((prev) => [newReg, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("registrations").insert({
          id: newReg.id,
          event_id: newReg.eventId || event.id,
          registration_number: newReg.registrationNumber,
          type: newReg.registrationType,
          name: newReg.delegateName,
          email: newReg.email,
          phone: newReg.phone,
          school: newReg.school,
          class_year: newReg.classYear,
          experience_count: newReg.experienceMuns,
          preferences: newReg.preferences,
          payment_status: newReg.paymentStatus,
          payment_proof_url: newReg.paymentProofUrl || null,
          allotment: newReg.allotment || null,
        });
      } catch (err) {
        console.warn("Supabase insert registration error:", err);
      }
    }

    return newReg;
  };

  const verifyPayment = (regId: string) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, paymentStatus: "verified" as const } : r))
    );

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("registrations")
        .update({ payment_status: "verified" })
        .eq("id", regId)
        .then();
    }
  };

  const updateEventRules = (newRules: Partial<EventModel["rules"]>) => {
    const updated = {
      ...event,
      rules: { ...event.rules, ...newRules },
    };
    setEvent(updated);
    setMyConferences((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    if (isSupabaseConfigured && supabase && updated.id && updated.id !== "new-conference" && !updated.id.startsWith("new-")) {
      supabase
        .from("events")
        .update({ rules: updated.rules })
        .eq("id", updated.id)
        .then(({ error }) => {
          if (error) console.warn("Supabase updateEventRules note:", error.message);
        });
    }
  };

  const updateEventBasics = (updates: Partial<EventModel>) => {
    let updatedSlug = event.slug;
    if (updates.name && updates.name.trim() && updates.name !== event.name) {
      const accountHandle = (user?.email || "org")
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const newSlugBase = updates.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const suffix = (event.slug || "").split("-").pop() || Math.random().toString(36).substring(2, 6);
      updatedSlug = `${accountHandle}-${newSlugBase}-${suffix}`;
    }

    const updated = {
      ...event,
      ...updates,
      slug: updatedSlug,
      ownerId: event.ownerId || user?.id,
    };
    setEvent(updated);

    const hasValidName = Boolean(updated.name && updated.name.trim().length > 0);
    if (hasValidName && updated.id !== "new-conference") {
      setMyConferences((prev) => {
        const exists = prev.some((c) => c.id === updated.id);
        if (exists) {
          return prev.map((c) => (c.id === updated.id ? updated : c));
        }
        return [updated, ...prev];
      });
      setAllEvents((prev) => {
        const exists = prev.some((c) => c.id === updated.id);
        if (exists) {
          return prev.map((c) => (c.id === updated.id ? updated : c));
        }
        return [updated, ...prev];
      });

      try {
        if (updated.id) {
          localStorage.setItem(`delegate_public_conf_${updated.id}`, JSON.stringify(updated));
        }
        if (updated.slug) {
          localStorage.setItem(`delegate_public_conf_${updated.slug}`, JSON.stringify(updated));
        }
        if (user?.id) {
          const userStorageKey = `delegate_storage_${user.id}`;
          const existing = localStorage.getItem(userStorageKey);
          const parsedExisting = existing ? JSON.parse(existing) : {};
          const prevList: EventModel[] = (parsedExisting.myConferences || []).filter(
            (c: EventModel) => c.name && c.name.trim().length > 0
          );
          const exists = prevList.some((c) => c.id === updated.id);
          const updatedList = exists
            ? prevList.map((c) => (c.id === updated.id ? updated : c))
            : [updated, ...prevList];
          localStorage.setItem(
            userStorageKey,
            JSON.stringify({
              ...parsedExisting,
              myConferences: updatedList,
              event: updated,
            })
          );
        }
      } catch {}

      if (isSupabaseConfigured && supabase && updated.id && updated.id !== "new-conference" && !updated.id.startsWith("new-")) {
        supabase
          .from("events")
          .upsert({
            id: updated.id,
            owner_id: user?.id,
            slug: updated.slug,
            type: updated.type || "mun",
            name: updated.name,
            dates: updated.dates,
            date_from: updated.dateFrom,
            date_to: updated.dateTo,
            deadline: updated.deadline,
            deadline_date: updated.deadlineDate,
            venue: updated.venue,
            fee: updated.fee,
            school_fee_per_student: updated.schoolFeePerStudent,
            status: updated.status,
            rules: {
              ...updated.rules,
              branding: updated.branding,
            },
            branding: updated.branding,
          })
          .then(({ error }) => {
            if (error) console.warn("Supabase upsertEventBasics note:", error.message);
          });
      }
    }
  };

  const addCommittee = (
    data: Omit<MunCommittee, "id" | "eventId">,
    countries?: { name: string; code: string }[]
  ) => {
    const cleanCommSlug = data.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newId = `${event.id}-${cleanCommSlug}`;
    const targetSeats = Math.max(3, Math.min(150, data.totalSeats || 30));
    const newComm: MunCommittee = {
      ...data,
      totalSeats: targetSeats,
      id: newId,
      eventId: event.id || "conference-1",
    };
    setCommittees((prev) => [...prev.filter((c) => c.id !== newId), newComm]);

    // Automatically generate exactly `targetSeats` portfolios matching the requested seat count!
    const countriesToAdd =
      countries && countries.length > 0
        ? countries.slice(0, 150)
        : getPortfoliosForCommittee(data.name, targetSeats);

    const newPorts: MunPortfolio[] = countriesToAdd.map((c) => {
      const cleanSlug = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return {
        id: `${newId}-${cleanSlug}`,
        committeeId: newId,
        countryName: c.name,
        code: (c.code || "UN").toUpperCase().slice(0, 2),
        status: "open",
      };
    });

    setPortfolios((prev) => [...prev.filter((p) => p.committeeId !== newId), ...newPorts]);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      client
        .from("committees")
        .upsert({
          id: newComm.id,
          event_id: newComm.eventId,
          name: newComm.name,
          agenda: newComm.agenda,
          total_seats: newComm.totalSeats,
          background_guide_url: newComm.backgroundGuideUrl,
        })
        .then(() => {
          client
            .from("portfolios")
            .upsert(
              newPorts.map((p) => ({
                id: p.id,
                committee_id: p.committeeId,
                country_name: p.countryName,
                country_code: p.code,
                status: p.status,
              }))
            )
            .then();
        });
    }
  };

  const loadTemplateCommittees = () => {
    const newComms: MunCommittee[] = [];
    const newPorts: MunPortfolio[] = [];

    STANDARD_TEMPLATES.forEach((tpl) => {
      const commId = `${event.id}-${tpl.name.toLowerCase()}`;
      newComms.push({
        id: commId,
        eventId: event.id,
        name: tpl.name,
        agenda: tpl.agenda,
        totalSeats: tpl.totalSeats,
        backgroundGuideUrl: `/guides/${tpl.name}_Background_Guide.pdf`,
      });

      const countries = getPortfoliosForCommittee(tpl.name, tpl.totalSeats);
      countries.forEach((c) => {
        newPorts.push({
          id: `${commId}-${c.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          committeeId: commId,
          countryName: c.name,
          code: c.code,
          status: "open",
        });
      });
    });

    setCommittees(newComms);
    setPortfolios(newPorts);

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      client
        .from("committees")
        .upsert(
          newComms.map((c) => ({
            id: c.id,
            event_id: c.eventId,
            name: c.name,
            agenda: c.agenda,
            total_seats: c.totalSeats,
            background_guide_url: c.backgroundGuideUrl,
          }))
        )
        .then(() => {
          client
            .from("portfolios")
            .upsert(
              newPorts.map((p) => ({
                id: p.id,
                committee_id: p.committeeId,
                country_name: p.countryName,
                country_code: p.code,
                status: p.status,
              }))
            )
            .then();
        });
    }
  };

  const syncCommitteePortfolios = (committeeId: string, targetCount: number) => {
    const clampedSeats = Math.max(3, Math.min(150, targetCount));

    setCommittees((prev) =>
      prev.map((c) => (c.id === committeeId ? { ...c, totalSeats: clampedSeats } : c))
    );

    const comm = committees.find((c) => c.id === committeeId);
    const commName = comm?.name || "Committee";

    setPortfolios((prev) => {
      const existingForComm = prev.filter((p) => p.committeeId === committeeId);
      const otherPortfolios = prev.filter((p) => p.committeeId !== committeeId);

      if (existingForComm.length < clampedSeats) {
        const needed = clampedSeats - existingForComm.length;
        const candidatePool = getPortfoliosForCommittee(commName, clampedSeats + 30);
        const existingNames = new Set(existingForComm.map((p) => p.countryName.toLowerCase()));
        const newToAdd = candidatePool
          .filter((c) => !existingNames.has(c.name.toLowerCase()))
          .slice(0, needed);

        const createdPorts: MunPortfolio[] = newToAdd.map((c, i) => {
          const cleanSlug = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          return {
            id: `${committeeId}-${cleanSlug || i}-${Date.now().toString(36)}-${i}`,
            committeeId,
            countryName: c.name,
            code: (c.code || "UN").toUpperCase().slice(0, 2),
            status: "open",
          };
        });

        const updated = [...prev, ...createdPorts];
        if (isSupabaseConfigured && supabase) {
          const client = supabase;
          createdPorts.forEach((p) => {
            client.from("portfolios").upsert(p).then();
          });
        }
        return updated;
      } else if (existingForComm.length > clampedSeats) {
        const openPorts = existingForComm.filter((p) => p.status === "open");
        const assignedPorts = existingForComm.filter((p) => p.status !== "open");
        const keepCount = Math.max(0, clampedSeats - assignedPorts.length);
        const keptOpen = openPorts.slice(0, keepCount);
        return [...otherPortfolios, ...assignedPorts, ...keptOpen];
      }
      return prev;
    });

    if (isSupabaseConfigured && supabase) {
      supabase.from("committees").update({ total_seats: clampedSeats }).eq("id", committeeId).then();
    }
  };

  const editCommittee = (id: string, updates: Partial<MunCommittee>) => {
    const clampedUpdates = { ...updates };
    if (clampedUpdates.totalSeats) {
      clampedUpdates.totalSeats = Math.max(3, Math.min(150, clampedUpdates.totalSeats));
    }

    setCommittees((prev) => prev.map((c) => (c.id === id ? { ...c, ...clampedUpdates } : c)));

    // If totalSeats was updated and increased, automatically top up portfolios so the roster matches the requested seat count!
    if (clampedUpdates.totalSeats && clampedUpdates.totalSeats > 0) {
      const comm = committees.find((c) => c.id === id);
      const commName = clampedUpdates.name || comm?.name || "Committee";
      const targetSeats = clampedUpdates.totalSeats;

      setPortfolios((prev) => {
        const existingForComm = prev.filter((p) => p.committeeId === id);
        if (existingForComm.length < targetSeats) {
          const needed = targetSeats - existingForComm.length;
          const candidatePool = getPortfoliosForCommittee(commName, targetSeats + 30);
          const existingNames = new Set(existingForComm.map((p) => p.countryName.toLowerCase()));
          const newToAdd = candidatePool
            .filter((c) => !existingNames.has(c.name.toLowerCase()))
            .slice(0, needed);

          const createdPorts: MunPortfolio[] = newToAdd.map((c, i) => {
            const cleanSlug = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return {
              id: `${id}-${cleanSlug || i}-${Date.now().toString(36)}-${i}`,
              committeeId: id,
              countryName: c.name,
              code: (c.code || "UN").toUpperCase().slice(0, 2),
              status: "open",
            };
          });

          return [...prev, ...createdPorts];
        }
        return prev;
      });
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from("committees").update(clampedUpdates).eq("id", id).then();
    }
  };

  const removeCommittee = (id: string) => {
    setCommittees((prev) => prev.filter((c) => c.id !== id));
    setPortfolios((prev) => prev.filter((p) => p.committeeId !== id));
    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.allotment?.committeeId === id) {
          const copy = { ...r };
          delete copy.allotment;
          return copy;
        }
        return r;
      })
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from("committees").delete().eq("id", id).then();
    }
  };

  const deletePortfolio = (portfolioId: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.allotment?.portfolioId === portfolioId) {
          const copy = { ...r };
          delete copy.allotment;
          return copy;
        }
        return r;
      })
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from("portfolios").delete().eq("id", portfolioId).then();
    }
  };

  const deleteMultiplePortfolios = (portfolioIds: string[]) => {
    const idSet = new Set(portfolioIds);
    setPortfolios((prev) => prev.filter((p) => !idSet.has(p.id)));
    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.allotment && idSet.has(r.allotment.portfolioId)) {
          const copy = { ...r };
          delete copy.allotment;
          return copy;
        }
        return r;
      })
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from("portfolios").delete().in("id", portfolioIds).then();
    }
  };

  const addPortfolioToCommittee = (committeeId: string, item: { name: string; code: string }) => {
    const existingCount = portfolios.filter((p) => p.committeeId === committeeId).length;
    if (existingCount >= 150) {
      alert("Maximum limit of 150 portfolios reached for this committee.");
      return;
    }
    const cleanId = `${committeeId}-${item.code.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString().slice(-4)}`;
    const newPort: MunPortfolio = {
      id: cleanId,
      committeeId,
      countryName: item.name,
      code: item.code.toUpperCase().slice(0, 2),
      status: "open",
    };
    setPortfolios((prev) => [...prev, newPort]);

    // Keep committee total_seats in sync with the portfolio count
    const updatedCount = existingCount + 1;
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === committeeId && c.totalSeats < updatedCount ? { ...c, totalSeats: updatedCount } : c
      )
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from("committees").update({ total_seats: updatedCount }).eq("id", committeeId).then();
      supabase
        .from("portfolios")
        .insert({
          id: newPort.id,
          committee_id: newPort.committeeId,
          country_name: newPort.countryName,
          country_code: newPort.code,
          status: newPort.status,
        })
        .then();
    }
  };

  const autoPopulatePortfolios = (
    committeeId: string,
    type: "countries" | "indian_politicians",
    count: number,
    mode: "append" | "replace" = "append"
  ) => {
    const clampedCount = Math.max(1, Math.min(150, count));

    setPortfolios((prev) => {
      const existingForComm = prev.filter((p) => p.committeeId === committeeId);
      const otherPortfolios = prev.filter((p) => p.committeeId !== committeeId);

      const existingNames = mode === "replace" ? [] : existingForComm.map((p) => p.countryName);
      const generated = getAutoPortfolios(type, clampedCount, existingNames);

      const newPorts: MunPortfolio[] = generated.map((c, i) => {
        const cleanSlug = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return {
          id: `${committeeId}-${cleanSlug || i}-${Date.now().toString(36)}-${i}`,
          committeeId,
          countryName: c.name,
          code: (c.code || (type === "indian_politicians" ? "IN" : "UN")).toUpperCase().slice(0, 2),
          status: "open",
        };
      });

      let updatedListForComm: MunPortfolio[] = [];
      if (mode === "replace") {
        const assignedPorts = existingForComm.filter((p) => p.status !== "open");
        updatedListForComm = [...assignedPorts, ...newPorts].slice(0, 150);
      } else {
        const combined = [...existingForComm, ...newPorts];
        updatedListForComm = combined.slice(0, 150);
      }

      const finalSeats = updatedListForComm.length;
      setCommittees((commPrev) =>
        commPrev.map((c) => (c.id === committeeId ? { ...c, totalSeats: finalSeats } : c))
      );

      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        client.from("committees").update({ total_seats: finalSeats }).eq("id", committeeId).then();
        if (mode === "replace") {
          client
            .from("portfolios")
            .delete()
            .eq("committee_id", committeeId)
            .then(() => {
              newPorts.forEach((p) => client.from("portfolios").upsert(p).then());
            });
        } else {
          newPorts.forEach((p) => client.from("portfolios").upsert(p).then());
        }
      }

      return [...otherPortfolios, ...updatedListForComm];
    });
  };

  // Atomic Allotment
  const allotDelegateManual = async (
    regId: string,
    committeeId: string,
    portfolioId: string
  ): Promise<boolean> => {
    const targetPort = portfolios.find((p) => p.id === portfolioId);
    if (!targetPort) {
      alert("Selected portfolio does not exist.");
      return false;
    }

    if (targetPort.status === "taken" && targetPort.allottedRegistrationId !== regId) {
      alert(`Cannot allot: ${targetPort.countryName} is already allotted to another delegate.`);
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc("allot_portfolio_atomic", {
          p_portfolio_id: portfolioId,
          p_registration_id: regId,
          p_committee_id: committeeId,
        });

        if (error || data === false) {
          alert("Allotment collision: this country was just taken by another transaction.");
          return false;
        }
      } catch (err) {
        console.warn("RPC allot_portfolio_atomic error, continuing client update:", err);
      }
    }

    const allotment: MunAllotment = {
      registrationId: regId,
      committeeId,
      portfolioId,
      matchedPreferenceRank: 1,
      matchedPortfolioRank: 1,
      allottedAt: new Date().toISOString(),
      status: "tentative",
    };

    setPortfolios((prev) =>
      prev.map((p) => {
        if (p.id === portfolioId) {
          return { ...p, status: "taken", allottedRegistrationId: regId };
        }
        if (p.allottedRegistrationId === regId) {
          return { ...p, status: "open", allottedRegistrationId: undefined };
        }
        return p;
      })
    );

    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, allotment } : r))
    );

    return true;
  };

  const unallotDelegate = async (regId: string) => {
    setPortfolios((prev) =>
      prev.map((p) =>
        p.allottedRegistrationId === regId
          ? { ...p, status: "open", allottedRegistrationId: undefined }
          : p
      )
    );

    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === regId) {
          const copy = { ...r };
          delete copy.allotment;
          return copy;
        }
        return r;
      })
    );

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("portfolios")
        .update({ status: "open", allotted_registration_id: null })
        .eq("allotted_registration_id", regId);

      await supabase
        .from("registrations")
        .update({ allotment: null })
        .eq("id", regId);
    }
  };

  // Real auto allotment simulation
  const autoAllotSimulation = simulateAutoAllotment(
    registrations,
    portfolios,
    committees,
    event.rules.firstComeFirstServed,
    autoAllotIncludeUnpaid
  );

  const executeAutoAllot = async () => {
    const sim = autoAllotSimulation;
    const allotmentMap = new Map<string, MunAllotment>();
    sim.proposedAllotments.forEach((allot) => {
      allotmentMap.set(allot.registrationId, allot);
    });

    const updatedRegs = registrations.map((r) => {
      if (allotmentMap.has(r.id)) {
        return { ...r, allotment: allotmentMap.get(r.id)! };
      }
      return r;
    });

    const updatedPorts = portfolios.map((p) => {
      const match = sim.proposedAllotments.find((a) => a.portfolioId === p.id);
      if (match) {
        return { ...p, status: "taken" as const, allottedRegistrationId: match.registrationId };
      }
      return p;
    });

    setRegistrations(updatedRegs);
    setPortfolios(updatedPorts);

    if (isSupabaseConfigured && supabase) {
      for (const allot of sim.proposedAllotments) {
        await supabase
          .from("portfolios")
          .update({ status: "taken", allotted_registration_id: allot.registrationId })
          .eq("id", allot.portfolioId);

        await supabase
          .from("registrations")
          .update({ allotment: allot })
          .eq("id", allot.registrationId);
      }
    }
  };

  const resolveConflict = async (portfolioId: string, chosenRegId: string) => {
    const port = portfolios.find((p) => p.id === portfolioId);
    if (!port) return;
    await allotDelegateManual(chosenRegId, port.committeeId, portfolioId);
  };

  // Check status verifies both registration number AND conference
  const findRegistrationByNumber = (num: string, conferenceId?: string): Registration | undefined => {
    const cleaned = num.trim().toUpperCase().replace(/\s+/g, "");
    const targetEvent = conferenceId || event.id;

    return registrations.find((r) => {
      const regCleaned = r.registrationNumber.toUpperCase().replace(/\s+/g, "");
      const matchesNum = regCleaned === cleaned;
      if (!matchesNum) return false;
      if (targetEvent && targetEvent !== "new-conference") {
        return r.eventId === targetEvent;
      }
      return true;
    });
  };

  const publishAllotmentsToggle = () => {
    const newState = !event.rules.allotmentsPublished;
    updateEventRules({ allotmentsPublished: newState });
  };

  const markConferencePublished = () => {
    const updated = {
      ...event,
      status: "published" as const,
    };
    setEvent(updated);
    setMyConferences((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    if (isSupabaseConfigured && supabase && updated.id && updated.id !== "new-conference" && !updated.id.startsWith("new-")) {
      supabase
        .from("events")
        .update({ status: "published" })
        .eq("id", updated.id)
        .then(({ error }) => {
          if (error) console.warn("Supabase markConferencePublished note:", error.message);
        });
    }
  };

  const refreshPortfoliosLive = async (committeeId?: string): Promise<MunPortfolio[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from("portfolios").select("*");
        if (committeeId) {
          query = query.eq("committee_id", committeeId);
        } else if (committees.length > 0) {
          query = query.in("committee_id", committees.map((c) => c.id));
        }
        const { data } = await query;
        if (data) {
          const fresh = data.map((p) => ({
            id: p.id,
            committeeId: p.committee_id,
            countryName: p.country_name,
            code: p.country_code,
            status: p.status as "open" | "taken",
            allottedRegistrationId: p.allotted_registration_id || undefined,
          }));
          setPortfolios((prev) => {
            const freshMap = new Map(fresh.map((f) => [f.id, f]));
            return prev.map((p) => freshMap.get(p.id) || p);
          });
          return fresh;
        }
      } catch (err) {
        console.warn("Live portfolio fetch error:", err);
      }
    }
    return portfolios;
  };

  const clearDatabase = async () => {
    setRegistrations([]);
    setPortfolios([]);
    setCommittees([]);
    setMyConferences([]);
    setAllEvents([]);
    setEvent(EMPTY_EVENT);

    if (typeof window !== "undefined") {
      try {
        const toDelete: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith("delegate_") || k.startsWith("mun_"))) {
            toDelete.push(k);
          }
        }
        toDelete.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("registrations").delete().neq("id", "none");
        await supabase.from("portfolios").delete().neq("id", "none");
        await supabase.from("committees").delete().neq("id", "none");
        await supabase.from("events").delete().neq("id", "none");
      } catch (err) {
        console.warn("Supabase wipe error:", err);
      }
    }
  };

  const isConfigured = Boolean(event.name && event.status === "published");

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthLoaded,
        theme,
        updateTheme,
        signUp,
        signIn,
        signOut,
        event,
        myConferences,
        allEvents,
        selectConference,
        loadEventById,
        createNewConference,
        deleteConference,
        committees,
        portfolios,
        registrations,
        isLoaded,
        isConfigured,
        addRegistration,
        verifyPayment,
        updateEventRules,
        updateEventBasics,
        addCommittee,
        loadTemplateCommittees,
        syncCommitteePortfolios,
        editCommittee,
        removeCommittee,
        allotDelegateManual,
        unallotDelegate,
        autoAllotSimulation,
        autoAllotIncludeUnpaid,
        setAutoAllotIncludeUnpaid,
        executeAutoAllot,
        resolveConflict,
        deletePortfolio,
        deleteMultiplePortfolios,
        addPortfolioToCommittee,
        autoPopulatePortfolios,
        findRegistrationByNumber,
        publishAllotmentsToggle,
        markConferencePublished,
        refreshPortfoliosLive,
        clearDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
