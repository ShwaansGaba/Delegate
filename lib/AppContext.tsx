"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  EventModel,
  MunCommittee,
  MunPortfolio,
  Registration,
  MunAllotment,
  AllotmentConflict,
} from "./types";
import { EMPTY_EVENT, STANDARD_TEMPLATES } from "./store";
import { simulateAutoAllotment, AutoAllotSimulationResult } from "./autoAllot";

interface AppContextType {
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
  const [event, setEvent] = useState<EventModel>(EMPTY_EVENT);
  const [committees, setCommittees] = useState<MunCommittee[]>([]);
  const [portfolios, setPortfolios] = useState<MunPortfolio[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.event && Array.isArray(parsed.registrations)) {
          setEvent(parsed.event);
          setCommittees(parsed.committees || []);
          setPortfolios(parsed.portfolios || []);
          setRegistrations(parsed.registrations);
          setIsLoaded(true);
          return;
        }
      }
    } catch {
      // Ignore
    }

    // Truly clean database state: 0 registrations, clean empty slate
    setEvent(EMPTY_EVENT);
    setCommittees([]);
    setPortfolios([]);
    setRegistrations([]);
    setIsLoaded(true);
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
    return newReg;
  };

  const verifyPayment = (regId: string) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, paymentStatus: "verified" as const } : r))
    );
  };

  const updateEventRules = (newRules: Partial<EventModel["rules"]>) => {
    setEvent((prev) => ({
      ...prev,
      rules: { ...prev.rules, ...newRules },
    }));
  };

  const updateEventBasics = (updates: Partial<EventModel>) => {
    setEvent((prev) => ({
      ...prev,
      ...updates,
      id: updates.name ? updates.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : prev.id,
    }));
  };

  const addCommittee = (
    data: Omit<MunCommittee, "id" | "eventId">,
    countries?: { name: string; code: string }[]
  ) => {
    const newId = data.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newComm: MunCommittee = {
      ...data,
      id: newId,
      eventId: event.id,
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
  };

  const editCommittee = (id: string, updates: Partial<MunCommittee>) => {
    setCommittees((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deletePortfolio = (portfolioId: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
    // Also remove from any registration preferences or allotments
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
  };

  const removeCommittee = (id: string) => {
    setCommittees((prev) => prev.filter((c) => c.id !== id));
    setPortfolios((prev) => prev.filter((p) => p.committeeId !== id));
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
    setEvent((prev) => ({
      ...prev,
      status: "published",
    }));
  };

  const clearDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEvent(EMPTY_EVENT);
    setCommittees([]);
    setPortfolios([]);
    setRegistrations([]);
  };

  return (
    <AppContext.Provider
      value={{
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
