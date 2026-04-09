import { useTable } from "../contexts/TableContext";
import { getItemDestination } from "../utils/helpers";
import { S } from "../styles/appStyles";
import type { OrderItem, Batch, TableId } from "../types";

interface SentBatchCardProps {
  batches: Batch[];
  tableId: TableId;
}

export function SentBatchCard({ batches, tableId }: SentBatchCardProps) {
  const table = useTable();

  if (batches.length === 0) return null;

  return (
    <div style={S.sentSectionsContainer}>
      {[...batches].reverse().map((batch, batchIdx) => {
        const actualBatchIdx = batches.length - 1 - batchIdx;
        const isMarked = table.markedBatches[tableId]?.has(actualBatchIdx) || false;

        const batchByDest: Record<string, OrderItem[]> = { bar: [], counter: [], kitchen: [] };
        batch.items.forEach((item: OrderItem) => {
          const dest = getItemDestination(item);
          batchByDest[dest].push(item);
        });
        const ts = typeof batch.timestamp === "string" ? new Date(batch.timestamp) : batch.timestamp;
        const accentColor = isMarked ? "#b8e6c8" : "#f0bfbf";
        const sectionStyle = { ...S.sentSection, ...(isMarked ? S.sentSectionMarked : S.sentSectionPending) };

        return (
          <div key={batchIdx}>
            <div style={S.sentDivider}>
              <div style={{ ...S.sentDividerLine, background: accentColor }} />
              <span style={S.sentDividerText}>
                Sent {ts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <button
                style={{ ...S.markBtn, borderColor: accentColor }}
                onClick={() => table.toggleMarkBatch(tableId, actualBatchIdx)}
              >
                {isMarked ? "Unmark" : "Mark"}
              </button>
              <div style={{ ...S.sentDividerLine, background: accentColor }} />
            </div>
            {batchByDest.bar.length > 0 && (
              <div style={sectionStyle}>
                <span style={S.sentLabel}>🍷 Bar</span>
                {batchByDest.bar.map((o) => (
                  <div key={o.id} style={S.sentItem}>
                    <span>{o.qty}× {o.name}</span>
                    <span style={S.sentPrice}>{(o.price * o.qty).toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            )}
            {batchByDest.counter.length > 0 && (
              <div style={sectionStyle}>
                <span style={S.sentLabel}>🧀 Counter </span>
                {batchByDest.counter.map((o) => (
                  <div key={o.id} style={S.sentItem}>
                    <span>{o.qty}× {o.name}</span>
                    <span style={S.sentPrice}>{(o.price * o.qty).toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            )}
            {batchByDest.kitchen.length > 0 && (
              <div style={sectionStyle}>
                <span style={S.sentLabel}>🍽️ Kitchen </span>
                {batchByDest.kitchen.map((o) => (
                  <div key={o.id} style={S.sentItem}>
                    <span>{o.qty}× {o.name}</span>
                    <span style={S.sentPrice}>{(o.price * o.qty).toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
