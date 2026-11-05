/**
 * Helper utility to construct distinct conference registration & browsing links
 * Supports local development (localhost) and GitHub Pages subpath deployment (/Delegate).
 */

export function getBaseAppUrl(): string {
  if (typeof window === "undefined") {
    return "https://shwaansgaba.github.io/Delegate";
  }
  const origin = window.location.origin;
  const isGhPages = window.location.pathname.startsWith("/Delegate");
  const basePath = isGhPages ? "/Delegate" : "";
  return `${origin}${basePath}`;
}

export function getConferenceRegistrationLink(
  eventId: string,
  type: "individual" | "team" = "individual"
): string {
  const base = getBaseAppUrl();
  const route = type === "team" ? "/register/team" : "/register";
  return `${base}${route}?event=${encodeURIComponent(eventId || "conference")}`;
}

export function getConferenceBrowseLink(eventId: string): string {
  const base = getBaseAppUrl();
  return `${base}/browse?event=${encodeURIComponent(eventId || "conference")}`;
}
