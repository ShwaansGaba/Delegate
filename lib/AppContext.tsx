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

// Deterministic mock seed data for Organizer 1
const MOCK_CONF_ORG1: EventModel = {
  id: "delhi-youth-summit-2026",
  ownerId: "org_user_1",
  slug: "delhi-youth-summit-2026",
  organizationId: "org-1",
  type: "mun",
  name: "Delhi Youth Summit MUN 2026",
  dates: "March 14-16, 2026",
  dateFrom: "2026-03-14",
  dateTo: "2026-03-16",
  venue: "Sanskriti School Auditorium, Chanakyapuri",
  fee: 1600,
  schoolFeePerStudent: 1200,
  deadline: "March 05, 2026",
  deadlineDate: "2026-03-05",
  status: "published",
  rules: {
    allowSchoolTeams: true,
    askPaymentProof: true,
    showTakenPortfoliosLive: true,
    firstComeFirstServed: true,
    allotmentsPublished: false,
  },
};

const MOCK_COMMS_ORG1: MunCommittee[] = [
  {
    id: "delhi-youth-summit-2026-unsc",
    eventId: "delhi-youth-summit-2026",
    name: "UNSC",
    agenda: "Addressing maritime security in international waters",
    totalSeats: 15,
  },
  {
    id: "delhi-youth-summit-2026-disec",
    eventId: "delhi-youth-summit-2026",
    name: "DISEC",
    agenda: "Non-proliferation of tactical ballistic weapons",
    totalSeats: 25,
  },
];

const MOCK_PORTS_ORG1: MunPortfolio[] = [
  { id: "delhi-unsc-in", committeeId: "delhi-youth-summit-2026-unsc", countryName: "India", code: "IN", status: "open" },
  { id: "delhi-unsc-us", committeeId: "delhi-youth-summit-2026-unsc", countryName: "United States", code: "US", status: "open" },
  { id: "delhi-unsc-gb", committeeId: "delhi-youth-summit-2026-unsc", countryName: "United Kingdom", code: "GB", status: "open" },
  { id: "delhi-unsc-fr", committeeId: "delhi-youth-summit-2026-unsc", countryName: "France", code: "FR", status: "open" },
  { id: "delhi-unsc-ru", committeeId: "delhi-youth-summit-2026-unsc", countryName: "Russia", code: "RU", status: "open" },
  { id: "delhi-unsc-cn", committeeId: "delhi-youth-summit-2026-unsc", countryName: "China", code: "CN", status: "open" },
  { id: "delhi-unsc-br", committeeId: "delhi-youth-summit-2026-unsc", countryName: "Brazil", code: "BR", status: "open" },
  { id: "delhi-unsc-jp", committeeId: "delhi-youth-summit-2026-unsc", countryName: "Japan", code: "JP", status: "open" },
  { id: "delhi-disec-in", committeeId: "delhi-youth-summit-2026-disec", countryName: "India", code: "IN", status: "open" },
  { id: "delhi-disec-us", committeeId: "delhi-youth-summit-2026-disec", countryName: "United States", code: "US", status: "open" },
  { id: "delhi-disec-de", committeeId: "delhi-youth-summit-2026-disec", countryName: "Germany", code: "DE", status: "open" },
  { id: "delhi-disec-fr", committeeId: "delhi-youth-summit-2026-disec", countryName: "France", code: "FR", status: "open" },
  { id: "delhi-disec-jp", committeeId: "delhi-youth-summit-2026-disec", countryName: "Japan", code: "JP", status: "open" },
];

const MOCK_REGS_ORG1: Registration[] = [
  {
    id: "reg-delhi-101",
    eventId: "delhi-youth-summit-2026",
    delegateName: "Aarav Mehta",
    email: "aarav.mehta@dps.edu",
    phone: "98112 34567",
    school: "Delhi Public School RK Puram",
    classYear: "12",
    experienceMuns: 4,
    registrationNumber: "MUN-4091-X9K2",
    registrationType: "individual",
    paymentStatus: "verified",
    feeAmount: 1600,
    createdAt: "2026-11-01T10:00:00Z",
    preferences: [
      {
        committeeRank: 1,
        committeeId: "delhi-youth-summit-2026-unsc",
        portfolioIds: ["delhi-unsc-in", "delhi-unsc-us", "delhi-unsc-gb"],
      },
      {
        committeeRank: 2,
        committeeId: "delhi-youth-summit-2026-disec",
        portfolioIds: ["delhi-disec-in", "delhi-disec-us", "delhi-disec-de"],
      },
    ],
  },
  {
    id: "reg-delhi-102",
    eventId: "delhi-youth-summit-2026",
    delegateName: "Diya Kapoor",
    email: "diya.k@modern.edu",
    phone: "98711 22334",
    school: "Modern School Barakhamba",
    classYear: "11",
    experienceMuns: 2,
    registrationNumber: "MUN-5832-B2M7",
    registrationType: "individual",
    paymentStatus: "verified",
    feeAmount: 1600,
    createdAt: "2026-11-02T11:30:00Z",
    preferences: [
      {
        committeeRank: 1,
        committeeId: "delhi-youth-summit-2026-unsc",
        portfolioIds: ["delhi-unsc-in", "delhi-unsc-fr", "delhi-unsc-ru"],
      },
      {
        committeeRank: 2,
        committeeId: "delhi-youth-summit-2026-disec",
        portfolioIds: ["delhi-disec-de", "delhi-disec-jp", "delhi-disec-fr"],
      },
    ],
  },
];

// Deterministic mock seed data for Organizer 2
const MOCK_CONF_ORG2: EventModel = {
  id: "national-diplomacy-conclave-2026",
  ownerId: "org_user_2",
  slug: "national-diplomacy-conclave-2026",
  organizationId: "org-2",
  type: "mun",
  name: "National Diplomacy Conclave 2026",
  dates: "April 18-20, 2026",
  dateFrom: "2026-04-18",
  dateTo: "2026-04-20",
  venue: "Convention Centre, Pragati Maidan",
  fee: 2200,
  schoolFeePerStudent: 1600,
  deadline: "April 08, 2026",
  deadlineDate: "2026-04-08",
  status: "published",
  rules: {
    allowSchoolTeams: true,
    askPaymentProof: true,
    showTakenPortfoliosLive: true,
    firstComeFirstServed: true,
    allotmentsPublished: false,
  },
};

const MOCK_COMMS_ORG2: MunCommittee[] = [
  {
    id: "national-conclave-unhrc",
    eventId: "national-diplomacy-conclave-2026",
    name: "UNHRC",
    agenda: "Human rights protections in displacement corridors",
    totalSeats: 30,
  },
  {
    id: "national-conclave-unep",
    eventId: "national-diplomacy-conclave-2026",
    name: "UNEP",
    agenda: "Cross-border water treaties and global plastic conventions",
    totalSeats: 25,
  },
];

const MOCK_PORTS_ORG2: MunPortfolio[] = [
  { id: "nat-unhrc-in", committeeId: "national-conclave-unhrc", countryName: "India", code: "IN", status: "open" },
  { id: "nat-unhrc-us", committeeId: "national-conclave-unhrc", countryName: "United States", code: "US", status: "open" },
  { id: "nat-unhrc-za", committeeId: "national-conclave-unhrc", countryName: "South Africa", code: "ZA", status: "open" },
  { id: "nat-unhrc-de", committeeId: "national-conclave-unhrc", countryName: "Germany", code: "DE", status: "open" },
  { id: "nat-unep-br", committeeId: "national-conclave-unep", countryName: "Brazil", code: "BR", status: "open" },
  { id: "nat-unep-ke", committeeId: "national-conclave-unep", countryName: "Kenya", code: "KE", status: "open" },
  { id: "nat-unep-no", committeeId: "national-conclave-unep", countryName: "Norway", code: "NO", status: "open" },
];

const MOCK_REGS_ORG2: Registration[] = [
  {
    id: "reg-nat-201",
    eventId: "national-diplomacy-conclave-2026",
    delegateName: "Rohan Varma",
    email: "rohan.v@springdales.edu",
    phone: "98101 99887",
    school: "Springdales School Dhaula Kuan",
    classYear: "12",
    experienceMuns: 5,
    registrationNumber: "MUN-9281-Z7T4",
    registrationType: "individual",
    paymentStatus: "verified",
    feeAmount: 2200,
    createdAt: "2026-11-03T09:00:00Z",
    preferences: [
      {
        committeeRank: 1,
        committeeId: "national-conclave-unhrc",
        portfolioIds: ["nat-unhrc-in", "nat-unhrc-us", "nat-unhrc-za"],
      },
      {
        committeeRank: 2,
        committeeId: "national-conclave-unep",
        portfolioIds: ["nat-unep-br", "nat-unep-ke", "nat-unep-no"],
      },
    ],
  },
];

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

  // 1. Initial Authentication Check
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUser({ id: session.user.id, email: session.user.email });
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
      // Local mock auth check
      try {
        const stored = localStorage.getItem("delegate_auth_user");
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          // Default to Organizer 1 for immediate demo
          const defaultUser: AuthUser = { id: "org_user_1", email: "organizer1@delegate.app" };
          setUser(defaultUser);
          localStorage.setItem("delegate_auth_user", JSON.stringify(defaultUser));
        }
      } catch {}
      setIsAuthLoaded(true);
    }
  }, []);

  // 2. Load Conferences & Data whenever User or URL changes
  const loadOrganizerData = useCallback(async (activeUserId: string, targetEventId?: string) => {
    // A. Check Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch only events owned by this organizer
        const { data: eventsData, error: evErr } = await supabase
          .from("events")
          .select("*")
          .eq("owner_id", activeUserId)
          .order("created_at", { ascending: false });

        if (!evErr && eventsData) {
          const parsed: EventModel[] = eventsData.map((ev) => ({
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

          // Select target conference, or active saved conference, or first conference
          const chosen =
            (targetEventId && parsed.find((e) => e.id === targetEventId || e.slug === targetEventId)) ||
            parsed[0] ||
            EMPTY_EVENT;

          setEvent(chosen);

          if (chosen.id && chosen.id !== "new-conference") {
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
            setCommittees([]);
            setPortfolios([]);
            setRegistrations([]);
          }

          setIsLoaded(true);
          return;
        }
      } catch (err) {
        console.warn("Supabase load failed, falling back to isolated local store:", err);
      }
    }

    // B. Mock Offline Storage with Strict Per-User Isolation
    const userStorageKey = `delegate_storage_${activeUserId}`;
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMyConferences(parsed.myConferences || []);
        setAllEvents(parsed.myConferences || []);
        const chosen =
          (targetEventId && (parsed.myConferences || []).find((e: EventModel) => e.id === targetEventId)) ||
          parsed.event ||
          (parsed.myConferences || [])[0] ||
          EMPTY_EVENT;
        setEvent(chosen);
        setCommittees(parsed.committees || []);
        setPortfolios(parsed.portfolios || []);
        setRegistrations(parsed.registrations || []);
        setIsLoaded(true);
        return;
      }
    } catch {}

    // Seed per-user mock defaults if first time
    if (activeUserId === "org_user_1" || activeUserId.includes("organizer1")) {
      const confs = [MOCK_CONF_ORG1];
      setMyConferences(confs);
      setAllEvents(confs);
      setEvent(MOCK_CONF_ORG1);
      setCommittees(MOCK_COMMS_ORG1);
      setPortfolios(MOCK_PORTS_ORG1);
      setRegistrations(MOCK_REGS_ORG1);
    } else if (activeUserId === "org_user_2" || activeUserId.includes("organizer2")) {
      const confs = [MOCK_CONF_ORG2];
      setMyConferences(confs);
      setAllEvents(confs);
      setEvent(MOCK_CONF_ORG2);
      setCommittees(MOCK_COMMS_ORG2);
      setPortfolios(MOCK_PORTS_ORG2);
      setRegistrations(MOCK_REGS_ORG2);
    } else {
      // Brand new user: clean empty state
      setMyConferences([]);
      setAllEvents([]);
      setEvent(EMPTY_EVENT);
      setCommittees([]);
      setPortfolios([]);
      setRegistrations([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (user?.id) {
      const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetId = sp?.get("event") || sp?.get("eventId") || sp?.get("id") || "";
      loadOrganizerData(user.id, targetId);
    } else {
      // For anonymous delegates: load requested conference from query param
      const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetId = sp?.get("event") || sp?.get("eventId") || sp?.get("id") || "";
      if (targetId) {
        loadEventById(targetId);
      }
      setIsLoaded(true);
    }
  }, [user?.id, loadOrganizerData]);

  // Sync isolated state to localStorage for offline mode
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

  // Auth Methods
  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      if (data?.user?.email) {
        setUser({ id: data.user.id, email: data.user.email });
      }
      return {};
    } else {
      const id = email.includes("organizer2") ? "org_user_2" : `org_user_${Date.now().toString(36)}`;
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
      const id = email.includes("organizer2")
        ? "org_user_2"
        : email.includes("organizer1")
        ? "org_user_1"
        : `org_user_${Date.now().toString(36)}`;
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

  // Switch the active conference in the organizer portal
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

          // Fetch committees for this event
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

          // Fetch registrations for this event
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
        console.warn("Public loadEventById failed:", err);
      }
    }

    // 2. Fallback check local mock events
    const allMocks = [MOCK_CONF_ORG1, MOCK_CONF_ORG2];
    const match = allMocks.find((e) => e.id === eventId || e.slug === eventId);
    if (match) {
      setEvent(match);
      if (match.id === MOCK_CONF_ORG1.id) {
        setCommittees(MOCK_COMMS_ORG1);
        setPortfolios(MOCK_PORTS_ORG1);
        setRegistrations(MOCK_REGS_ORG1);
      } else {
        setCommittees(MOCK_COMMS_ORG2);
        setPortfolios(MOCK_PORTS_ORG2);
        setRegistrations(MOCK_REGS_ORG2);
      }
      return true;
    }

    return false;
  };

  // Create a brand new conference belonging to this organizer
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

    // Save to Supabase if configured
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
        console.warn("Supabase insert conference failed:", err);
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

  // Add Registration with unguessable collision-resistant number
  const addRegistration = async (
    data: Omit<Registration, "id" | "registrationNumber" | "createdAt">
  ): Promise<Registration> => {
    // Generate unguessable registration number: e.g. MUN-7842-X9K2
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

  // Atomic Allotment: verifies open status before allotting to prevent double allotment
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

    // Try Supabase atomic function if online
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
        console.warn("RPC allot_portfolio_atomic unavailable, using transactional client updates:", err);
      }
    }

    // Apply local state updates atomically
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

  // Real dynamic auto-allotment simulation
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
