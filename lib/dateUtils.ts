/**
 * Universal date formatting utilities for Delegato.
 * Enforces DD-MM-YYYY date format everywhere across the platform.
 */

export function formatDateDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";

  if (dateInput instanceof Date) {
    const day = String(dateInput.getDate()).padStart(2, "0");
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const year = dateInput.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const str = String(dateInput).trim();
  if (!str) return "";

  // If full ISO timestamp (e.g. 2026-11-09T17:55:31.000Z)
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, "0");
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const year = parsed.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }

  // Convert all YYYY-MM-DD occurrences to DD-MM-YYYY
  return str.replace(/(\d{4})-(\d{2})-(\d{2})/g, (_match, y, m, d) => `${d}-${m}-${y}`);
}

/**
 * Format two YYYY-MM-DD strings into a clean "DD-MM-YYYY to DD-MM-YYYY" display string.
 */
export function formatRangeDDMMYYYY(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom && !dateTo) return "";
  if (dateFrom && !dateTo) return formatDateDDMMYYYY(dateFrom);
  if (!dateFrom && dateTo) return formatDateDDMMYYYY(dateTo);
  return `${formatDateDDMMYYYY(dateFrom)} to ${formatDateDDMMYYYY(dateTo)}`;
}
