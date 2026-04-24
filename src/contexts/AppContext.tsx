import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { migratePaidBills } from "../utils/migration";
import { todayBerlinDate, filterBillsByDate } from "../utils/dateHelpers";
import type { View, Bill, DailySalesTab, TableId } from "../types";

interface AppContextValue {
  // Navigation
  view: View;
  setView: (view: View) => void;
  activeTable: TableId | null;
  setActiveTable: (id: TableId | null) => void;
  ticketTable: TableId | null;
  setTicketTable: (id: TableId | null) => void;

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;

  // Paid bills (read)
  paidBills: Bill[];

  // Date selection for Daily Sales
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Bill actions (write — localStorage only)
  addPaidBill: (bill: Bill) => void;
  markBillAddedToPOS: (billIndex: number) => void;
  restoreBillFromPOS: (billIndex: number) => void;
  removePaidBillItem: (billIndex: number, itemId: string) => void;
  restorePaidBillItem: (billIndex: number, itemId: string) => void;

  // Edit mode
  editingBillIndex: number | null;
  billSnapshot: Bill | null;
  enterBillEditMode: (billIndex: number) => void;
  exitBillEditMode: () => void;
  cancelBillEditMode: () => void;

  // Daily sales UI
  dailySalesTab: DailySalesTab;
  setDailySalesTab: (tab: DailySalesTab) => void;
  deletingBillIndex: number | null;
  setDeletingBillIndex: (idx: number | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("tables");
  const [activeTable, setActiveTable] = useState<TableId | null>(null);
  const [ticketTable, setTicketTable] = useState<TableId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dailySalesTab, setDailySalesTab] = useState<DailySalesTab>("chronological");
  const [editingBillIndex, setEditingBillIndex] = useState<number | null>(null);
  const [billSnapshot, setBillSnapshot] = useState<Bill | null>(null);
  const [deletingBillIndex, setDeletingBillIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayBerlinDate());

  // Load all bills from localStorage
  const [allPaidBills, setAllPaidBills] = useState<Bill[]>(() => {
    try {
      const stored = localStorage.getItem("paidBills");
      if (!stored) return [];
      const bills = JSON.parse(stored);
      // Migrate legacy bills if needed
      const needsMigration = bills.some((bill: Bill) =>
        bill.items.some((item) => !(item as any).posId)
      );
      return needsMigration ? migratePaidBills(bills) : bills;
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever bills change
  useEffect(() => {
    localStorage.setItem("paidBills", JSON.stringify(allPaidBills));
  }, [allPaidBills]);

  // Filter bills by selected date
  const paidBills = useMemo(() =>
    filterBillsByDate(allPaidBills, selectedDate),
    [allPaidBills, selectedDate]
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Add a new paid bill
  const addPaidBill = useCallback((bill: Bill) => {
    setAllPaidBills((prev) => [...prev, bill]);
  }, []);

  const markBillAddedToPOS = useCallback((billIndex: number) => {
    const billToUpdate = paidBills[billIndex];
    setAllPaidBills((prev) =>
      prev.map((b) =>
        b.timestamp === billToUpdate.timestamp && b.tableId === billToUpdate.tableId
          ? { ...b, addedToPOS: true }
          : b
      )
    );
    setEditingBillIndex(null);
    setBillSnapshot(null);
  }, [paidBills]);

  const restoreBillFromPOS = useCallback((billIndex: number) => {
    const billToUpdate = paidBills[billIndex];
    const restoredItems = billToUpdate.items.map(({ crossedQty: _, crossed: __, ...rest }) => rest);
    setAllPaidBills((prev) =>
      prev.map((b) =>
        b.timestamp === billToUpdate.timestamp && b.tableId === billToUpdate.tableId
          ? { ...b, addedToPOS: false, items: restoredItems }
          : b
      )
    );
  }, [paidBills]);

  const removePaidBillItem = useCallback((billIndex: number, itemId: string) => {
    const billToUpdate = paidBills[billIndex];
    const updatedItems = billToUpdate.items.map((o) =>
      o.id === itemId
        ? { ...o, crossedQty: Math.min((o.crossedQty ?? 0) + 1, o.qty) }
        : o
    );
    setAllPaidBills((prev) =>
      prev.map((b) =>
        b.timestamp === billToUpdate.timestamp && b.tableId === billToUpdate.tableId
          ? { ...b, items: updatedItems }
          : b
      )
    );
  }, [paidBills]);

  const restorePaidBillItem = useCallback((billIndex: number, itemId: string) => {
    const billToUpdate = paidBills[billIndex];
    const updatedItems = billToUpdate.items.map((o) =>
      o.id === itemId
        ? { ...o, crossedQty: Math.max((o.crossedQty ?? 0) - 1, 0), crossed: false }
        : o
    );
    setAllPaidBills((prev) =>
      prev.map((b) =>
        b.timestamp === billToUpdate.timestamp && b.tableId === billToUpdate.tableId
          ? { ...b, items: updatedItems }
          : b
      )
    );
  }, [paidBills]);

  // Edit mode: mutations during edit are local only
  const enterBillEditMode = useCallback((billIndex: number) => {
    setBillSnapshot({ ...paidBills[billIndex] });
    setEditingBillIndex(billIndex);
  }, [paidBills]);

  const exitBillEditMode = useCallback(() => {
    // No sync needed - localStorage auto-saves
    setEditingBillIndex(null);
    setBillSnapshot(null);
  }, []);

  const cancelBillEditMode = useCallback(() => {
    if (billSnapshot !== null && editingBillIndex !== null) {
      const billToRestore = paidBills[editingBillIndex];
      setAllPaidBills((prev) =>
        prev.map((b) =>
          b.timestamp === billToRestore.timestamp && b.tableId === billToRestore.tableId
            ? billSnapshot
            : b
        )
      );
    }
    setEditingBillIndex(null);
    setBillSnapshot(null);
  }, [billSnapshot, editingBillIndex, paidBills]);

  return (
    <AppContext.Provider value={{
      view, setView,
      activeTable, setActiveTable,
      ticketTable, setTicketTable,
      toast, showToast,
      paidBills,
      selectedDate, setSelectedDate,
      addPaidBill,
      markBillAddedToPOS,
      restoreBillFromPOS,
      removePaidBillItem,
      restorePaidBillItem,
      editingBillIndex,
      billSnapshot,
      enterBillEditMode,
      exitBillEditMode,
      cancelBillEditMode,
      dailySalesTab, setDailySalesTab,
      deletingBillIndex, setDeletingBillIndex,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
