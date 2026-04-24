import type { Bill } from "../types";

/**
 * Get today's date in Berlin timezone (YYYY-MM-DD format)
 */
export function todayBerlinDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" })
    .format(new Date());
}

/**
 * Filter bills by Berlin timezone date
 */
export function filterBillsByDate(bills: Bill[], berlinDate: string): Bill[] {
  return bills.filter(bill => {
    const billDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin"
    }).format(new Date(bill.timestamp));
    return billDate === berlinDate;
  });
}
