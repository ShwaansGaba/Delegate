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

export interface AuthUser {
  id: string;
  email: string;
}

interface AppContextType {
  user: AuthUser | null;
  isAuthLoaded: boolean;
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
        // Query events owned exclusively by this organizer
        const { data: eventsData, error: evErr } = await supabase
          .from("events")
          .select("*")
          .eq("owner_id", activeUserId)
          .order("created_at", { ascending: false });

        if (!evErr && eventsData) {
          const validEvents = eventsData.filter(
            (ev) =>
              ev.id !== "delhi-youth-summit-2026" &&
              ev.id !== "national-conclave-2026" &&
              !ev.name?.toLowerCase().includes("delhi youth summit")
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
          }));

          setMyConferences(parsed);
          setAllEvents(parsed);

          if (parsed.length > 0) {
            const chosen =
              (targetEventId && parsed.find((e) => e.id === targetEventId || e.slug === targetEventId)) ||
              parsed[0];

            setEvent(chosen);

            // Load committees for this conference
            const { data: commsData } = await supabase
              .from("committees")
              .select("*")
              .eq("event_id", chosen.id);

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
            const { data: regsData } = await supabase
              .from("registrations")
              .select("*")
              .eq("event_id", chosen.id)
              .order("created_at", { ascending: false });

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
          } else {
            // New user with 0 conferences: clean slate
            setEvent(EMPTY_EVENT);
            setCommittees([]);
            setPortfolios([]);
            setRegistrations([]);
          }

          setIsLoaded(true);
          return;
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
          setCommittees(parsed.committees || []);
          setPortfolios(parsed.portfolios || []);
          setRegistrations(parsed.registrations || []);
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

  // Sync state to local storage isolated to this user
  useEffect(() => {
    if (user?.id && isLoaded) {
      const userStorageKey = `delegate_storage_${user.id}`;
      try {
        localStorage.setItem(
          userStorageKey,
          JSON.stringify({
            myConferences,
            event,
            committees,
            portfolios,
            registrations,
          })
        );
      } catch {}
    }
  }, [user?.id, isLoaded, myConferences, event, committees, portfolios, registrations]);

  // Real Auth Methods
  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
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
      if (error) return { error: error.message };
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

    const baseName = data?.name?.trim() || "New MUN Conference";
    const slugBase = baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const uniqueId = `mun-${slugBase}-${randomSuffix}`;
    const uniqueSlug = `${slugBase}-${randomSuffix}`;

    const newConf: EventModel = {
      ...EMPTY_EVENT,
      id: uniqueId,
      ownerId: user.id,
      slug: uniqueSlug,
      name: baseName,
      dates: data?.dates || "November 20-22, 2026",
      dateFrom: data?.dateFrom || "2026-11-20",
      dateTo: data?.dateTo || "2026-11-22",
      venue: data?.venue || "Main Auditorium",
      fee: data?.fee ?? 1800,
      schoolFeePerStudent: data?.schoolFeePerStudent ?? 1400,
      deadline: data?.deadline || "November 15, 2026",
      deadlineDate: data?.deadlineDate || "2026-11-15",
      status: "draft",
      rules: {
        allowSchoolTeams: true,
        askPaymentProof: true,
        showTakenPortfoliosLive: true,
        firstComeFirstServed: true,
        allotmentsPublished: false,
      },
    };

    setEvent(newConf);
    setMyConferences((prev) => [newConf, ...prev]);
    setAllEvents((prev) => [newConf, ...prev]);
    setCommittees([]);
    setPortfolios([]);
    setRegistrations([]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("events").insert({
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
          rules: newConf.rules,
        });
      } catch (err) {
        console.warn("Supabase insert conference error:", err);
      }
    }

    return newConf;
  };

  const deleteConference = async (conferenceId: string) => {
    setMyConferences((prev) => prev.filter((c) => c.id !== conferenceId));
    setAllEvents((prev) => prev.filter((c) => c.id !== conferenceId));

    if (event.id === conferenceId) {
      const remaining = myConferences.filter((c) => c.id !== conferenceId);
      if (remaining.length > 0) {
        setEvent(remaining[0]);
      } else {
        setEvent(EMPTY_EVENT);
      }
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from("events").delete().eq("id", conferenceId);
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

    if (isSupabaseConfigured && supabase && updated.id) {
      supabase
        .from("events")
        .update({ rules: updated.rules })
        .eq("id", updated.id)
        .then();
    }
  };

  const updateEventBasics = (updates: Partial<EventModel>) => {
    const updated = {
      ...event,
      ...updates,
      ownerId: event.ownerId || user?.id,
    };
    setEvent(updated);
    setMyConferences((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    if (isSupabaseConfigured && supabase && updated.id) {
      supabase
        .from("events")
        .update({
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
          rules: updated.rules,
        })
        .eq("id", updated.id)
        .then();
    }
  };

  const addCommittee = (
    data: Omit<MunCommittee, "id" | "eventId">,
    countries?: { name: string; code: string }[]
  ) => {
    const cleanCommSlug = data.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newId = `${event.id}-${cleanCommSlug}`;
    const newComm: MunCommittee = {
      ...data,
      id: newId,
      eventId: event.id || "conference-1",
    };
    setCommittees((prev) => [...prev.filter((c) => c.id !== newId), newComm]);

    const countriesToAdd = countries || [
      { name: "India", code: "IN" },
      { name: "United States", code: "US" },
      { name: "United Kingdom", code: "GB" },
      { name: "France", code: "FR" },
      { name: "China", code: "CN" },
      { name: "Russia", code: "RU" },
      { name: "Brazil", code: "BR" },
      { name: "Japan", code: "JP" },
      { name: "Germany", code: "DE" },
      { name: "Kenya", code: "KE" },
    ];

    const newPorts: MunPortfolio[] = countriesToAdd.map((c) => ({
      id: `${newId}-${c.code.toLowerCase()}`,
      committeeId: newId,
      countryName: c.name,
      code: c.code,
      status: "open",
    }));

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

      tpl.countries.forEach((c) => {
        newPorts.push({
          id: `${commId}-${c.code.toLowerCase()}`,
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

  const editCommittee = (id: string, updates: Partial<MunCommittee>) => {
    setCommittees((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (isSupabaseConfigured && supabase) {
      supabase.from("committees").update(updates).eq("id", id).then();
    }
  };

  const removeCommittee = (id: string) => {
    setCommittees((prev) => prev.filter((c) => c.id !== id));
    setPortfolios((prev) => prev.filter((p) => p.committeeId !== id));
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
    const cleanId = `${committeeId}-${item.code.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString().slice(-4)}`;
    const newPort: MunPortfolio = {
      id: cleanId,
      committeeId,
      countryName: item.name,
      code: item.code.toUpperCase().slice(0, 2),
      status: "open",
    };
    setPortfolios((prev) => [...prev, newPort]);

    if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase && updated.id) {
      supabase.from("events").update({ status: "published" }).eq("id", updated.id).then();
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

  const clearDatabase = () => {
    setRegistrations([]);
    setPortfolios((prev) => prev.map((p) => ({ ...p, status: "open", allottedRegistrationId: undefined })));
  };

  const isConfigured = Boolean(event.name && event.status === "published");

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthLoaded,
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
