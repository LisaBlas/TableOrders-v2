import { S } from "../styles/appStyles";
import { BillTab } from "./BillTab";
import { BackIcon } from "./icons";
import type { TableId, OrderItem } from "../types";

interface BillViewProps {
  tableId: TableId;
  sent: OrderItem[];
  onClose: () => void;
}

export function BillView({ tableId, sent, onClose }: BillViewProps) {
  return (
    <div style={S.page}>
      <header style={S.billViewHeader}>
        <button style={S.back} onClick={onClose}>
          <BackIcon size={16} />
          <span style={{ marginLeft: 6 }}>Back to Order</span>
        </button>
        <span style={S.headerTitle}>Table {tableId}</span>
        <span />
      </header>

      <BillTab tableId={tableId} sent={sent} />
    </div>
  );
}
