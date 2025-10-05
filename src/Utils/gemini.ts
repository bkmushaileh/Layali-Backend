import Service from "../Models/Service";
import type { Request, Response, NextFunction } from "express";
export type SuggestionsBody = {
  requiredCategories?: string[];
};

export function safeParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}$/);
    return m ? JSON.parse(m[0]) : null;
  }
}

export function fallbackCheapest(candidates: any[], hardBudget: number | null) {
  const selection: Array<{ _id: string; reason?: string }> = [];
  let total = 0;

  [...candidates]
    .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    .some((s) => {
      const p = Number(s.price || 0);
      if (hardBudget && total + p > hardBudget) return true; // stop when next exceeds budget
      selection.push({ _id: String(s._id), reason: "Cheapest-first fallback" });
      total += p;
      return false;
    });

  return {
    strategy: "fallback" as const,
    selection,
    totalPrice: total,
    rationale: hardBudget
      ? "Selected cheapest services that fit within the budget."
      : "No budget provided; returned a cheapest-first set.",
  };
}

export async function respondWithFallback(
  res: Response,
  candidates: any[],
  hardBudget: number | null,
  notes: string
) {
  const fb = fallbackCheapest(candidates, hardBudget);
  const selectedIds = fb.selection.map((s) => s._id);
  const selectedDocs = await Service.find({ _id: { $in: selectedIds } })
    .select("name price image type")
    .lean();

  const items = fb.selection.map((sel) => {
    const doc = selectedDocs.find((d) => String(d._id) === sel._id);
    return {
      _id: sel._id,
      name: doc?.name,
      price: doc?.price,
      type: doc?.type,
      image: doc?.image,
      reason: sel.reason,
    };
  });

  return res.status(200).json({
    strategy: "fallback",
    budget: hardBudget,
    selection: fb.selection,
    items,
    totalPrice: fb.totalPrice,
    rationale: fb.rationale,
    notes,
  });
}
