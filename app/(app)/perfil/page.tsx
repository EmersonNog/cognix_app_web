import type { Metadata } from "next";
import { PerfilPageClient } from "./perfil-page-client";

export const metadata: Metadata = { title: "Perfil" };

export default function PerfilPage() {
  return <PerfilPageClient />;
}
