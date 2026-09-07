"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface MobileMenuContextValue {
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextValue | undefined>(undefined);

// Tracks whether the mobile off-canvas menu (popup-mobile-menu.tsx) is open. Needed as shared
// context rather than local state because the two hamberger-button triggers that open it
// (main-bar.tsx, sticky-header.tsx) and the panel itself live in separate server-rendered
// branches of the header tree — same cross-tree-trigger shape as CartContext's isCartOpen.
export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <MobileMenuContext.Provider
      value={{
        isMobileMenuOpen,
        openMobileMenu: () => setIsMobileMenuOpen(true),
        closeMobileMenu: () => setIsMobileMenuOpen(false),
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
}

// Hook to access mobile menu state/actions from any component inside MobileMenuProvider
export function useMobileMenu(): MobileMenuContextValue {
  const context = useContext(MobileMenuContext);
  if (!context) throw new Error("useMobileMenu must be used within a MobileMenuProvider");
  return context;
}
