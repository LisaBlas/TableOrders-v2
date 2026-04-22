import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { useTable } from "../contexts/TableContext";
import { useTableOrder } from "../hooks/useTableOrder";
import { useSplit } from "../contexts/SplitContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { Receipt } from "../components/Receipt";
import { BackIcon } from "../components/icons";
import { S } from "../styles/appStyles";
import type { OrderItem } from "../types";

export function TicketView() {
  const app = useApp();
  const table = useTable();
  const { dispatch } = useSplit();
  const { isTablet, isTabletLandscape, isDesktop } = useBreakpoint();
  const tableId = app.ticketTable!;
  const { items: ticketItems, total: ticketTotal } = useTableOrder(tableId);

  const [confirmingClose, setConfirmingClose] = useState(false);
  const [showSplitOptions, setShowSplitOptions] = useState(false);

  const confirmClose = () => {
    const items = ticketItems.filter((o: OrderItem) => (o.sentQty || 0) > 0);
    const subtotal = items.reduce((s: number, o: OrderItem) => s + o.price * (o.sentQty || 0), 0);
    const gutschein = table.gutscheinAmounts[tableId] || 0;
    const total = Math.max(0, subtotal - gutschein);

    const bill = {
      tableId,
      items: items.map((o: OrderItem) => ({ ...o, qty: o.sentQty || 0 })),
      total,
      subtotal: gutschein > 0 ? subtotal : undefined,
      gutschein: gutschein > 0 ? gutschein : undefined,
      timestamp: new Date().toISOString(),
      paymentMode: "full" as const,
    };

    app.addPaidBill(bill);
    table.cleanupTable(tableId);
    app.showToast(`Table ${tableId} closed — ${total.toFixed(2)}€`);
    app.setView("tables");
  };

  const initiateSplit = (mode: "equal" | "item") => {
    const sentItems = ticketItems
      .filter((o: OrderItem) => (o.sentQty || 0) > 0)
      .map((o: OrderItem) => ({ ...o, qty: o.sentQty || 0 }));

    if (mode === "equal") {
      dispatch({ type: "INITIATE_EQUAL", items: sentItems });
    } else {
      dispatch({ type: "INITIATE_ITEM", items: sentItems });
    }
    app.setView("split");
  };

  // Responsive styles
  const headerStyle = isTablet || isTabletLandscape || isDesktop ? S.headerTablet : S.header;
  const ticketStyle = isTablet || isTabletLandscape || isDesktop ? S.ticketTablet : S.ticket;

  return (
    <div style={S.page}>
      <header style={headerStyle}>
        <button style={S.back} onClick={() => {
          app.setView("tables");
          setShowSplitOptions(false);
          setConfirmingClose(false);
        }}>
          <BackIcon size={22} />
        </button>
        <span style={S.headerTitle}>Table {tableId} — Bill</span>
        <span />
      </header>
      <div style={ticketStyle}>
        <Receipt tableId={tableId} items={ticketItems} />
      </div>

      <div style={S.ticketActions}>
        <button style={confirmingClose ? S.confirmCloseBtn : S.closeBtn} onClick={() => {
          if (confirmingClose) {
            setShowSplitOptions(false);
            confirmClose();
          } else {
            setConfirmingClose(true);
            setShowSplitOptions(true);
          }
        }}>
          {confirmingClose ? "Confirm close" : "Close table"}
        </button>
        {showSplitOptions && (
          <div style={S.splitOptions}>
            <div style={S.splitOptionsLabel}>Split the bill</div>
            <div style={S.splitBtns}>
              <button style={S.splitOptionBtn} onClick={() => initiateSplit("equal")}>
                <span style={S.splitOptionIcon}>⚖</span>
                <span style={S.splitOptionTitle}>Equal split</span>
                <span style={S.splitOptionSub}>Total ÷ guests</span>
              </button>
              <button style={S.splitOptionBtn} onClick={() => initiateSplit("item")}>
                <span style={S.splitOptionIcon}>☰</span>
                <span style={S.splitOptionTitle}>By item</span>
                <span style={S.splitOptionSub}>Pay round by round</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
