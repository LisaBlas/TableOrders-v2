import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { ARTICLE_ALIASES } from "../data/constants";
import { S } from "../styles/appStyles";
import { Modal } from "../components/Modal";
import { BillCard } from "../components/BillCard";
import { SalesSummary } from "../components/SalesSummary";

export function DailySalesView() {
  const app = useApp();
  const {
    paidBills, setPaidBills,
    dailySalesTab, setDailySalesTab,
    editingBillIndex, setEditingBillIndex,
    billSnapshot, setBillSnapshot,
    showToast,
  } = app;

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearDailySales = () => {
    if (paidBills.length === 0) return;
    setPaidBills([]);
    setShowClearConfirm(false);
    showToast("Daily sales cleared");
  };

  const removePaidBillItem = (billIndex: number, itemId: string) => {
    setPaidBills((prev) => {
      const bills = [...prev];
      const bill = { ...bills[billIndex] };
      bill.items = bill.items.map((o) =>
        o.id === itemId ? { ...o, crossed: !o.crossed } : o
      );
      bills[billIndex] = bill;
      return bills;
    });
  };

  const markBillAsAddedToPOS = (billIndex: number) => {
    setPaidBills((prev) => {
      const bills = [...prev];
      bills[billIndex] = { ...bills[billIndex], addedToPOS: true };
      return bills;
    });
    setEditingBillIndex(null);
    setBillSnapshot(null);
    showToast("Bill marked as Added To POS");
  };

  const enterEditMode = (billIndex: number) => {
    setBillSnapshot({ ...paidBills[billIndex] });
    setEditingBillIndex(billIndex);
  };

  const cancelEditMode = () => {
    if (billSnapshot && editingBillIndex !== null) {
      setPaidBills((prev) => {
        const bills = [...prev];
        bills[editingBillIndex] = billSnapshot;
        return bills;
      });
    }
    setEditingBillIndex(null);
    setBillSnapshot(null);
  };

  const exitEditMode = () => {
    setEditingBillIndex(null);
    setBillSnapshot(null);
  };

  // Total tab aggregation
  const renderTotalTab = () => {
    const itemsMap = new Map<string, { name: string; alias: string | null; qty: number }>();
    paidBills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (!itemsMap.has(item.id)) {
          itemsMap.set(item.id, { name: item.name, alias: (ARTICLE_ALIASES as any)[item.id] || null, qty: 0 });
        }
        itemsMap.get(item.id)!.qty += item.qty;
      });
    });

    const sortedItems = Array.from(itemsMap.values()).sort((a, b) => b.qty - a.qty);

    return (
      <div style={S.billsList}>
        <div style={S.salesSummary}>
          {sortedItems.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < sortedItems.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <span style={{ fontSize: 14, color: "#1a1a1a" }}>{item.alias || item.name}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", minWidth: 28, textAlign: "right" as const }}>{item.qty}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={S.page}>
      <header style={S.header}>
        <button style={S.back} onClick={() => app.setView("tables")}>← Back</button>
        <span style={S.headerTitle}>Daily Sales</span>
        <span />
      </header>

      {paidBills.length === 0 ? (
        <div style={S.emptyState}>
          <div style={S.emptyStateIcon}>📊</div>
          <div style={S.emptyStateText}>
            No sales yet today.<br />Closed bills will appear here.
          </div>
        </div>
      ) : (
        <>
          <div style={S.tabs}>
            <div style={S.tabsContainer}>
              <button
                style={{ ...S.tab, ...(dailySalesTab === "chronological" ? S.tabActive : {}) }}
                onClick={() => setDailySalesTab("chronological")}
              >Chronological</button>
              <button
                style={{ ...S.tab, ...(dailySalesTab === "total" ? S.tabActive : {}) }}
                onClick={() => setDailySalesTab("total")}
              >Total</button>
              <div style={{
                ...S.tabIndicator,
                transform: dailySalesTab === "total" ? "translateX(100%)" : "translateX(0)",
              }} />
            </div>
          </div>

          <SalesSummary paidBills={paidBills} />

          {dailySalesTab === "chronological" && (
            <div style={S.billsList}>
              {[...paidBills].reverse().map((bill, reverseIdx) => {
                const billIndex = paidBills.length - 1 - reverseIdx;
                return (
                  <BillCard
                    key={reverseIdx}
                    bill={bill}
                    isEditing={editingBillIndex === billIndex}
                    onEdit={() => enterEditMode(billIndex)}
                    onDone={exitEditMode}
                    onCancel={cancelEditMode}
                    onDelete={() => markBillAsAddedToPOS(billIndex)}
                    onRemoveItem={(itemId) => removePaidBillItem(billIndex, itemId)}
                  />
                );
              })}
            </div>
          )}

          {dailySalesTab === "total" && renderTotalTab()}

          <button style={S.clearDayBtn} onClick={() => setShowClearConfirm(true)}>Clear Daily Sales</button>
        </>
      )}

      {showClearConfirm && (
        <Modal
          title="Clear Daily Sales?"
          onClose={() => setShowClearConfirm(false)}
          onConfirm={clearDailySales}
          confirmText="Clear"
          confirmStyle={S.modalDeleteBtn}
        >
          <div style={S.modalMessage}>
            This will permanently remove all bills from today's sales. This action cannot be undone.
          </div>
        </Modal>
      )}
    </div>
  );
}
