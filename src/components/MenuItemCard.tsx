import { S } from "../styles/appStyles";
import type { MenuItem, OrderItem } from "../types";

interface MenuItemCardProps {
  item: MenuItem;
  unsent: OrderItem[];
  showCategory?: boolean;
  onTap: (item: MenuItem) => void;
}

export function MenuItemCard({ item, unsent, showCategory, onTap }: MenuItemCardProps) {
  // Calculate unsent quantity for this item (sum of all variants if applicable)
  const getUnsentQty = () => {
    if (item.variants) {
      // For variant items, sum unsent qty across all variant IDs
      return item.variants.reduce((sum, variant) => {
        const variantId = `${item.id}-${variant.type}`;
        const unsentItem = unsent.find((u) => u.id === variantId);
        return sum + (unsentItem?.qty || 0);
      }, 0);
    } else {
      // For simple items, check direct ID
      const unsentItem = unsent.find((u) => u.id === item.id);
      return unsentItem?.qty || 0;
    }
  };

  const unsentQty = getUnsentQty();

  // Use posName if available, fallback to name
  const displayName = (item as any).posName || item.name;

  return (
    <button style={S.menuCard as any} onClick={() => onTap(item)}>
      {unsentQty > 0 && (
        <span style={S.menuCardBadge as any}>({unsentQty})</span>
      )}
      <div style={S.menuCardName as any}>{displayName}</div>
      {showCategory && (item as any).category && (
        <div style={{ fontSize: 9, color: "#999", marginTop: 2 }}>{(item as any).category}</div>
      )}
    </button>
  );
}
