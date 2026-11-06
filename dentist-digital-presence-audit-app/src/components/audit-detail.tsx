"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  AtSign,
  CalendarClock,
  Check,
  ChevronDown,
  CloudUpload,
  FileText,
  Globe,
  Loader2,
  MapPinned,
  MapPin,
  Phone,
  Trash2,
  Wrench,
} from "lucide-react";
import type { AuditResponses, AutoChecks, ClinicRow } from "@/db/schema";
import {
  buildPlan,
  CATEGORIES,
  computeScore,
  fmtDate,
  GRADE_COLORS,
} from "@/lib/criteria";
import {
  AnimatedNumber,
  CategoryIcon,
  Meter,
  PriorityChip,
  Reveal,
  ScoreGauge,
  Switch,
} from "@/components/bits";

export type AuditDetailData = {
  auditId: number;
  clinic: Pick<
    ClinicRow,
    "id" | "name" | "dentist" | "city" | "phone" | "instagram" | "website" | "mapsUrl" | "notes"
  >;
  responses: AuditResponses;
  autoChecks: AutoChecks | null;
  score: number;
  createdAt: string;
  updatedAt: string;
};

export default function AuditDetail({ data }: { data: AuditDetailData }) {
  const router = useRouter();
  const [responses, setResponses] = useState<AuditResponses>(data.responses);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "saved",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.key, true])),
  );

  const pending = useRef<AuditResponses>(responses);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const score = useMemo(() => computeScore(responses), [responses]);
  const color = GRADE_COLORS[score.grade.tone];
  const plan = useMemo(() => buildPlan(score.gaps), [score.gaps]);

  function toggle(key: string, v: boolean) {
    const next = { ...responses, [key]: v };
    setResponses(next);
    pending.current = next;
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await fetch(`/api/audits/${data.auditId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ responses: pending.current }),
        });
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, 700);
  }

  async function remove() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3500);
      return;
    }
    setDeleting(true);
    await fetch(`/api/audits/${data.auditId}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  const weakest = [...score.categories].sort((a, b) => a.pct - b.pct)[0];
  const strongest = [...score.categories].sort((a, b) => b.pct - a.pct)[0];

  return (
    <div className="relative">
      <div className="pattern-grid absolute inset-0 -z-10" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Back + save state */}
        <div className="print-hidden flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-black text-ink-soft transition-colors hover:text-brand"
          >
            <ArrowRight className="size-4" />
            رجوع للوحة القيادة
          </Link>
          <div
            className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[11px] font-black ${
              saveState === "saving"
                ? "border-gold/50 bg-gold/10 text-gold"
                : "border-brand/40 bg-brand/10 text-brand"
            }`}
          >
            {saveState === "saving" ? (
              <>
                <Loader2 className="size-3 animate-spin" /> كنحفظو...
              </>
            ) : (
              <>
                <CloudUpload className="size-3" /> محفوظ تلقائياً
              </>
            )}
          </div>
        </div>

        {/* Header card */}
        <Reveal className="mt-6 overflow-hidden rounded-[2rem] border-2 border-ink bg-pine text-bone shadow-hard">
          <div className="pattern-dots absolute" aria-hidden />
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h1 className="font-display text-3xl font-black sm:text-4xl">
                {data.clinic.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-bone/80">
                {data.clinic.dentist && <span>{data.clinic.dentist}</span>}
                {data.clinic.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" /> {data.clinic.city}
                  </span>
                )}
                {data.clinic.phone && (
                  <span className="inline-flex items-center gap-1" dir="ltr">
                    <Phone className="size-3.5" /> {data.clinic.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-bone/60">
                  <CalendarClock className="size-3.5" />
                  الفحص: {fmtDate(data.createdAt)}
                </span>
              </div>

              {/* links */}
              <div className="mt-4 flex flex-wrap gap-2">
                {data.clinic.website && (
                  <ExtLink href={withScheme(data.clinic.website)} icon={<Globe className="size-3.5" />} label="الموقع" />
                )}
                {data.clinic.instagram && (
                  <ExtLink
                    href={`https://instagram.com/${data.clinic.instagram.replace(/^@/, "")}`}
                    icon={<AtSign className="size-3.5" />}
                    label={data.clinic.instagram}
                  />
                )}
                {data.clinic.mapsUrl && (
                  <ExtLink href={data.clinic.mapsUrl} icon={<MapPinned className="size-3.5" />} label="خرائط جوجل" />
                )}
              </div>

              {data.clinic.notes && (
                <p className="mt-4 max-w-lg rounded-xl bg-bone/8 px-4 py-2.5 text-xs font-medium leading-6 text-bone/80">
                  {data.clinic.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-6">
              <ScoreGauge value={score.total} size={170} stroke={14} color={color} track="rgba(250,247,238,0.15)">
                <div>
                  <AnimatedNumber value={score.total} className="font-display text-5xl font-black" />
                  <div className="text-[10px] font-bold text-bone/70">/ 100</div>
                </div>
              </ScoreGauge>
              <div>
                <p className="font-display text-xl font-black" style={{ color }}>
                  {score.grade.label}
                </p>
                <p className="mt-2 max-w-[220px] text-xs font-medium leading-6 text-bone/70">
                  {score.grade.hint}
                </p>
                <p className="mt-3 text-[11px] font-bold text-mint">
                  أقوى محور: {strongest.label} ({strongest.pct}%)
                  <br />
                  <span className="text-red-300">أضعف محور: {weakest.label} ({weakest.pct}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Category meters */}
          <div className="grid grid-cols-2 gap-4 border-t border-mint/15 bg-deep/50 p-6 sm:grid-cols-3 lg:grid-cols-6">
            {score.categories.map((c) => (
              <div key={c.key}>
                <div className="flex items-center gap-1.5 text-[11px] font-black text-bone/80">
                  <CategoryIcon icon={c.icon} className="size-3.5" />
                  {c.label}
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-bone/15">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: c.tone }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${c.pct}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 16 }}
                  />
                </div>
                <div className="mt-1 font-display text-xs font-black tabular-nums" style={{ color: c.tone }}>
                  {c.pct}%
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Actions row */}
        <div className="print-hidden mt-6 flex flex-wrap gap-3">
          <Link
            href={`/audit/${data.auditId}/report`}
            className="flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-5 py-2.5 font-display text-xs font-black text-bone shadow-hard-sm transition-all hover:-translate-y-0.5"
          >
            <FileText className="size-4" />
            التقرير الجاهز للطباعة
          </Link>
          <button
            onClick={remove}
            disabled={deleting}
            className={`flex items-center gap-2 rounded-full border-2 px-5 py-2.5 font-display text-xs font-black transition-all ${
              confirmDelete
                ? "border-coral bg-coral text-white"
                : "border-ink/25 bg-white text-coral hover:border-coral"
            }`}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            {confirmDelete ? "متأكد؟ اضغط مرة أخرى" : "حذف الفحص"}
          </button>
        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Checklist */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-display text-2xl font-black">
              <Wrench className="size-5 text-brand" />
              قائمة الفحص — بدّل و احفظ مباشرة
            </h2>

            {score.categories.map((cs) => {
              const cat = CATEGORIES.find((c) => c.key === cs.key)!;
              const open = !!openCats[cat.key];
              return (
                <div key={cat.key} className="overflow-hidden rounded-3xl border-2 border-ink bg-paper shadow-hard-sm">
                  <button
                    onClick={() => setOpenCats((p) => ({ ...p, [cat.key]: !p[cat.key] }))}
                    className="flex w-full items-center gap-4 p-5 text-start"
                  >
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink"
                      style={{ backgroundColor: `${cat.tone}1a`, color: cat.tone }}
                    >
                      <CategoryIcon icon={cat.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base font-black">{cat.label}</span>
                      <span className="block text-xs font-semibold text-ink-soft">{cat.tagline}</span>
                    </span>
                    <span className="hidden w-28 sm:block">
                      <Meter pct={cs.pct} color={cat.tone} className="h-2" />
                    </span>
                    <span
                      className="rounded-full border-2 border-ink bg-white px-3 py-1 font-display text-xs font-black tabular-nums"
                      style={{ color: cat.tone }}
                    >
                      {cs.earned}/{cat.weight}
                    </span>
                    <ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 90, damping: 20 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 border-t-2 border-ink/10 p-3">
                          {cat.items.map((item) => {
                            const on = !!responses[item.key];
                            return (
                              <div
                                key={item.key}
                                className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors ${
                                  on ? "bg-brand/6" : "bg-coral/4 hover:bg-coral/8"
                                }`}
                              >
                                <Switch checked={on} onChange={(v) => toggle(item.key, v)} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold leading-6">{item.label}</p>
                                  {!on && (
                                    <p className="mt-0.5 text-[11px] font-semibold leading-5 text-coral/80">
                                      {item.gap}
                                    </p>
                                  )}
                                </div>
                                <span className="mt-1 shrink-0 rounded-full bg-ink/8 px-2 py-0.5 font-display text-[11px] font-black tabular-nums text-ink-soft">
                                  {item.pts} ن
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Gaps + plan sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 h-max">
            <div className="rounded-3xl border-2 border-ink bg-paper p-6 shadow-hard-sm">
              <h3 className="flex items-center gap-2 font-display text-lg font-black text-coral">
                <span className="grid size-8 place-items-center rounded-lg border-2 border-ink bg-coral/10">
                  !
                </span>
                شنو ناقص؟ ({score.gaps.length})
              </h3>

              {score.gaps.length === 0 ? (
                <p className="mt-4 flex items-center gap-2 rounded-2xl bg-brand/10 p-4 text-sm font-bold text-brand">
                  <Check className="size-4" />
                  ولا شي حاجة ناقصة — العيادة مكمّلة رقمياً!
                </p>
              ) : (
                <ul className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {score.gaps.map((g) => (
                    <li key={g.key} className="rounded-2xl border border-ink/10 bg-white p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black" style={{ color: g.tone }}>
                          {g.categoryLabel}
                        </span>
                        <PriorityChip p={g.priority} />
                      </div>
                      <p className="mt-1.5 text-xs font-black leading-5 text-coral">{g.gap}</p>
                      <p className="mt-1 text-[11px] font-medium leading-5 text-ink-soft">
                        <span className="font-black text-brand">الحل: </span>
                        {g.reco}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {plan.length > 0 && (
              <div className="rounded-3xl border-2 border-ink bg-pine p-6 text-bone shadow-hard-sm">
                <h3 className="font-display text-lg font-black text-mint">خطة العمل المقترحة</h3>
                <div className="mt-4 space-y-5">
                  {plan.map((phase, pi) => (
                    <div key={phase.phase} className="relative pr-5">
                      <span className="absolute right-0 top-1.5 size-2.5 rounded-full bg-mint" />
                      {pi < plan.length - 1 && (
                        <span className="absolute right-[4px] top-5 h-full w-px bg-mint/25" />
                      )}
                      <p className="text-[11px] font-black text-mint/80">{phase.phase}</p>
                      <p className="text-sm font-black">{phase.title}</p>
                      <ul className="mt-1.5 space-y-1">
                        {phase.items.slice(0, 3).map((g) => (
                          <li key={g.key} className="text-[11px] font-medium leading-5 text-bone/70">
                            · {g.label}
                          </li>
                        ))}
                        {phase.items.length > 3 && (
                          <li className="text-[11px] font-bold text-bone/50">
                            +{phase.items.length - 3} أخرى
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/audit/${data.auditId}/report`}
                  className="mt-5 flex items-center justify-center gap-2 rounded-full border-2 border-mint/50 px-5 py-2.5 font-display text-xs font-black text-mint transition-colors hover:bg-mint hover:text-deep"
                >
                  <FileText className="size-4" />
                  التقرير الكامل مع الخطة
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExtLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-mint/30 bg-mint/10 px-3 py-1.5 text-[11px] font-bold text-mint transition-colors hover:bg-mint hover:text-deep"
    >
      {icon}
      {label}
    </a>
  );
}

function withScheme(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
