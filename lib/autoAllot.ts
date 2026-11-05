import { Registration, MunPortfolio, MunCommittee, MunAllotment, AllotmentConflict } from "./types";

export interface AutoAllotSimulationResult {
  firstChoiceCount: number;
  secondChoiceCount: number;
  thirdChoiceCount: number;
  conflictsCount: number;
  totalEligible: number;
  proposedAllotments: MunAllotment[];
  conflicts: AllotmentConflict[];
  unhandledDelegates: Registration[];
}

export function simulateAutoAllotment(
  registrations: Registration[],
  portfolios: MunPortfolio[],
  committees: MunCommittee[],
  firstComeFirstServed: boolean = true,
  includeUnpaid: boolean = false
): AutoAllotSimulationResult {
  // Filter eligible delegates: by default, only verified paid delegates
  const eligibleDelegates = includeUnpaid
    ? registrations
    : registrations.filter((r) => r.paymentStatus === "verified");

  if (eligibleDelegates.length === 0) {
    return {
      firstChoiceCount: 0,
      secondChoiceCount: 0,
      thirdChoiceCount: 0,
      conflictsCount: 0,
      totalEligible: 0,
      proposedAllotments: [],
      conflicts: [],
      unhandledDelegates: [],
    };
  }

  // Sort delegates:
  // If firstComeFirstServed: by registration createdAt ascending
  // If weighted (FCFS is off): by experienceMuns descending, then createdAt ascending
  const delegates = [...eligibleDelegates].sort((a, b) => {
    if (firstComeFirstServed) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      if ((b.experienceMuns || 0) !== (a.experienceMuns || 0)) {
        return (b.experienceMuns || 0) - (a.experienceMuns || 0);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  const takenPortfolioIds = new Set<string>();
  const proposedAllotments: MunAllotment[] = [];
  const unhandledDelegates: Registration[] = [];

  let firstChoiceCount = 0;
  let secondChoiceCount = 0;
  let thirdChoiceCount = 0;

  for (const delegate of delegates) {
    let allotted = false;

    // Try committee preference 1, then 2, then 3
    for (const pref of delegate.preferences || []) {
      if (allotted) break;

      // Try portfolios 1, 2, 3 in ranked order
      for (let pIdx = 0; pIdx < (pref.portfolioIds || []).length; pIdx++) {
        const portId = pref.portfolioIds[pIdx];
        const port = portfolios.find((p) => p.id === portId && p.committeeId === pref.committeeId);

        // Check if portfolio is valid and open (not currently taken, nor taken in simulation)
        if (port && port.status !== "taken" && !takenPortfolioIds.has(portId)) {
          takenPortfolioIds.add(portId);
          proposedAllotments.push({
            registrationId: delegate.id,
            committeeId: pref.committeeId,
            portfolioId: portId,
            matchedPreferenceRank: pref.committeeRank,
            matchedPortfolioRank: (pIdx + 1) as 1 | 2 | 3,
            allottedAt: new Date().toISOString(),
            status: "tentative",
          });

          if (pref.committeeRank === 1 && pIdx === 0) {
            firstChoiceCount++;
          } else if (pref.committeeRank <= 2) {
            secondChoiceCount++;
          } else {
            thirdChoiceCount++;
          }

          allotted = true;
          break;
        }
      }
    }

    if (!allotted) {
      unhandledDelegates.push(delegate);
    }
  }

  // Detect genuine portfolio contention conflicts
  const conflicts: AllotmentConflict[] = [];
  const contestedMap = new Map<string, Registration[]>();

  for (const delegate of eligibleDelegates) {
    for (const pref of delegate.preferences || []) {
      for (const portId of pref.portfolioIds || []) {
        if (!contestedMap.has(portId)) {
          contestedMap.set(portId, []);
        }
        contestedMap.get(portId)!.push(delegate);
      }
    }
  }

  contestedMap.forEach((competing, portId) => {
    if (competing.length > 1) {
      const port = portfolios.find((p) => p.id === portId);
      if (port) {
        const comm = committees.find((c) => c.id === port.committeeId);
        conflicts.push({
          portfolioId: port.id,
          portfolioName: port.countryName,
          committeeId: port.committeeId,
          committeeName: comm?.name || "Committee",
          competingDelegates: competing.slice(0, 3).map((reg, idx) => ({
            registration: reg,
            reason:
              idx === 0
                ? "Registered earlier"
                : `Attended ${reg.experienceMuns || 0} MUNs`,
            preferenceTier: "First choice",
          })),
        });
      }
    }
  });

  return {
    firstChoiceCount,
    secondChoiceCount,
    thirdChoiceCount,
    conflictsCount: conflicts.length + unhandledDelegates.length,
    totalEligible: eligibleDelegates.length,
    proposedAllotments,
    conflicts,
    unhandledDelegates,
  };
}
