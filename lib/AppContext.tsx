"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  committees: MunCommittee[];
  portfolios: MunPortfolio[];
  registrations: Registration[];
  isLoaded: boolean;
  isConfigured: boolean;
  addRegistration: (newReg: Omit<Registration, "id" | "registrationNumber" | "createdAt">) => Registration;
  verifyPayment: (regId: string) => void;
  updateEventRules: (newRules: Partial<EventModel["rules"]>) => void;
  updateEventBasics: (updates: Partial<EventModel>) => void;
  addCommittee: (committee: Omit<MunCommittee, "id" | "eventId">, countries?: { name: string; code: string }[]) => void;
  loadTemplateCommittees: () => void;
  editCommittee: (id: string, updates: Partial<MunCommittee>) => void;
  removeCommittee: (id: string) => void;
  allotDelegateManual: (regId: string, committeeId: string, portfolioId: string) => void;
  unallotDelegate: (regId: string) => void;
  autoAllotSimulation: AutoAllotSimulationResult;
  executeAutoAllot: () => void;
  resolveConflict: (portfolioId: string, chosenRegId: string) => void;
  deletePortfolio: (portfolioId: string) => void;
  deleteMultiplePortfolios: (portfolioIds: string[]) => void;
  addPortfolioToCommittee: (committeeId: string, item: { name: string; code: string }) => void;
  findRegistrationByNumber: (num: string) => Registration | undefined;
  publishAllotmentsToggle: () => void;
  markConferencePublished: () => void;
  clearDatabase: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "mun_platform_database_clean_v2";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [event, setEvent] = useState<EventModel>(EMPTY_EVENT);
  const [committees, setCommittees] = useState<MunCommittee[]>([]);
  const [portfolios, setPortfolios] = useState<MunPortfolio[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Authentication: Supabase integration with seamless mock fallback
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUser({ id: session.user.id, email: session.user.email });
        }
        setIsAuthLoaded(true);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setUser({ id: session.user.id, email: session.user.email });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      try {
        const stored = localStorage.getItem("delegate_auth_user");
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
      setIsAuthLoaded(true);
    }
  }, []);

  const signUp = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      if (data?.user?.email) {
        setUser({ id: data.user.id, email: data.user.email });
      }
      return {};
    } else {
      const newUser = { id: `user_${Date.now()}`, email };
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
      const newUser = { id: `user_${Date.now()}`, email };
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
    try {
      localStorage.removeItem("delegate_auth_user");
    } catch {}
  };

  useEffect(() => {
    async function loadInitialData() {
      // 1. Initial load from localStorage for immediate local rendering
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.event && Array.isArray(parsed.registrations)) {
            setEvent(parsed.event);
            setCommittees(parsed.committees || []);
            setPortfolios(parsed.portfolios || []);
            setRegistrations(parsed.registrations);
          }
        }
      } catch {
        // Ignore
      }

      // 2. Fetch live data from Supabase if configured and tables exist
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: eventsData, error: evErr } = await supabase
            .from("events")
            .select("*")
            .limit(1);

          if (!evErr && eventsData && eventsData.length > 0) {
            const ev = eventsData[0];
            const parsedEvent: EventModel = {
              id: ev.id,
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

            if (commsData) {
              setCommittees(
                commsData.map((c) => ({
                  id: c.id,
                  eventId: c.event_id,
                  name: c.name,
                  agenda: c.agenda,
                  totalSeats: c.total_seats,
                  backgroundGuideUrl: c.background_guide_url,
                }))
              );
            }

            const { data: portsData } = await supabase.from("portfolios").select("*");
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
          }
        } catch (err) {
          console.warn("Supabase load skipped or tables not yet created:", err);
        }
      }

      setIsLoaded(true);
    }

    loadInitialData();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            event,
            committees,
            portfolios,
            registrations,
          })
        );
      } catch (err) {
        console.warn("Could not save to localStorage", err);
      }
    }
  }, [event, committees, portfolios, registrations, isLoaded]);

  const isConfigured = Boolean(event.name && event.status === "published");

  const addRegistration = (
    data: Omit<Registration, "id" | "registrationNumber" | "createdAt">
  ): Registration => {
    const nextSeq = registrations.length + 2048;
    const newRegNum = `MUN ${nextSeq}`;
    const newReg: Registration = {
      ...data,
      id: `reg-${nextSeq}`,
      registrationNumber: newRegNum,
      createdAt: new Date().toISOString(),
    };

    const updatedRegs = [newReg, ...registrations];
    setRegistrations(updatedRegs);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("registrations")
        .insert({
          id: newReg.id,
          event_id: newReg.eventId || event.id || "conference-1",
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
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase insert registration:", error);
        });
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
      id: updates.name ? updates.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : event.id,
    };
    setEvent(updated);

    if (isSupabaseConfigured && supabase && updated.name) {
      supabase
        .from("events")
        .upsert({
          id: updated.id,
          organization_id: updated.organizationId,
          type: updated.type,
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
        .then(({ error }) => {
          if (error) console.warn("Supabase upsert event:", error);
        });
    }
  };

  const addCommittee = (
    data: Omit<MunCommittee, "id" | "eventId">,
    countries?: { name: string; code: string }[]
  ) => {
    const newId = data.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newComm: MunCommittee = {
      ...data,
      id: newId,
      eventId: event.id || "conference-1",
    };
    setCommittees((prev) => [...prev.filter((c) => c.id !== newId), newComm]);

    // Add portfolio countries
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
      const commId = tpl.name.toLowerCase();
      newComms.push({
        id: commId,
        eventId: event.id || "new-conference",
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

  const removeCommittee = (id: string) => {
    setCommittees((prev) => prev.filter((c) => c.id !== id));
    setPortfolios((prev) => prev.filter((p) => p.committeeId !== id));

    if (isSupabaseConfigured && supabase) {
      supabase.from("committees").delete().eq("id", id).then();
    }
  };

  const allotDelegateManual = (regId: string, committeeId: string, portfolioId: string) => {
    const updatedPorts = portfolios.map((p) => {
      if (p.id === portfolioId) {
        return { ...p, status: "taken" as const, allottedRegistrationId: regId };
      }
      if (p.allottedRegistrationId === regId) {
        return { ...p, status: "open" as const, allottedRegistrationId: undefined };
      }
      return p;
    });

    const updatedRegs = registrations.map((r) => {
      if (r.id === regId) {
        const allotment: MunAllotment = {
          registrationId: regId,
          committeeId,
          portfolioId,
          matchedPreferenceRank: 1,
          matchedPortfolioRank: 1,
          allottedAt: new Date().toISOString(),
          status: "tentative",
        };
        return { ...r, allotment };
      }
      return r;
    });

    setPortfolios(updatedPorts);
    setRegistrations(updatedRegs);
  };

  const unallotDelegate = (regId: string) => {
    const updatedPorts = portfolios.map((p) => {
      if (p.allottedRegistrationId === regId) {
        return { ...p, status: "open" as const, allottedRegistrationId: undefined };
      }
      return p;
    });

    const updatedRegs = registrations.map((r) => {
      if (r.id === regId) {
        const copy = { ...r };
        delete copy.allotment;
        return copy;
      }
      return r;
    });

    setPortfolios(updatedPorts);
    setRegistrations(updatedRegs);
  };

  const autoAllotSimulation = simulateAutoAllotment(
    registrations,
    portfolios,
    committees,
    event.rules.firstComeFirstServed
  );

  const executeAutoAllot = () => {
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
      const regId = Object.entries(allotmentMap).find(([_, a]) => a.portfolioId === p.id)?.[0];
      if (regId) {
        return { ...p, status: "taken" as const, allottedRegistrationId: regId };
      }
      return p;
    });

    setRegistrations(updatedRegs);
    setPortfolios(updatedPorts);
  };

  const resolveConflict = (portfolioId: string, chosenRegId: string) => {
    const port = portfolios.find((p) => p.id === portfolioId);
    if (!port) return;
    allotDelegateManual(chosenRegId, port.committeeId, portfolioId);
  };

  const findRegistrationByNumber = (num: string): Registration | undefined => {
    const cleaned = num.trim().toUpperCase().replace(/\s+/g, " ");
    return registrations.find(
      (r) =>
        r.registrationNumber.toUpperCase().replace(/\s+/g, " ") === cleaned ||
        r.registrationNumber.toUpperCase().replace(/\s+/g, "") === cleaned.replace(/\s+/g, "")
    );
  };

  const publishAllotmentsToggle = () => {
    setEvent((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        allotmentsPublished: !prev.rules.allotmentsPublished,
      },
    }));
  };

  const markConferencePublished = () => {
    setEvent((prev) => {
      const updated = {
        ...prev,
        status: "published" as const,
      };
      if (isSupabaseConfigured && supabase && updated.id) {
        supabase
          .from("events")
          .update({ status: "published" })
          .eq("id", updated.id)
          .then();
      }
      return updated;
    });
  };

  const clearDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEvent(EMPTY_EVENT);
    setCommittees([]);
    setPortfolios([]);
    setRegistrations([]);

    if (isSupabaseConfigured && supabase) {
      supabase.from("registrations").delete().neq("id", "_none_").then();
      supabase.from("portfolios").delete().neq("id", "_none_").then();
      supabase.from("committees").delete().neq("id", "_none_").then();
      supabase.from("events").delete().neq("id", "_none_").then();
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthLoaded,
        signUp,
        signIn,
        signOut,
        event,
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
        deletePortfolio,
        deleteMultiplePortfolios,
        addPortfolioToCommittee,
        allotDelegateManual,
        unallotDelegate,
        autoAllotSimulation,
        executeAutoAllot,
        resolveConflict,
        findRegistrationByNumber,
        publishAllotmentsToggle,
        markConferencePublished,
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
