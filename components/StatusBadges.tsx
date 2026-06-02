import type {
  CompatStatus,
  Compatibility,
  ControversyLevel,
  RegulatoryStatus,
} from "@/data/types";
import {
  AlertTriangle,
  Ban,
  Check,
  Cross,
  FlaskConical,
  Question,
  ShieldCheck,
  Tilde,
} from "./icons";

type Tone = "ok" | "warn" | "danger" | "info" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  ok: "bg-ok-soft text-[#0a7c54] ring-1 ring-inset ring-ok/20",
  warn: "bg-warn-soft text-[#b9750a] ring-1 ring-inset ring-warn/25",
  danger: "bg-danger-soft text-[#c23434] ring-1 ring-inset ring-danger/25",
  info: "bg-info-soft text-[#2a63c4] ring-1 ring-inset ring-info/20",
  neutral: "bg-brand-cream text-body ring-1 ring-inset ring-line",
};

// Pastille générique : icône + libellé, couleur sémantique.
export function Badge({
  tone,
  icon,
  label,
  hint,
  size = "md",
}: {
  tone: Tone;
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-pill font-semibold ${TONE_CLASS[tone]} ${
        size === "sm" ? "px-2.5 py-1 text-[0.74rem]" : "px-3.5 py-1.5 text-[0.84rem]"
      }`}
    >
      {icon}
      <span>{label}</span>
      {hint && <span className="font-medium opacity-70">· {hint}</span>}
    </span>
  );
}

// ── Statut réglementaire ──
const REG_META: Record<RegulatoryStatus, { tone: Tone; label: string; icon: React.ReactNode }> = {
  autorise: { tone: "ok", label: "Autorisé en UE", icon: <ShieldCheck /> },
  restreint: { tone: "warn", label: "Autorisé sous conditions", icon: <AlertTriangle /> },
  interdit: { tone: "danger", label: "Interdit en UE", icon: <Ban /> },
};

export function RegulatoryBadge({ status, size }: { status: RegulatoryStatus; size?: "sm" | "md" }) {
  const m = REG_META[status];
  return <Badge tone={m.tone} icon={m.icon} label={m.label} size={size} />;
}

// ── Controverse / avis scientifique ──
const CONTRO_META: Record<ControversyLevel, { tone: Tone; label: string; icon: React.ReactNode }> = {
  aucune: { tone: "ok", label: "Sans controverse majeure", icon: <ShieldCheck /> },
  "avis-en-cours": { tone: "warn", label: "Avis scientifique en cours", icon: <FlaskConical /> },
  controverse: { tone: "warn", label: "Sujet à controverse", icon: <FlaskConical /> },
};

export function ControversyBadge({ level, size }: { level: ControversyLevel; size?: "sm" | "md" }) {
  const m = CONTRO_META[level];
  return <Badge tone={m.tone} icon={m.icon} label={m.label} size={size} />;
}

// ── Compatibilité (vegan / halal / casher) ──
const COMPAT_META: Record<
  CompatStatus,
  { tone: Tone; icon: React.ReactNode; word: string }
> = {
  oui: { tone: "ok", icon: <Check />, word: "Oui" },
  non: { tone: "danger", icon: <Cross />, word: "Non" },
  "selon-origine": { tone: "warn", icon: <Tilde />, word: "Selon l'origine" },
  "à-vérifier": { tone: "neutral", icon: <Question />, word: "À vérifier" },
  "sans-objet": { tone: "neutral", icon: <Question />, word: "Sans objet" },
};

function CompatPill({ name, status }: { name: string; status: CompatStatus }) {
  const m = COMPAT_META[status];
  return (
    <div className={`flex items-center gap-2.5 rounded-pill px-3.5 py-2 ${TONE_CLASS[m.tone]}`}>
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/60">{m.icon}</span>
      <span className="text-[0.86rem] font-bold">{name}</span>
      <span className="text-[0.76rem] font-medium opacity-80">{m.word}</span>
    </div>
  );
}

export function CompatibilityBadges({ compatibility }: { compatibility: Compatibility }) {
  return (
    <div className="flex flex-wrap gap-2">
      <CompatPill name="Vegan" status={compatibility.vegan} />
      <CompatPill name="Halal" status={compatibility.halal} />
      <CompatPill name="Casher" status={compatibility.casher} />
    </div>
  );
}
