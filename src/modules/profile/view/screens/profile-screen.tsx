"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { useProfile } from "@/src/modules/profile/controller/use-profile";
import { Spinner } from "@/src/shared/view/components/spinner";
import { LockedContent } from "@/src/shared/view/components/locked-content";
import type { ProfileAvatarStoreItem, ProfileScoreData } from "@/src/types/api";

const RARITY_COLORS: Record<string, string> = {
  common: "border-border text-muted",
  uncommon: "border-green-400 text-green-600",
  rare: "border-blue-400 text-blue-600",
  epic: "border-purple-400 text-purple-600",
  legendary: "border-amber-400 text-amber-600",
};

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`;
}

function AvatarImage({ seed, size = 80 }: { seed: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initial = (seed[0] ?? "?").toUpperCase();

  if (failed) {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dim text-white font-bold"
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl(seed)}
      alt="Avatar"
      width={size}
      height={size}
      className="rounded-full bg-surface-high"
      onError={() => setFailed(true)}
    />
  );
}

export function ProfileScreen() {
  const { data, loading, locked, error, equipping, equipAvatar } = useProfile();
  const router = useRouter();
  const [showStore, setShowStore] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-primary">
        <Spinner size={36} />
      </div>
    );
  }

  if (locked) return <LockedContent />;

  if (error || !data) {
    return (
      <div className="rounded-[16px] bg-red-50 px-6 py-4 text-sm text-red-600">
        {error || "Erro ao carregar perfil."}
      </div>
    );
  }

  const user = auth.currentUser;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Perfil</h1>
      </div>

      {/* Profile card */}
      <div className="rounded-[20px] bg-surface p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <AvatarImage seed={data.equippedAvatarSeed || "default"} size={80} />
            <button
              onClick={() => setShowStore(true)}
              title="Trocar avatar"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-primary text-white shadow"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-black text-foreground">
              {user?.displayName ?? "Usuário"}
            </p>
            <p className="truncate text-sm text-muted">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                {data.level}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <span className="text-accent font-bold">⬡</span>
                <span className="font-bold text-foreground">{(data.coinsBalance ?? 0).toFixed(1)}</span> coins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid data={data} />

      {/* Avatar store modal */}
      {showStore && (
        <AvatarStore
          data={data}
          equipping={equipping}
          onEquip={equipAvatar}
          onClose={() => setShowStore(false)}
        />
      )}

      {/* Account */}
      <div className="rounded-[20px] bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <p className="mb-3 text-sm font-bold text-foreground">Conta</p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-[12px] px-4 py-3 text-sm font-semibold text-muted transition hover:bg-surface-low hover:text-foreground"
        >
          Sair da conta
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function StatsGrid({ data }: { data: ProfileScoreData }) {
  const coveragePercent = (data.questionBankTotal ?? 0) > 0
    ? Math.round(((data.uniqueQuestionsAnswered ?? 0) / data.questionBankTotal) * 100)
    : 0;

  const stats = [
    { label: "Pontuação", value: (data.score ?? 0).toLocaleString("pt-BR") },
    { label: "Questões", value: (data.questionsAnswered ?? 0).toLocaleString("pt-BR") },
    { label: "Precisão", value: `${Math.round(data.accuracyPercent ?? 0)}%` },
    { label: "Cobertura", value: `${coveragePercent}%` },
    { label: "Sessões", value: (data.completedSessions ?? 0).toString() },
    { label: "Sequência", value: `${data.currentStreakDays ?? 0}d 🔥` },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-[16px] bg-surface p-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-center">
          <p className="text-[10px] text-muted">{s.label}</p>
          <p className="mt-1 text-lg font-black text-foreground">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function AvatarStore({
  data,
  equipping,
  onEquip,
  onClose,
}: {
  data: ProfileScoreData;
  equipping: string;
  onEquip: (seed: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"owned" | "store">("owned");
  const owned = (data.avatarStore ?? []).filter((a) => a.owned);
  const store = (data.avatarStore ?? []).filter((a) => !a.owned);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-[24px] bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <p className="font-bold text-foreground">Loja de Avatares</p>
          <div className="flex items-center gap-1 rounded-full bg-surface-low px-3 py-1 text-sm">
            <span className="font-bold text-accent">⬡</span>
            <span className="font-bold">{(data.coinsBalance ?? 0).toFixed(1)}</span>
          </div>
          <button onClick={onClose} className="ml-3 text-muted hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 p-4">
          <button onClick={() => setTab("owned")} className={`flex-1 rounded-[10px] py-2 text-sm font-bold transition ${tab === "owned" ? "bg-primary text-white" : "bg-surface-high text-muted"}`}>
            Meus avatares ({owned.length})
          </button>
          <button onClick={() => setTab("store")} className={`flex-1 rounded-[10px] py-2 text-sm font-bold transition ${tab === "store" ? "bg-primary text-white" : "bg-surface-high text-muted"}`}>
            Loja ({store.length})
          </button>
        </div>

        <div className="grid max-h-72 grid-cols-4 gap-3 overflow-y-auto p-4 pt-0">
          {(tab === "owned" ? owned : store).map((item) => (
            <AvatarStoreItem
              key={item.seed}
              item={item}
              equipping={equipping}
              onEquip={onEquip}
            />
          ))}
        </div>

        <div className="border-t border-border p-4">
          <button onClick={onClose} className="w-full rounded-[12px] bg-surface-high py-2.5 text-sm font-bold text-muted">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function AvatarStoreItem({
  item,
  equipping,
  onEquip,
}: {
  item: ProfileAvatarStoreItem;
  equipping: string;
  onEquip: (seed: string) => void;
}) {
  const rarityClass = RARITY_COLORS[item.rarity] ?? RARITY_COLORS.common;
  const isEquipping = equipping === item.seed;

  return (
    <button
      onClick={() => onEquip(item.seed)}
      disabled={isEquipping || (!item.owned && !item.affordable)}
      className={`flex flex-col items-center gap-1 rounded-[12px] border-2 p-2 transition ${
        item.equipped
          ? "border-primary bg-primary/10"
          : rarityClass
      } disabled:opacity-50`}
    >
      {isEquipping ? (
        <div className="flex h-12 w-12 items-center justify-center text-primary">
          <Spinner size={20} />
        </div>
      ) : (
        <AvatarImage seed={item.seed} size={48} />
      )}
      <p className="w-full truncate text-center text-[9px] font-semibold text-muted">
        {item.title}
      </p>
      {!item.owned && (
        <p className="text-[9px] font-bold text-accent">⬡ {item.costCoins.toFixed(1)}</p>
      )}
      {item.equipped && (
        <span className="text-[9px] font-bold text-primary">Em uso</span>
      )}
    </button>
  );
}
