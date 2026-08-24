"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  issueId: string;
  slug: string;
  title: string;
  priceCents: number;
  coverImageUrl: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (issueId: string) => void;
  setQuantity: (issueId: string, quantity: number) => void;
  clear: () => void;
  totalCents: number;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "morphose_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // stockage indisponible ou corrompu : on repart d'un panier vide
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // stockage plein ou indisponible : on ignore silencieusement
    }
  }, [lines, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartLine, "quantity">, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.issueId === item.issueId);
        if (existing) {
          return prev.map((l) =>
            l.issueId === item.issueId
              ? { ...l, quantity: l.quantity + quantity }
              : l
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((issueId: string) => {
    setLines((prev) => prev.filter((l) => l.issueId !== issueId));
  }, []);

  const setQuantity = useCallback((issueId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.issueId !== issueId)
        : prev.map((l) => (l.issueId === issueId ? { ...l, quantity } : l))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totalCents = useMemo(
    () => lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0),
    [lines]
  );
  const totalItems = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({ lines, addItem, removeItem, setQuantity, clear, totalCents, totalItems }),
    [lines, addItem, removeItem, setQuantity, clear, totalCents, totalItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
