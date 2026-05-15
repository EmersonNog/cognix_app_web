import type { Metadata } from "next";
import { TreinoPageClient } from "./treino-page-client";

export const metadata: Metadata = { title: "Treino" };

export default function TreinoPage() {
  return <TreinoPageClient />;
}
