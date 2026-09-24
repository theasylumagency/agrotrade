"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { BrandKey } from "@/lib/brands";
import { loadCatalog, type Catalog } from "@/lib/catalog";

type Ctx = {
  brand: BrandKey;
  setBrand: (b: BrandKey) => void;
  /** last chosen concept brand (never "agro") — used where a new-brand skin is needed */
  concept: Exclude<BrandKey, "agro">;
};

const C = createContext<Ctx | null>(null);

export function ProposalProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<BrandKey>("kvali");
  const [concept, setConcept] = useState<Exclude<BrandKey, "agro">>("kvali");
  const setBrand = (b: BrandKey) => {
    setBrandState(b);
    if (b !== "agro") setConcept(b);
  };
  return <C.Provider value={{ brand, setBrand, concept }}>{children}</C.Provider>;
}

export function useProposal() {
  const v = useContext(C);
  if (!v) throw new Error("useProposal outside provider");
  return v;
}

/** Loads the catalog chunk once the component mounts (or when `when` becomes true). */
export function useCatalog(when = true) {
  const [cat, setCat] = useState<Catalog | null>(null);
  useEffect(() => {
    if (!when || cat) return;
    let live = true;
    loadCatalog().then((c) => live && setCat(c));
    return () => {
      live = false;
    };
  }, [when, cat]);
  return cat;
}

/** Cross-section events (storefront → Valiko, storefront → engine demo). */
export type OrderEvent = { id: string; brand: BrandKey; items: { id: number; name: string; qty: number; price: number }[]; total: number; pay: string; delivery: string };
export const emit = {
  ask: (text: string) => window.dispatchEvent(new CustomEvent("valiko:ask", { detail: text })),
  order: (o: OrderEvent) => window.dispatchEvent(new CustomEvent("order:new", { detail: o })),
};

/** Demo order numbers (monotonic, no clock needed). */
let orderSeq = 20416;
export const nextOrderNo = (prefix: string) => `${prefix}-${++orderSeq}`;
