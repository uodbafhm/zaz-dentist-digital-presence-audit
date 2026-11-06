"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  FileText,
  Globe,
  LayoutDashboard,
  Loader2,
  MapPin,
  MapPinned,
  Phone,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { AuditResponses, AutoChecks } from "@/db/schema";
import {
  autoSuggest,
  CATEGORIES,
  computeScore,
  GRADE_COLORS,
} from "@/lib/criteria";
import {
  AnimatedNumber,
  CategoryIcon,
  PriorityChip,
  ScoreGauge,
  Switch,
} from "@/components/bits";

type Form = {
  name: string;
  dentist: string;
  city: string;
  phone: string;
  mapsUrl: string;
  instagram: string;
  website: string;
  notes: string;
};

const EMPTY_FORM: Form = {
  name: "",
  dentist: "",
  city: "",
  phone: "",
  mapsUrl: "",
  instagram: "",
  website: "",
  notes: "",
};

const STEPS = ["معلومات العيادة", "قائمة الفحص", "النتيجة"];

export default function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [responses, setResponses] = useState<AuditResponses>({});
  const [checks, setChecks] = useState<AutoChecks | null>(null);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<number | null>(null);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    instagram: true,
  });

  const score = useMemo(() => computeScore(responses), [responses]);
  const suggestedSet = useMemo(() => new Set(suggested), [suggested]);

  const canCheck =
    !!form.website.trim() || !!form.instagram.trim() || !!form.mapsUrl.trim();

  async function runAutoCheck() {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          website: form.website,
          instagram: form.instagram,
          mapsUrl: form.mapsUrl,
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as AutoChecks;
      setChecks(data);

      const sugg = autoSuggest(data);
      setSuggested(sugg.map((s) => s.key));
      setResponses((prev) => {
        const next = { ...prev };
        for (const s of sugg) {
          if (next[s.key] === undefined) next[s.key] = true;
        }
        return next;
      });
    } catch {
      setError("تعذّر الفحص الآلي — تقدر تكمل يدوياً");
    } finally {
      setChecking(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/clinics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clinic: form, responses, autoChecks: checks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "error");
      setAuditId(data.audit.id as number);
      setStep(2);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "وقع خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  }

  const toggle = (key: string, v: boolean) =>
    setResponses((p) => ({ ...p, [key]: v }));

  return (
    <div className="relative">
      {/* خلفية */}
      <div className="pattern-grid absolute inset-0 -z-10" aria-hidden />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Steps header */}
        <div className="print-hidden flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`grid size-8 place-items-center rounded-full border-2 border-ink font-display text-xs font-black transition-colors ${
                    step > i
                      ? "bg-brand text-white"
                      : step === i
                        ? "bg-ink text-bone"
                        : "bg-paper text-ink-soft"
                  }`}
                >
                  {step > i ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={`hidden text-xs font-black sm:block ${
                    step === i ? "text-ink" : "text-ink-soft/70"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-0.5 w-8 rounded bg-ink/20 sm:w-14" />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ============ STEP 0: معلومات ============ */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 75, damping: 17 }}
              className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"
            >
              <div className="rounded-[2rem] border-2 border-ink bg-paper p-6 shadow-hard sm:p-8">
                <h1 className="font-display text-2xl font-black sm:text-3xl">
                  فحص عيادة جديدة
                </h1>
                <p className="mt-2 text-sm font-medium text-ink-soft">
                  دخّل المعلومات الأساسية، وإلا عندك روابط — شغّل{" "}
                  <span className="font-black text-brand">الفحص الآلي</span> وغادي
                  نعمّرو عليك شوية ديال المعايير.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field
                    icon={<Building2 className="size-4" />}
                    label="اسم العيادة *"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="عيادة الابتسامة"
                  />
                  <Field
                    icon={<AtSign className="size-4 rotate-0" />}
                    label="اسم الطبيب"
                    value={form.dentist}
                    onChange={(v) => setForm({ ...form, dentist: v })}
                    placeholder="د. مريم الفاسي"
                  />
                  <Field
                    icon={<MapPin className="size-4" />}
                    label="المدينة"
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                    placeholder="الدار البيضاء"
                  />
                  <Field
                    icon={<Phone className="size-4" />}
                    label="الهاتف"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="06 00 00 00 00"
                    ltr
                  />
                  <Field
                    icon={<Globe className="size-4" />}
                    label="الموقع الإلكتروني"
                    value={form.website}
                    onChange={(v) => setForm({ ...form, website: v })}
                    placeholder="https://cabinet-dentaire.ma"
                    ltr
                  />
                  <Field
                    icon={<AtSign className="size-4" />}
                    label="حساب إنستغرام"
                    value={form.instagram}
                    onChange={(v) => setForm({ ...form, instagram: v })}
                    placeholder="@cabinet.dentaire"
                    ltr
                  />
                  <div className="sm:col-span-2">
                    <Field
                      icon={<MapPinned className="size-4" />}
                      label="رابط خرائط جوجل"
                      value={form.mapsUrl}
                      onChange={(v) => setForm({ ...form, mapsUrl: v })}
                      placeholder="https://maps.app.goo.gl/…"
                      ltr
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-black text-ink-soft">
                      ملاحظات
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      placeholder="مثلاً: عيادة جديدة، كتقترب من التجار…"
                      className="w-full resize-none rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-brand"
                    />
                  </div>
                </div>

                {/* Auto check */}
                <div className="mt-6 rounded-2xl border-2 border-dashed border-brand/50 bg-brand/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-bold">
                      <span className="flex items-center gap-2 font-black text-brand">
                        <Wand2 className="size-4" />
                        فحص آلي للروابط
                      </span>
                      <span className="mt-1 block text-xs font-medium text-ink-soft">
                        كنتأكدو واش الموقع خدام، فيه حجز و واتساب، وصيغة الحسابات
                        صحيحة
                      </span>
                    </div>
                    <button
                      onClick={runAutoCheck}
                      disabled={!canCheck || checking}
                      className="flex items-center gap-2 rounded-full border-2 border-ink bg-brand px-5 py-2.5 font-display text-xs font-black text-white shadow-hard-sm transition-all enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {checking ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Wand2 className="size-4" />
                      )}
                      {checking ? "كنفحصو..." : "شغّل الفحص الآلي"}
                    </button>
                  </div>

                  {checks && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 flex flex-wrap gap-2 overflow-hidden"
                    >
                      {checks.website && (
                        <>
                          <CheckChip ok={checks.website.reachable} label={
                            checks.website.reachable
                              ? `الموقع خدام ${checks.website.statusCode ? `(${checks.website.statusCode})` : ""}`
                              : "الموقع ما كيجاوبش"
                          } />
                          {checks.website.reachable && (
                            <>
                              <CheckChip ok={checks.website.hasBooking} label={checks.website.hasBooking ? "كاين حجز/موعد فالموقع" : "ما لقيناش حجز فالموقع"} />
                              <CheckChip ok={checks.website.hasWhatsApp} label={checks.website.hasWhatsApp ? "زر واتساب موجود" : "بلا زر واتساب"} />
                              <CheckChip ok={checks.website.mobileReady} label={checks.website.mobileReady ? "متجاوب مع الهاتف" : "غير متأكدين من التجاوب"} />
                            </>
                          )}
                        </>
                      )}
                      {checks.instagram?.provided && (
                        <CheckChip ok={checks.instagram.valid} label={checks.instagram.valid ? `حساب إنستغرام صالح (${checks.instagram.handle})` : "صيغة الحساب مشكوك فيها"} />
                      )}
                      {checks.maps?.provided && (
                        <CheckChip ok={checks.maps.valid} label={checks.maps.valid ? "رابط خرائط جوجل صالح" : "الرابط ما باينش رابط خرائط"} />
                      )}
                      {suggested.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/30 px-3 py-1 text-[11px] font-black text-brand-deep">
                          <Sparkles className="size-3" />
                          تعمّرو {suggested.length} معيار آلياً فالخطوة التالية
                        </span>
                      )}
                    </motion.div>
                  )}
                  {error && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-coral">
                      <CircleAlert className="size-3.5" /> {error}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => form.name.trim() && setStep(1)}
                    disabled={!form.name.trim()}
                    className="group flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-7 py-3 font-display text-sm font-black text-bone shadow-hard-sm transition-all enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    لليستان: قائمة الفحص
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Side panel */}
              <div className="relative hidden overflow-hidden rounded-[2rem] border-2 border-ink shadow-hard lg:block">
                <Image
                  src="/images/exterior.jpg"
                  alt="واجهة عيادة أسنان"
                  fill
                  className="object-cover"
                  sizes="360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/40 to-transparent" />
                <div className="absolute right-6 bottom-6 left-6 text-bone">
                  <p className="font-display text-xl font-black leading-8">
                    من الواجهة… للريسيبسيون… لقاعة الانتظار… لبيت الدوكتور… حتى
                    الكورسي.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-mint">
                    الفحص كيغطي 27 معيار فـ 6 محاور
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ STEP 1: Checklist ============ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: "spring", stiffness: 75, damping: 17 }}
              className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="font-display text-2xl font-black sm:text-3xl">
                    قائمة الفحص — {form.name}
                  </h1>
                </div>

                {CATEGORIES.map((cat) => {
                  const earned = cat.items.reduce(
                    (s, i) => s + (responses[i.key] ? i.pts : 0),
                    0,
                  );
                  const open = !!openCats[cat.key];
                  return (
                    <div
                      key={cat.key}
                      className="overflow-hidden rounded-3xl border-2 border-ink bg-paper shadow-hard-sm"
                    >
                      <button
                        onClick={() =>
                          setOpenCats((p) => ({ ...p, [cat.key]: !p[cat.key] }))
                        }
                        className="flex w-full items-center gap-4 p-5 text-start"
                      >
                        <span
                          className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink"
                          style={{ backgroundColor: `${cat.tone}1a`, color: cat.tone }}
                        >
                          <CategoryIcon icon={cat.icon} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-base font-black">
                            {cat.label}
                          </span>
                          <span className="block text-xs font-semibold text-ink-soft">
                            {cat.tagline}
                          </span>
                        </span>
                        <span className="rounded-full border-2 border-ink bg-white px-3 py-1 font-display text-xs font-black tabular-nums" style={{ color: cat.tone }}>
                          {earned}/{cat.weight}
                        </span>
                        <ChevronDown
                          className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}
                        />
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
                              {cat.items.map((item) => (
                                <div
                                  key={item.key}
                                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors ${
                                    responses[item.key] ? "bg-brand/6" : "hover:bg-ink/4"
                                  }`}
                                >
                                  <Switch
                                    checked={!!responses[item.key]}
                                    onChange={(v) => toggle(item.key, v)}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold leading-6">
                                      {item.label}
                                    </p>
                                    {suggestedSet.has(item.key) && responses[item.key] && (
                                      <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-black text-brand">
                                        <Wand2 className="size-3" />
                                        اقتراح آلي — تأكد منو بعينيك
                                      </span>
                                    )}
                                  </div>
                                  <span className="shrink-0 rounded-full bg-ink/8 px-2 py-0.5 font-display text-[11px] font-black tabular-nums text-ink-soft">
                                    {item.pts} ن
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Sticky side score */}
              <div className="lg:sticky lg:top-24 h-max">
                <div className="rounded-3xl border-2 border-ink bg-pine p-6 text-center text-bone shadow-hard">
                  <p className="text-xs font-black text-mint">النتيجة الحية</p>
                  <div className="mt-3 flex justify-center">
                    <ScoreGauge
                      value={score.total}
                      size={150}
                      stroke={12}
                      color={GRADE_COLORS[score.grade.tone]}
                      track="rgba(250,247,238,0.15)"
                    >
                      <div>
                        <AnimatedNumber
                          value={score.total}
                          className="font-display text-4xl font-black"
                        />
                        <div className="text-[10px] font-bold text-bone/70">/ 100</div>
                      </div>
                    </ScoreGauge>
                  </div>
                  <p className="mt-2 font-display text-sm font-black" style={{ color: GRADE_COLORS[score.grade.tone] === "#DC2626" ? "#fca5a5" : "#7ff3d2" }}>
                    {score.grade.label}
                  </p>
                  <p className="mt-3 text-[11px] font-semibold text-bone/60">
                    {score.checked} من {score.totalItems} معيار محقق ·{" "}
                    {score.gaps.length} ناقص
                  </p>

                  <div className="mt-6 space-y-2">
                    <button
                      onClick={submit}
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-mint bg-mint px-6 py-3 font-display text-sm font-black text-deep transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      {submitting ? "كنسجّلو..." : "سجّل الفحص وشوف النتيجة"}
                    </button>
                    <button
                      onClick={() => setStep(0)}
                      className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-bone/25 px-6 py-2.5 font-display text-xs font-black text-bone/80 transition-colors hover:border-mint/50 hover:text-mint"
                    >
                      <ArrowRight className="size-4" />
                      رجوع للمعلومات
                    </button>
                  </div>
                  {error && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-red-300">
                      <CircleAlert className="size-3.5" /> {error}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ STEP 2: Result ============ */}
          {step === 2 && auditId && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 70, damping: 16 }}
              className="mt-10"
            >
              <div className="mx-auto max-w-3xl rounded-[2rem] border-2 border-ink bg-paper p-6 text-center shadow-hard sm:p-10">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-mint/25 px-4 py-1.5 text-xs font-black text-brand-deep">
                  <Sparkles className="size-3.5" />
                  الفحص تسجّل بنجاح
                </span>

                <h1 className="mt-4 font-display text-3xl font-black">
                  النتيجة ديال {form.name}
                </h1>

                <div className="mt-6 flex justify-center">
                  <ScoreGauge
                    value={score.total}
                    size={200}
                    stroke={16}
                    color={GRADE_COLORS[score.grade.tone]}
                  >
                    <div>
                      <AnimatedNumber
                        value={score.total}
                        className="font-display text-6xl font-black"
                      />
                      <div className="text-xs font-bold text-ink-soft">من 100</div>
                    </div>
                  </ScoreGauge>
                </div>

                <p
                  className="mt-4 font-display text-xl font-black"
                  style={{ color: GRADE_COLORS[score.grade.tone] }}
                >
                  {score.grade.label}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm font-medium text-ink-soft">
                  {score.grade.hint}
                </p>

                {score.gaps.length > 0 && (
                  <div className="mt-8 rounded-2xl border-2 border-coral/40 bg-coral/5 p-5 text-start">
                    <p className="font-display text-sm font-black text-coral">
                      أخطر {Math.min(4, score.gaps.length)} نواقص:
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {score.gaps.slice(0, 4).map((g) => (
                        <li key={g.key} className="flex items-start justify-between gap-3">
                          <span className="text-sm font-bold leading-6"><span className="text-coral">●</span> {g.gap}</span>
                          <PriorityChip p={g.priority} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/audit/${auditId}/report`}
                    className="flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 py-3 font-display text-sm font-black text-bone shadow-hard-sm transition-all hover:-translate-y-0.5"
                  >
                    <FileText className="size-4" />
                    التقرير الجاهز للطبيب
                  </Link>
                  <Link
                    href={`/audit/${auditId}`}
                    className="flex items-center gap-2 rounded-full border-2 border-ink bg-brand px-6 py-3 font-display text-sm font-black text-white shadow-hard-sm transition-all hover:-translate-y-0.5"
                  >
                    تفاصيل وتعديل الفحص
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2 rounded-full border-2 border-ink/25 bg-white px-6 py-3 font-display text-sm font-black text-ink-soft transition-colors hover:border-ink"
                  >
                    <LayoutDashboard className="size-4" />
                    لوحة القيادة
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  ltr = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-soft/60 start-4">
          {icon}
        </span>
        <input
          dir={ltr ? "ltr" : "rtl"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border-2 border-ink/15 bg-white py-3 text-sm font-semibold outline-none transition-colors focus:border-brand ${
            ltr ? "pr-4 pl-11 text-left placeholder:text-right" : "pr-11 pl-4"
          }`}
        />
      </div>
    </div>
  );
}

function CheckChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${
        ok
          ? "border-brand/40 bg-brand/10 text-brand"
          : "border-coral/40 bg-coral/10 text-coral"
      }`}
    >
      {ok ? <Check className="size-3" /> : <CircleAlert className="size-3" />}
      {label}
    </span>
  );
}
