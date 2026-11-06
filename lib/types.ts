// Core Event-Agnostic Types
export type EventType = "mun" | "hackathon" | "debate" | "fest" | "theatre" | "sports";

export interface Organization {
  id: string;
  name: string;
  contactEmail: string;
}

export interface OrganizerUser {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: "admin" | "organizer";
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  classYear: string;
  experienceCount: number; // e.g. number of MUNs / events attended
  attendedEvents: {
    eventId: string;
    eventName: string;
    eventType: EventType;
    year: number;
    roleOrAllotment: string;
    status: "registered" | "attended" | "awarded";
  }[];
}

export interface EventRules {
  allowSchoolTeams: boolean;
  askPaymentProof: boolean;
  showTakenPortfoliosLive: boolean;
  firstComeFirstServed: boolean;
  allotmentsPublished: boolean;
}

export interface ConferenceBranding {
  primaryColor?: string;
  accentColor?: string;
  backgroundEffect?: "none" | "polka-dots" | "lines" | "grid" | "blur";
  cardStyle?: "solid" | "glass" | "minimal";
  monogram?: string;
}

export interface EventModel {
  id: string;
  ownerId?: string;
  slug?: string;
  organizationId: string;
  type: EventType;
  name: string;
  dates: string;
  dateFrom?: string;
  dateTo?: string;
  venue: string;
  fee: number; // Individual delegation fee
  schoolFeePerStudent?: number; // School delegation fee (per student)
  deadline: string;
  deadlineDate?: string;
  status: "draft" | "published" | "closed";
  rules: EventRules;
  branding?: ConferenceBranding;
}

export type PaymentStatus = "unpaid" | "proof_uploaded" | "verified";

export interface Registration {
  id: string;
  eventId: string;
  studentId?: string;
  delegateName: string;
  email: string;
  phone: string;
  school: string;
  classYear: string;
  experienceMuns: number; // Organizers only, hidden from delegates
  registrationNumber: string; // e.g. "MUN 2048"
  registrationType: "individual" | "school_team";
  schoolDelegationId?: string;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  feeAmount: number;
  createdAt: string;
  preferences: CommitteePreference[];
  allotment?: MunAllotment;
}

// MUN-Specific Types
export interface MunCommittee {
  id: string;
  eventId: string;
  name: string;
  agenda: string;
  totalSeats: number;
  backgroundGuideUrl?: string;
}

export interface MunPortfolio {
  id: string;
  committeeId: string;
  countryName: string;
  code: string; // ISO 2-letter uppercase monogram, e.g. "IN", "BR", "JP"
  status: "open" | "taken";
  allottedRegistrationId?: string;
}

export interface CommitteePreference {
  committeeRank: 1 | 2 | 3;
  committeeId: string;
  portfolioIds: [string, string, string]; // 3 ranked portfolios
}

export interface MunAllotment {
  registrationId: string;
  committeeId: string;
  portfolioId: string;
  matchedPreferenceRank: 1 | 2 | 3;
  matchedPortfolioRank: 1 | 2 | 3;
  allottedAt: string;
  status: "tentative" | "published";
}

export interface SchoolDelegation {
  id: string;
  eventId: string;
  schoolName: string;
  headDelegateName: string;
  headDelegateEmail: string;
  headDelegatePhone: string;
  teamSize: number;
  delegates: Registration[];
  createdAt: string;
}

export interface AllotmentConflict {
  portfolioId: string;
  portfolioName: string;
  committeeId: string;
  committeeName: string;
  competingDelegates: {
    registration: Registration;
    reason: string; // e.g. "Registered first, 2 days ago" or "Has attended 4 MUNs"
    preferenceTier: string;
  }[];
}
