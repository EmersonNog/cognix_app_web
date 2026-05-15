"use client";

import Link from "next/link";
import { useRef, useState, useCallback } from "react";
import { useTrainingAreas } from "@/src/modules/training/controller/use-training-areas";
import { Spinner } from "@/src/shared/view/components/spinner";
import { LockedContent } from "@/src/shared/view/components/locked-content";
import type { SubcategoryItem } from "@/src/types/api";

const DISCIPLINE_META: Record<string, { gradient: string; glow: string; accent: string; text: string; icon: string }> = {
  "Ciências Humanas e suas tecnologias":     { gradient: "from-[#5c63e6] to-[#7c3aed]", glow: "rgba(92,99,230,0.55)",   accent: "bg-primary/10 text-primary",       text: "text-primary",       icon: "🌍" },
  "Ciências da Natureza e suas tecnologias": { gradient: "from-[#059669] to-[#0891b2]", glow: "rgba(5,150,105,0.55)",   accent: "bg-emerald-100 text-emerald-700",  text: "text-emerald-600",   icon: "🔬" },
  "Linguagens, Códigos e suas Tecnologias":  { gradient: "from-[#db2777] to-[#e11d48]", glow: "rgba(219,39,119,0.55)",  accent: "bg-rose-100 text-rose-700",        text: "text-rose-600",      icon: "📖" },
  "Matemática e suas Tecnologias":           { gradient: "from-[#d97706] to-[#ea580c]", glow: "rgba(217,119,6,0.55)",   accent: "bg-amber-100 text-amber-700",      text: "text-amber-600",     icon: "📐" },
};

function getMeta(d: string) {
  return DISCIPLINE_META[d] ?? { gradient: "from-primary to-primary-dim", glow: "rgba(92,99,230,0.4)", accent: "bg-primary/10 text-primary", text: "text-primary", icon: "📚" };
}

export function TrainingAreasScreen() {
  const ctrl = useTrainingAreas();

  if (ctrl.locked) return <LockedContent />;

  const hasSelection = ctrl.selectedDiscipline !== "Todas";
  const disciplineList = ctrl.disciplines.filter((d) => d !== "Todas");

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Treino</h1>
        <p className="mt-1 text-sm text-muted">Escolha uma disciplina para começar.</p>
      </div>

      {ctrl.loading && (
        <div className="flex justify-center py-20 text-primary">
          <Spinner size={36} />
        </div>
      )}

      {ctrl.error && (
        <div className="rounded-[16px] bg-red-50 px-6 py-4 text-sm text-red-600">{ctrl.error}</div>
      )}

      {!ctrl.loading && !ctrl.error && (
        <>
          {!hasSelection && (
            <div className="grid gap-4 sm:grid-cols-2">
              {disciplineList.map((d, i) => {
                const count = ctrl.filtered.filter((s) => s.discipline === d).length;
                return (
                  <DisciplineCard
                    key={d}
                    discipline={d}
                    count={count}
                    index={i}
                    onClick={() => ctrl.setSelectedDiscipline(d)}
                  />
                );
              })}
            </div>
          )}

          {hasSelection && (
            <div className="grid gap-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { ctrl.setSelectedDiscipline("Todas"); ctrl.setSearch(""); }}
                  className="flex items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 py-2 text-xs font-bold text-muted transition hover:text-foreground"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Voltar
                </button>
                <div className="relative flex-1">
                  <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Buscar categoria..."
                    value={ctrl.search}
                    onChange={(e) => ctrl.setSearch(e.target.value)}
                    className="w-full rounded-[10px] border border-border bg-surface py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {(() => {
                const meta = getMeta(ctrl.selectedDiscipline);
                return (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <p className="text-base font-black text-foreground">{ctrl.selectedDiscipline}</p>
                      <p className="text-xs text-muted">{ctrl.filtered.length} categorias disponíveis</p>
                    </div>
                  </div>
                );
              })()}

              {ctrl.filtered.length === 0 && (
                <div className="rounded-[16px] bg-surface py-12 text-center text-sm text-muted">
                  Nenhuma categoria encontrada.
                </div>
              )}

              <div className="grid gap-2.5 sm:grid-cols-2">
                {ctrl.filtered.map((item, i) => (
                  <SubcategoryCard key={`${item.discipline}-${item.name}`} item={item} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DisciplineCard({
  discipline,
  count,
  index,
  onClick,
}: {
  discipline: string;
  count: number;
  index: number;
  onClick: () => void;
}) {
  const meta = getMeta(discipline);
  const ref = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTilt({
      x: -((y - rect.height / 2) / rect.height) * 12,
      y:  ((x - rect.width  / 2) / rect.width)  * 12,
    });
    setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const transform = hovered
    ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${pressed ? 0.97 : 1.03})`
    : `perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)`;

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        transform,
        transition: hovered ? "transform 0.08s ease-out" : "transform 0.5s cubic-bezier(.22,.68,0,1.2)",
        animationDelay: `${index * 80}ms`,
        boxShadow: hovered
          ? `0 16px 48px ${meta.glow}, 0 4px 16px rgba(0,0,0,0.1)`
          : `0 4px 20px rgba(0,0,0,0.10)`,
      }}
      className={`group relative overflow-hidden rounded-[22px] bg-gradient-to-br ${meta.gradient} p-6 text-left animate-[fadeSlideUp_0.4s_ease_both]`}
    >
      {/* Spotlight that follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.22) 0%, transparent 65%)`,
        }}
      />

      {/* Shimmer lines */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/8 blur-xl" />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className="text-3xl transition-transform duration-300"
          style={{ transform: hovered ? "scale(1.15) rotate(-4deg)" : "scale(1) rotate(0deg)" }}
        >
          {meta.icon}
        </span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
          {count} categorias
        </span>
      </div>

      <div className="relative mt-4">
        <p className="text-base font-black text-white leading-snug">{discipline}</p>
        <p
          className="mt-1 text-xs text-white/70 transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0.7, transform: hovered ? "translateX(4px)" : "translateX(0)" }}
        >
          Ver categorias →
        </p>
      </div>
    </button>
  );
}

function SubcategoryCard({ item, index }: { item: SubcategoryItem; index: number }) {
  const href = `/treino/sessao?disciplina=${encodeURIComponent(item.discipline)}&subcategoria=${encodeURIComponent(item.name)}`;
  const meta = getMeta(item.discipline);
  const ref = useRef<HTMLAnchorElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${index * 40}ms`,
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.10)" : "0 1px 6px rgba(0,0,0,0.05)",
      }}
      className="group relative overflow-hidden rounded-[14px] bg-surface px-4 py-3.5 transition-transform duration-150 hover:-translate-y-0.5 animate-[fadeSlideUp_0.35s_ease_both]"
    >
      {/* Pointer glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[14px] transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(92,99,230,0.07) 0%, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{item.name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.accent}`}>
            {item.total.toLocaleString("pt-BR")} questões
          </span>
          <svg
            className={`${meta.text} transition-all duration-200 ${hovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
