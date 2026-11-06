"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CircleX,
  MapPin,
  Phone,
  Printer,
} from "lucide-react";
import type { AuditResponses } from "@/db/schema";
import {
  buildPlan,
  CATEGORIES,
  computeScore,
  fmtDate,
  GRADE_COLORS,
} from "@/lib/criteria";
import { CategoryIcon, Logo } from "@/components/bits";

export type ReportData = {
  auditId: number;
  clinic: {
    name: string;
    dentist: string | null;
    city: string | null;
    phone: string | null;
    instagram: string | null;
    website: string | null;
    mapsUrl: string | null;
  };
  responses: AuditResponses;
  createdAt: string;
};

const OFFER_ITEMS = [
  "جولة فيديو احترافية كاملة: الواجهة ← الريسيبسيون ← قاعة الانتظار ← بيت العلاج ← لقطة الكورسي",
  "إدارة إنستغرام: 12 منشوراً + ريلز أسبوعي + حالات قبل/بعد موثقة",
  "استملاك وتوثيق بطاقة Google Business مع 30 صورة احترافية (خارجي + داخلي + تجهيزات)",
  "موقع ويب سريع مع حجز مواعيد أونلاين وزر واتساب مباشر",
  "نظام جمع تقييمات جوجل والرد الاحترافي عليها + الأجوبة على أسئلة المرضى",
];

/* ---------- مكونات استاتيكية 100% آمنة للطباعة ---------- */

function Ring({
  value,
  color,
  size = 170,
  stroke = 14,
}: {
  value: number;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  const dash = c - (clamped / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(14,31,29,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-5xl font-black tabular-nums leading-none text-ink">
            {value}
          </div>
          <div className="mt-1 text-[10px] font-bold text-ink-soft">من 100</div>
        </div>
      </div>
    </div>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(2, pct)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function SectionTitle({
  n,
  children,
}: {
  n: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-3 font-display text-xl font-black text-ink">
      <span className="font-display text-xs font-black text-ink-soft/50 tabular-nums">
        {n}
      </span>
      <span>{children}</span>
      <span className="h-px flex-1 bg-ink/15" />
    </h2>
  );
}

const PRIORITY_STYLE = {
  high: { t: "أولوية عالية", c: "border-coral/50 bg-coral/10 text-coral" },
  medium: { t: "أولوية متوسطة", c: "border-gold/50 bg-gold/10 text-gold" },
  low: { t: "تحسين", c: "border-ink/25 bg-ink/5 text-ink-soft" },
} as const;

export default function ReportView({ data }: { data: ReportData }) {
  const score = computeScore(data.responses);
  const color = GRADE_COLORS[score.grade.tone];
  const plan = buildPlan(score.gaps);
  const catsWithGaps = CATEGORIES.filter((c) =>
    c.items.some((i) => !data.responses[i.key]),
  );
  const ref = `MAP-${String(data.auditId).padStart(4, "0")}`;

  return (
    <div className="px-4 py-10 sm:px-6">
      {/* Footer ديال الطباعة — كيبان فكل صفحة مطبوعة */}
      <div className="print-footer">
        <span className="font-black text-ink">MAPSO</span>
        <span className="font-medium text-ink">.RADAR</span>
        {"  ·  "}تقرير تشخيص الحضور الرقمي · {data.clinic.name} · مرجع {ref}
      </div>

      {/* Actions */}
      <div className="print-hidden mx-auto mb-6 flex max-w-3xl items-center justify-between">
        <Link
          href={`/audit/${data.auditId}`}
          className="flex items-center gap-2 text-xs font-black text-ink-soft transition-colors hover:text-brand"
        >
          <ArrowRight className="size-4" />
          رجوع للفحص
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 py-2.5 font-display text-xs font-black text-bone shadow-hard-sm transition-all hover:-translate-y-0.5"
        >
          <Printer className="size-4" />
          طباعة / PDF
        </button>
      </div>

      {/* ============ الوثيقة ============ */}
      <div className="report-sheet mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border-2 border-ink bg-white shadow-hard">
        {/* ---- الغلاف ---- */}
        <div className="avoid-break relative overflow-hidden bg-pine p-7 text-bone sm:p-9">
          <div className="pattern-dots absolute inset-0" aria-hidden />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <Logo dark />
              <p className="mt-6 text-[11px] font-black tracking-[0.2em] text-mint/70">
                تــقــريــر تــشــخــيــص
              </p>
              <h1 className="mt-1 font-display text-3xl font-black leading-snug sm:text-4xl">
                الحضور الرقمي
                <br />
                لعيادة الأسنان
              </h1>
              <p className="mt-3 max-w-xs text-sm font-semibold leading-7 text-bone/75">
                {data.clinic.name}
                {data.clinic.city ? ` — ${data.clinic.city}` : ""}
              </p>
            </div>
            <div className="text-start text-xs font-semibold leading-6 text-bone/70">
              <p className="inline-block rounded-full border border-mint/40 bg-mint/10 px-3.5 py-1 font-black tabular-nums text-mint">
                مرجع {ref}
              </p>
              <p className="mt-3 flex items-center gap-1.5">
                <CalendarClock className="size-3.5" />
                {fmtDate(data.createdAt)}
              </p>
              {data.clinic.dentist && (
                <p className="mt-1.5">{data.clinic.dentist}</p>
              )}
              {data.clinic.phone && (
                <p className="mt-1.5 flex items-center gap-1.5" dir="ltr">
                  <Phone className="size-3.5" />
                  {data.clinic.phone}
                </p>
              )}
              {data.clinic.city && (
                <p className="mt-1.5 flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {data.clinic.city}
                </p>
              )}
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2 border-t border-mint/15 pt-5">
            {["إنستغرام", "فيديو الجولة", "خرائط جوجل", "الموقع والحجز", "التقييمات", "التفاعل"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full bg-bone/10 px-3 py-1 text-[10px] font-bold text-bone/80"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>

        {/* ---- الحكم العام ---- */}
        <div className="avoid-break grid gap-6 border-b-2 border-ink/10 p-7 sm:grid-cols-[auto_1fr] sm:items-center sm:p-9">
          <Ring value={score.total} color={color} />
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-ink-soft/50">
              النتيجة الإجمالية
            </p>
            <p
              className="mt-1 font-display text-2xl font-black"
              style={{ color }}
            >
              {score.grade.label}
            </p>
            <p className="mt-2 max-w-md text-sm font-medium leading-7 text-ink-soft">
              {score.grade.hint}. من بين {score.totalItems} معياراً مفحوصاً عبر
              6 محاور، العيادة كتحقق {score.checked} فقط — وكاينين{" "}
              <span className="font-black text-coral">
                {score.gaps.length} نقص
              </span>{" "}
              واضح كيأثر مباشرة على وصول مرضى جدد.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-black text-brand">
                {score.checked} معيار محقق
              </span>
              <span className="rounded-full bg-coral/10 px-3 py-1 text-[11px] font-black text-coral">
                {score.gaps.length} ناقص
              </span>
              <span className="rounded-full bg-ink/8 px-3 py-1 text-[11px] font-black text-ink-soft">
                6 محاور مفحوصة
              </span>
            </div>
          </div>
        </div>

        {/* ---- النتائج حسب المحور ---- */}
        <div className="avoid-break border-b-2 border-ink/10 p-7 sm:p-9">
          <SectionTitle n="01">النتائج حسب المحور</SectionTitle>
          <div className="mt-6 space-y-4">
            {score.categories.map((c) => (
              <div
                key={c.key}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4"
              >
                <div className="flex w-32 items-center gap-2 sm:w-44">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-ink/20"
                    style={{ backgroundColor: `${c.tone}14`, color: c.tone }}
                  >
                    <CategoryIcon icon={c.icon} className="size-4" />
                  </span>
                  <span className="text-xs font-black leading-4 text-ink">
                    {c.label}
                  </span>
                </div>
                <Bar pct={c.pct} color={c.tone} />
                <span
                  className="w-16 text-end font-display text-xs font-black tabular-nums"
                  style={{ color: c.tone }}
                >
                  {c.earned}/{c.weight} · {c.pct}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl bg-bone px-4 py-3 text-[11px] font-semibold leading-6 text-ink-soft">
            منهجية: 27 معياراً موزونة حسب أثرها على جلب المرضى (المجموع = 100
            نقطة). كل معيار مفحوص يدوياً أو آلياً، والتفاصيل فالصفحات الموالية.
          </p>
        </div>

        {/* ---- النواقص ---- */}
        {score.gaps.length > 0 && (
          <div className="border-b-2 border-ink/10 p-7 sm:p-9">
            <SectionTitle n="02">
              شنو ناقص؟{" "}
              <span className="text-coral">({score.gaps.length} نقص)</span>
            </SectionTitle>
            <p className="mt-2 text-xs font-semibold text-ink-soft">
              كل نقص مرفق بالتوصية العملية ديالو، مرتبين حسب المحور ثم الأولوية:
            </p>

            <div className="mt-6 space-y-7">
              {catsWithGaps.map((cat) => {
                const gaps = score.gaps.filter((g) => g.category === cat.key);
                return (
                  <div key={cat.key} className="avoid-break">
                    <h3
                      className="flex items-center gap-2 text-sm font-black"
                      style={{ color: cat.tone }}
                    >
                      <CategoryIcon icon={cat.icon} className="size-4" />
                      {cat.label}
                      <span className="text-[10px] font-bold text-ink-soft">
                        ({gaps.length} ناقص)
                      </span>
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {gaps.map((g) => (
                        <li
                          key={g.key}
                          className="avoid-break rounded-2xl border border-ink/10 bg-bone/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <CircleX className="mt-0.5 size-4 shrink-0 text-coral" />
                              <div>
                                <p className="text-xs font-black leading-5 text-ink">
                                  {g.gap}
                                </p>
                                <p className="mt-1.5 text-[11px] font-medium leading-5 text-ink-soft">
                                  <span className="font-black text-brand">
                                    الحل:{" "}
                                  </span>
                                  {g.reco}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${PRIORITY_STYLE[g.priority].c}`}
                            >
                              {PRIORITY_STYLE[g.priority].t}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- خطة العمل ---- */}
        {plan.length > 0 && (
          <div className="avoid-break border-b-2 border-ink/10 p-7 sm:p-9">
            <SectionTitle n="03">خطة العمل المقترحة</SectionTitle>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {plan.map((phase, i) => (
                <div
                  key={phase.phase}
                  className="rounded-2xl border-2 border-ink bg-paper p-4"
                >
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-[10px] font-black text-white ${
                      i === 0 ? "bg-coral" : i === 1 ? "bg-gold" : "bg-brand"
                    }`}
                  >
                    {phase.phase}
                  </span>
                  <p className="mt-2 text-sm font-black text-ink">
                    {phase.title}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {phase.items.map((g) => (
                      <li
                        key={g.key}
                        className="text-[11px] font-medium leading-5 text-ink-soft"
                      >
                        · {g.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- العرض (صفحة مستقلة فالطباعة) ---- */}
        <div className="page-break avoid-break bg-pine p-7 text-bone sm:p-9">
          <p className="text-[11px] font-black tracking-[0.2em] text-mint/70">
            الخطوة التالية
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-mint">
            باقة «الحضور الرقمي الكامل»
          </h2>
          <p className="mt-2 text-xs font-semibold leading-6 text-bone/70">
            عرض عملي من MAPSO.RADAR كيسدّ كل النواقص المذكورة فهاد التقرير:
          </p>
          <ul className="mt-6 space-y-3.5">
            {OFFER_ITEMS.map((o) => (
              <li
                key={o}
                className="avoid-break flex items-start gap-2.5 border-b border-mint/10 pb-3 text-sm font-semibold leading-6"
              >
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-mint" />
                {o}
              </li>
            ))}
          </ul>

          <div className="mt-10 grid grid-cols-2 gap-8 pt-2">
            <div>
              <p className="text-[10px] font-black text-bone/50">
                توقيع المستشار
              </p>
              <div className="mt-8 border-b border-dashed border-bone/40" />
              <p className="mt-2 text-[10px] font-bold text-mint/70">
                MAPSO.RADAR
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-bone/50">
                توقيع الطبيب(ة)
              </p>
              <div className="mt-8 border-b border-dashed border-bone/40" />
              <p className="mt-2 text-[10px] font-bold text-bone/60">
                {data.clinic.dentist ?? data.clinic.name}
              </p>
            </div>
          </div>

          <p className="mt-8 border-t border-mint/15 pt-5 text-center text-[10px] font-semibold text-bone/40">
            تقرير مولَّد آلياً عبر{" "}
            <span className="font-black">MAPSO</span>
            <span className="font-medium">.RADAR</span> — 27 معيار فحص يدوي وآلي
            · {fmtDate(data.createdAt)} · مرجع {ref}
          </p>
        </div>
      </div>
    </div>
  );
}
