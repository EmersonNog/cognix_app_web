import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SessaoPageClient } from "./sessao-page-client";

export const metadata: Metadata = { title: "Sessão de Treino" };

export default async function SessaoPage({
  searchParams,
}: {
  searchParams: Promise<{ disciplina?: string; subcategoria?: string }>;
}) {
  const params = await searchParams;
  const disciplina = params.disciplina ?? "";
  const subcategoria = params.subcategoria ?? "";

  if (!disciplina || !subcategoria) redirect("/treino");

  return <SessaoPageClient disciplina={disciplina} subcategoria={subcategoria} />;
}
