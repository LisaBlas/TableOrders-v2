import { createContext, useContext, type ReactNode } from "react";
import { MENU, MIN_QTY_2_IDS } from "../data/constants";

interface MenuContextValue {
  menu: Record<string, any[]>;
  minQty2Ids: Set<string>;
  menuLoading: boolean;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  // Use constants.js directly - no async loading
  const menu = MENU as any;
  const minQty2Ids = MIN_QTY_2_IDS as Set<string>;
  const menuLoading = false;

  return (
    <MenuContext.Provider value={{ menu, minQty2Ids, menuLoading }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}
