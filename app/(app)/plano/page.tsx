import type { Metadata } from "next";
import { PlanoPageClient } from "./plano-page-client";

export const metadata: Metadata = { title: "Plano de Estudos" };

export default function PlanoPage() {
  return <PlanoPageClient />;
}
