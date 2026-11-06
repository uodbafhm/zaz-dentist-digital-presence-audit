"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  FileText,
  Loader2,
  MapPin,
  Radar,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Trophy,
} from "lucide-react";
import type { AuditResponses } from "@/db/schema";
import { fmtDate, GRADE_COLORS, gradeOf, type CategoryKey } from "@/lib/criteria";
import {
  AnimatedNumber,
  Marquee,
  Meter,
  Reveal,
  ScoreGauge,
} from "@/components/bits";

export type ClinicCardData = {
  auditId: number;
  name: string;
  dentist: string | null;
  city: string | null;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  mapsUrl: string | null;
  notes: string | null;
  score: number;
  responses: AuditResponses;
  categories: { key: CategoryKey; label: string; tone: string; pct: number }[];
  updatedAt: string;
};

export type DashboardData = {
  clinics: ClinicCardData[];
  stats: { total: number; avg: number; strong: number; weak: number };
  gapsTop: {
    key: string;
    label: string;
    categoryLabel: string;
    tone: string;
    pts: number;
    missing: number;
    pctMissing: number;
  }[];
};

const HERO_TICKER = [
  "واش إنستغرام نشط؟",
  "واش كاين فيديو ديال العيادة؟",
  "الريسيبسيون متصوّر؟",
  "قاعة الانتظار؟",
  "بيت الدوكتور والكورسي باينين؟",
  "صور خرائط جوجل كاملين؟",
  "موقع فيه حجز أونلاين؟",
  "كيجاوب على التقييمات؟",
];

type Filter = "all" | "strong" | "mid" | "weak";

export default function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [seeding, startSeeding] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "all") return data.clinics;
    return data.clinics.filter((c) => {
      if (filter === "strong") return c.score >= 80;
      if (filter === "mid") return c.score >= 40;
      return c.score < 40;
    });
  }, [data.clinics, filter]);

  async function seed() {
    startSeeding(async () => {
      await fetch("/api/seed", { method: "POST" });
      router.refresh();
    });
  }

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-pine text-bone">
        <div className="pattern-dots absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-mint/10 blur-3xl"
          aria-hidden
        />
        <div
          className="text-stroke pointer-events-none absolute -bottom-8 left-4 hidden font-display text-[11rem] font-black leading-none opacity-60 lg:block"
          aria-hidden
        >
          كشف
        </div>

        <Marquee
          items={HERO_TICKER}
          className="relative border-b border-mint/15 bg-deep/60 py-2.5 text-mint/90"
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-20">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-4 py-1.5 text-xs font-bold text-mint">
                <Radar className="size-3.5" />
                محلل الحضور الرقمي لأطباء الأسنان
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4.6rem)] font-black leading-[1.05]">
                شنو <span className="relative inline-block text-mint">ناقص
                  <svg viewBox="0 0 200 14" className="absolute -bottom-2 right-0 w-full" preserveAspectRatio="none" aria-hidden>
                    <path d="M3 10c60-8 130-8 194-3" stroke="#7ff3d2" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </span>{" "}
                عيادة الأسنان رقمياً؟
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-base leading-8 text-bone/70 sm:text-lg">
                منظومة كتفتّش كل شيء: إنستغرام والريلز، فيديو الجولة من
                الواجهة حتى الكورسي، صور خرائط جوجل، الموقع والحجز أونلاين،
                التقييمات والأجوبة — وكتخرّج ليك{" "}
                <span className="font-bold text-mint">
                  لائحة دقيقة بالنواقص مع خطة عمل
                </span>{" "}
                جاهزة تعرضها على الطبيب.
              </p>
            </Reveal>

            <Reveal delay={0.24} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/new"
                className="group flex items-center gap-2 rounded-full border-2 border-mint bg-mint px-6 py-3 font-display text-sm font-black text-deep shadow-hard-mint transition-all hover:-translate-y-0.5"
              >
                <ScanSearch className="size-4 transition-transform group-hover:rotate-12" />
                ابدأ فحص عيادة
              </Link>
              <a
                href="#common-gaps"
                className="rounded-full border-2 border-bone/25 px-6 py-3 font-display text-sm font-black text-bone/90 transition-colors hover:border-mint/60 hover:text-mint"
              >
                شوف النواقص الشائعة
              </a>
            </Reveal>

            <Reveal delay={0.32} className="mt-8 flex flex-wrap gap-2">
              {["27 معيار", "6 محاور", "فحص آلي للموقع", "تقرير جاهز للطباعة"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full bg-bone/8 px-3 py-1 text-[11px] font-semibold text-bone/70"
                  >
                    {t}
                  </span>
                ),
              )}
            </Reveal>
          </div>

          {/* Visual */}
          <Reveal delay={0.15} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative rotate-1 rounded-[2rem] border-2 border-mint/40 bg-deep p-2 shadow-hard-mint">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem]">
                <Image
                  src="/images/hero-clinic.jpg"
                  alt="ريسيبسيون عيادة أسنان عصرية"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pine/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between text-[11px] font-bold">
                  <span className="rounded-full bg-deep/80 px-3 py-1 text-mint backdrop-blur">
                    الريسيبسيون · صالون الانتظار
                  </span>
                  <span className="rounded-full bg-mint px-3 py-1 text-deep">
                    HD ✓
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              className="absolute -top-6 -left-3 rounded-2xl border-2 border-ink bg-paper p-3 text-ink shadow-hard sm:-left-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ScoreGauge
                value={data.stats.total ? data.stats.avg : 72}
                size={110}
                stroke={10}
                color={GRADE_COLORS[gradeOf(data.stats.total ? data.stats.avg : 72).tone]}
                track="rgba(14,31,29,0.12)"
              >
                <div>
                  <AnimatedNumber
                    value={data.stats.total ? data.stats.avg : 72}
                    className="font-display text-2xl font-black"
                  />
                  <div className="text-[9px] font-bold text-ink-soft">
                    {data.stats.total ? "متوسط النتيجة" : "نتيجة نموذجية"}
                  </div>
                </div>
              </ScoreGauge>
            </motion.div>

            <motion.div
              className="absolute -bottom-6 left-8 flex items-center gap-3 rounded-2xl border-2 border-ink bg-paper p-2.5 pr-3 text-ink shadow-hard-sm"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="relative size-12 overflow-hidden rounded-xl border border-ink/20">
                <Image src="/images/chair.jpg" alt="كرسي الأسنان" fill className="object-cover" sizes="64px" />
              </div>
              <div className="text-start">
                <div className="text-[11px] font-black">الكورسي والتجهيزات</div>
                <div className="text-[10px] font-semibold text-brand">واجد ومُوثَّق ✓</div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: Building2, label: "عيادات مفحوصة", value: data.stats.total, suffix: "", tone: "#0c7c64" },
            { icon: Radar, label: "متوسط النتيجة", value: data.stats.avg, suffix: "/100", tone: "#2E7DD1" },
            { icon: Trophy, label: "حضور قوي (80+)", value: data.stats.strong, suffix: "", tone: "#E8A020" },
            { icon: ShieldAlert, label: "يحتاج تدخل (<40)", value: data.stats.weak, suffix: "", tone: "#E5484D" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.07}>
              <div className="group rounded-3xl border-2 border-ink bg-paper p-5 shadow-hard-sm transition-transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-10 place-items-center rounded-xl border-2 border-ink"
                    style={{ backgroundColor: `${s.tone}1a`, color: s.tone }}
                  >
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-display text-4xl font-black tabular-nums" style={{ color: s.tone }}>
                    <AnimatedNumber value={s.value} />
                    <span className="text-base">{s.suffix}</span>
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-ink-soft">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= COMMON GAPS ================= */}
      {data.stats.total > 0 && data.gapsTop.length > 0 && (
        <section id="common-gaps" className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-coral/10 px-4 py-1.5 text-xs font-black text-coral">
                  <TrendingDown className="size-3.5" />
                  تحليل السوق
                </span>
                <h2 className="mt-4 font-display text-3xl font-black sm:text-4xl">
                  أكثر النواقص شيوعاً عند أطباء الأسنان
                </h2>
                <p className="mt-2 max-w-xl text-sm font-medium text-ink-soft">
                  محسوبة من {data.stats.total} {data.stats.total === 1 ? "فحص" : "فحوصات"} — هادو هما الفرص لي كتبيع.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {data.gapsTop.map((g, i) => (
              <Reveal key={g.key} delay={i * 0.05}>
                <div className="rounded-3xl border-2 border-ink bg-paper p-5 shadow-hard-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: g.tone }}>
                        {g.categoryLabel}
                      </span>
                      <h3 className="mt-1 text-sm font-black leading-6">{g.label}</h3>
                    </div>
                    <span className="shrink-0 rounded-xl border-2 border-ink bg-white px-2.5 py-1 font-display text-sm font-black tabular-nums" style={{ color: g.tone }}>
                      {g.pctMissing}%
                    </span>
                  </div>
                  <Meter pct={g.pctMissing} color={g.tone} className="mt-3 h-2" delay={0.1} />
                  <p className="mt-2 text-[11px] font-semibold text-ink-soft">
                    ناقص عند {g.missing} من {data.stats.total} عيادة
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ================= CLINICS ================= */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-brand/10 px-4 py-1.5 text-xs font-black text-brand">
              <Sparkles className="size-3.5" />
              الفحوصات
            </span>
            <h2 className="mt-4 font-display text-3xl font-black sm:text-4xl">العيادات المفحوصة</h2>
          </div>

          {data.stats.total > 0 && (
            <div className="flex gap-2">
              {(
                [
                  ["all", "الكل"],
                  ["strong", "قوي 80+"],
                  ["mid", "متوسط 40+"],
                  ["weak", "ضعيف <40"],
                ] as [Filter, string][]
              ).map(([f, label]) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border-2 border-ink px-4 py-1.5 text-xs font-black transition-all ${
                    filter === f ? "bg-ink text-bone shadow-hard-sm" : "bg-paper hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </Reveal>

        {data.stats.total === 0 ? (
          <Reveal className="mt-8">
            <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-deep text-bone shadow-hard">
              <div className="absolute inset-0 opacity-40">
                <Image src="/images/exterior.jpg" alt="واجهة عيادة" fill className="object-cover" sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-l from-deep via-deep/80 to-deep/30" />
              </div>
              <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <h3 className="font-display text-3xl font-black sm:text-4xl">
                    مازال ما فحصتي حتى عيادة
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-7 text-bone/75">
                    ابدأ بعيادة حقيقية من اللائحة ديال العيادات لي بغيتي
                    تستهدف، أو جرّب ببيانات تجريبية باش تشوف شنو يقدر يكتاشف
                    الرادار.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/new"
                      className="flex items-center gap-2 rounded-full border-2 border-mint bg-mint px-6 py-3 font-display text-sm font-black text-deep transition-all hover:-translate-y-0.5"
                    >
                      <ScanSearch className="size-4" />
                      فحص عيادة حقيقية
                    </Link>
                    <button
                      onClick={seed}
                      disabled={seeding}
                      className="flex items-center gap-2 rounded-full border-2 border-bone/30 px-6 py-3 font-display text-sm font-black text-bone transition-colors hover:border-mint/60 hover:text-mint disabled:opacity-60"
                    >
                      {seeding ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                      {seeding ? "كنعمّر..." : "عبّئ بيانات تجريبية"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="mt-8 grid gap-4">
            {filtered.map((c, i) => (
              <Reveal key={c.auditId} delay={Math.min(i * 0.05, 0.3)}>
                <ClinicRow clinic={c} />
              </Reveal>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-3xl border-2 border-dashed border-ink/30 p-10 text-center text-sm font-bold text-ink-soft">
                حتى عيادة فهاد التصنيف
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ClinicRow({ clinic: c }: { clinic: ClinicCardData }) {
  const grade = gradeOf(c.score);
  const color = GRADE_COLORS[grade.tone];

  return (
    <div className="group grid gap-4 rounded-3xl border-2 border-ink bg-paper p-5 shadow-hard-sm transition-all hover:-translate-y-0.5 hover:shadow-hard sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
      {/* Score */}
      <div className="flex items-center gap-4">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-ink font-display text-2xl font-black tabular-nums"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          {c.score}
        </div>
        <div className="lg:hidden">
          <h3 className="font-display text-lg font-black">{c.name}</h3>
          <span className="text-xs font-bold" style={{ color }}>{grade.label}</span>
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="hidden items-center gap-3 lg:flex">
          <h3 className="truncate font-display text-lg font-black">{c.name}</h3>
          <span
            className="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black"
            style={{ borderColor: `${color}55`, backgroundColor: `${color}14`, color }}
          >
            {grade.label}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink-soft">
          {c.dentist && <span>{c.dentist}</span>}
          {c.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {c.city}
            </span>
          )}
          <span>آخر تحديث: {fmtDate(c.updatedAt)}</span>
        </div>

        {/* Category micro-bars */}
        <div className="mt-3 flex items-end gap-1.5" dir="ltr">
          {c.categories.map((cat) => (
            <div
              key={cat.key}
              title={`${cat.label}: ${cat.pct}%`}
              className="flex h-7 w-2 items-end overflow-hidden rounded-full bg-ink/10"
            >
              <motion.div
                className="w-full rounded-full"
                style={{ backgroundColor: cat.tone }}
                initial={{ height: "0%" }}
                whileInView={{ height: `${Math.max(cat.pct, 6)}%` }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, damping: 16 }}
              />
            </div>
          ))}
          <span className="mr-2 text-[10px] font-bold text-ink-soft" dir="rtl">
            6 محاور
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/audit/${c.auditId}/report`}
          title="التقرير الجاهز للطباعة"
          className="grid size-10 place-items-center rounded-full border-2 border-ink bg-white transition-all hover:-translate-y-0.5 hover:bg-mint/40"
        >
          <FileText className="size-4" />
        </Link>
        <Link
          href={`/audit/${c.auditId}`}
          className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-ink px-4 py-2 text-xs font-black text-bone transition-all hover:-translate-y-0.5 hover:bg-pine"
        >
          فتح التحليل
          <ArrowLeft className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
