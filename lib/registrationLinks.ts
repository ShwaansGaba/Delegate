/**
 * Helper utility to construct distinct conference registration & browsing links.
 * Works seamlessly across local development (localhost) and GitHub Pages subpath deployment (/Delegate).
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

/**
 * Resolve static asset URLs (logos, icons) taking GitHub Pages basePath into account.
 */
export function getAssetUrl(relativePath: string): string {
  const clean = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  if (typeof window === "undefined") {
    return process.env.GITHUB_PAGES === "true" ? `/Delegate${clean}` : clean;
  }
  const isGhPages = window.location.pathname.startsWith("/Delegate");
  return isGhPages ? `/Delegate${clean}` : clean;
}

/**
 * Public conference portal link (e.g. /c/?id=delhi-mun-2026)
 */
export function getConferencePublicLink(slugOrId: string): string {
  const base = getBaseAppUrl();
  return `${base}/c/?id=${encodeURIComponent(slugOrId || "conference")}`;
}

/**
 * Direct registration link for individual delegates or school delegation teams
 */
export function getConferenceRegistrationLink(
  eventId: string,
  type: "individual" | "team" = "individual"
): string {
  const base = getBaseAppUrl();
  const route = type === "team" ? "/register/team" : "/register";
  return `${base}${route}/?event=${encodeURIComponent(eventId || "conference")}`;
}

/**
 * Direct committee agenda & vacancy matrix link
 */
export function getConferenceBrowseLink(eventId: string): string {
  const base = getBaseAppUrl();
  return `${base}/browse/?event=${encodeURIComponent(eventId || "conference")}`;
}

/**
 * Direct status check link for a specific conference
 */
export function getConferenceStatusLink(eventId: string, registrationNum?: string): string {
  const base = getBaseAppUrl();
  const numPart = registrationNum ? `&num=${encodeURIComponent(registrationNum)}` : "";
  return `${base}/status/?event=${encodeURIComponent(eventId || "conference")}${numPart}`;
}
