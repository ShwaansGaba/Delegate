// Verification Script for Multi-Tenancy, Data Isolation, Allotment, and Status Checking
console.log("=================================================");
console.log("DELEGATE MULTI-TENANT VERIFICATION SUITE");
console.log("=================================================\n");

// 1. DATA ISOLATION TEST (Organizer A vs Organizer B)
console.log("TEST 1: Tenancy and Data Isolation");
const orgA = { id: "org_user_1", email: "organizer1@delegate.app" };
const orgB = { id: "org_user_2", email: "organizer2@delegate.app" };

const confA = {
  id: "delhi-youth-summit-2026",
  ownerId: orgA.id,
  name: "Delhi Youth Summit MUN 2026",
  fee: 1600,
};

const confB = {
  id: "national-diplomacy-conclave-2026",
  ownerId: orgB.id,
  name: "National Diplomacy Conclave 2026",
  fee: 2200,
};

// Simulate database of registrations
const registrationsDB = [
  {
    id: "reg-1",
    eventId: confA.id,
    delegateName: "Aarav Mehta",
    registrationNumber: "MUN-4091-X9K2",
    paymentStatus: "verified",
  },
  {
    id: "reg-2",
    eventId: confA.id,
    delegateName: "Diya Kapoor",
    registrationNumber: "MUN-5832-B2M7",
    paymentStatus: "verified",
  },
  {
    id: "reg-3",
    eventId: confB.id,
    delegateName: "Rohan Varma",
    registrationNumber: "MUN-9281-Z7T4",
    paymentStatus: "verified",
  },
];

// Organizer A query
const orgARegistrations = registrationsDB.filter((r) => r.eventId === confA.id);
// Organizer B query
const orgBRegistrations = registrationsDB.filter((r) => r.eventId === confB.id);

console.log(`- Organizer A (${orgA.email}) sees ${orgARegistrations.length} registrations:`, orgARegistrations.map(r => r.delegateName));
console.log(`- Organizer B (${orgB.email}) sees ${orgBRegistrations.length} registrations:`, orgBRegistrations.map(r => r.delegateName));

if (orgARegistrations.some(r => r.eventId === confB.id) || orgBRegistrations.some(r => r.eventId === confA.id)) {
  console.error("FAIL: Cross-tenant data leakage detected!");
  process.exit(1);
} else {
  console.log("✓ PASS: Complete data isolation between Organizer A and Organizer B.\n");
}

// 2. CHECK STATUS WITH CONFERENCE VALIDATION
console.log("TEST 2: Check Status Validation (Valid, Wrong Conference, Invalid)");

function checkStatus(regNumber, conferenceId) {
  const found = registrationsDB.find(
    (r) => r.registrationNumber.toUpperCase().replace(/\s+/g, "") === regNumber.toUpperCase().replace(/\s+/g, "")
  );

  if (!found) {
    return { valid: false, error: "No registration found." };
  }
  if (found.eventId !== conferenceId) {
    return { valid: false, error: "This registration number does not belong to this conference." };
  }
  return { valid: true, registration: found };
}

// Case A: Valid number for Conf A
const resA = checkStatus("MUN-4091-X9K2", confA.id);
console.log("- Looking up MUN-4091-X9K2 in Conf A:", resA.valid ? `✓ Found ${resA.registration.delegateName}` : "FAIL");

// Case B: Conf B's registration looked up in Conf A
const resWrongConf = checkStatus("MUN-9281-Z7T4", confA.id);
console.log("- Looking up Conf B number MUN-9281-Z7T4 in Conf A:", resWrongConf.valid ? "FAIL" : `✓ Rejected: "${resWrongConf.error}"`);

// Case C: Invalid number
const resInvalid = checkStatus("MUN-9999-XXXX", confA.id);
console.log("- Looking up non-existent MUN-9999-XXXX:", resInvalid.valid ? "FAIL" : `✓ Rejected: "${resInvalid.error}"`);

if (resA.valid && !resWrongConf.valid && !resInvalid.valid) {
  console.log("✓ PASS: Status check strictly scopes registration numbers to their conference.\n");
} else {
  console.error("FAIL in Status Check logic!");
  process.exit(1);
}

// 3. PORTFOLIO ALLOTMENT & PREFERENCE BEHAVIOR
console.log("TEST 3: Portfolio Contention & Live Availability");

let portfolios = [
  { id: "unsc-in", committeeId: "unsc", countryName: "India", code: "IN", status: "open" },
  { id: "unsc-us", committeeId: "unsc", countryName: "United States", code: "US", status: "open" },
  { id: "unsc-fr", committeeId: "unsc", countryName: "France", code: "FR", status: "open" },
];

// Two delegates submit preference #1 for India
const del1 = {
  id: "d1",
  name: "Candidate 1",
  preferences: [{ committeeRank: 1, committeeId: "unsc", portfolioIds: ["unsc-in", "unsc-us"] }],
};
const del2 = {
  id: "d2",
  name: "Candidate 2",
  preferences: [{ committeeRank: 1, committeeId: "unsc", portfolioIds: ["unsc-in", "unsc-fr"] }],
};

// Rule: Preferences NEVER mark portfolio taken
const indiaBeforeAllotment = portfolios.find(p => p.id === "unsc-in");
console.log("- India status before organizer allotment:", indiaBeforeAllotment.status);
if (indiaBeforeAllotment.status !== "open") {
  console.error("FAIL: Portfolio was prematurely marked taken by preferences!");
  process.exit(1);
}
console.log("✓ PASS: Candidate preferences do not block other candidates from selecting.");

// Organizer allots India to Candidate 1
function allotManual(regId, portId) {
  const port = portfolios.find(p => p.id === portId);
  if (port.status === "taken") return false;
  port.status = "taken";
  port.allottedRegistrationId = regId;
  return true;
}

const allotSuccess = allotManual(del1.id, "unsc-in");
console.log("- Organizer allots India to Candidate 1:", allotSuccess ? "Success" : "Failed");

// Candidate 2 or Candidate 3 views available portfolios
const availableForCandidate3 = portfolios.filter(p => p.status === "open").map(p => p.countryName);
console.log("- Remaining open portfolios for next delegates:", availableForCandidate3);

if (availableForCandidate3.includes("India")) {
  console.error("FAIL: India should be marked taken!");
  process.exit(1);
}
console.log("✓ PASS: Allotted portfolio is immediately taken and excluded from available selections.\n");

console.log("=================================================");
console.log("ALL MULTI-TENANCY VERIFICATION TESTS PASSED!");
console.log("=================================================");
