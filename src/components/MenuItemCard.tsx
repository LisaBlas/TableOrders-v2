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

  // Extract emoji from name or use first letter as fallback
  const getEmoji = () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    const match = item.name.match(emojiRegex);
    return match ? match[0] : item.name[0];
  };

  const emoji = getEmoji();
  const displayPrice = item.variants ? item.variants[0].price : item.price;

  return (
    <button style={S.menuCard} onClick={() => onTap(item)}>
      {unsentQty > 0 && (
        <span style={S.menuCardBadge}>({unsentQty})</span>
      )}
      <div style={S.menuCardEmoji}>{emoji}</div>
      <div style={S.menuCardName}>{item.name}</div>
      <div style={S.menuCardPrice}>{displayPrice?.toFixed(2)}€</div>
      {showCategory && item.category && (
        <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{item.category}</div>
      )}
    </button>
  );
}
