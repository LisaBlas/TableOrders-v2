import { S } from "../styles/appStyles";
import type { MenuItem, MenuItemVariant, OrderItem } from "../types";

interface VariantBottomSheetProps {
  item: MenuItem;
  unsent: OrderItem[];
  onSelectVariant: (variant: MenuItemVariant) => void;
  onClose: () => void;
}

export function VariantBottomSheet({ item, unsent, onSelectVariant, onClose }: VariantBottomSheetProps) {
  if (!item.variants || item.variants.length === 0) return null;

  // Get unsent qty for a specific variant
  const getVariantUnsentQty = (variant: MenuItemVariant) => {
    const variantId = `${item.id}-${variant.type}`;
    const unsentItem = unsent.find((u) => u.id === variantId);
    return unsentItem?.qty || 0;
  };

  return (
    <>
      {/* Backdrop */}
      <div style={S.variantSheetOverlay} onClick={onClose} />

      {/* Bottom sheet */}
      <div style={S.variantSheet}>
        <div style={S.variantSheetHeader}>{item.name}</div>

        {item.variants.map((variant) => {
          const unsentQty = getVariantUnsentQty(variant);

          return (
            <button
              key={variant.type}
              style={S.variantBtn}
              onClick={() => {
                onSelectVariant(variant);
                onClose();
              }}
            >
              <span style={S.variantBtnLabel}>{variant.label}</span>
              <span style={S.variantBtnPrice}>{variant.price.toFixed(2)}€</span>

              {unsentQty > 0 && (
                <span style={{ ...S.menuCardBadge, position: "absolute", top: 8, right: 8 }}>
                  ({unsentQty})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
