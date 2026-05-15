import type { Metadata } from "next";
import { DesempenhoPageClient } from "./desempenho-page-client";

export const metadata: Metadata = { title: "Desempenho" };

export default function DesempenhoPage() {
  return <DesempenhoPageClient />;
}
