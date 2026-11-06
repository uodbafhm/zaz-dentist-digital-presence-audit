import type { AuditResponses, AutoChecks } from "@/db/schema";

/* ------------------------------------------------------------------ */
/*  معايير فحص الحضور الرقمي لعيادات الأسنان                             */
/* ------------------------------------------------------------------ */

export type Criterion = {
  key: string;
  label: string;
  pts: number;
  gap: string; // شنو ناقص
  reco: string; // شنو خاص يدار
};

export type CategoryKey =
  | "instagram"
  | "video"
  | "maps"
  | "website"
  | "reviews"
  | "engagement";

export type Category = {
  key: CategoryKey;
  label: string;
  tagline: string;
  icon: string;
  weight: number;
  tone: string; // tailwind-ish hex accent
  items: Criterion[];
};

export const CATEGORIES: Category[] = [
  {
    key: "instagram",
    label: "إنستغرام",
    tagline: "الحساب، النشاط، والمحتوى",
    icon: "instagram",
    weight: 18,
    tone: "#E1306C",
    items: [
      {
        key: "ig_account",
        label: "حساب إنستغرام مفعّل باسم العيادة",
        pts: 4,
        gap: "ماعندوش حساب إنستغرام",
        reco: "إنشاء حساب بيزنس باسم العيادة، بايو واضح فيه المدينة + رابط الحجز/واتساب، وصورة بروفايل احترافية.",
      },
      {
        key: "ig_active",
        label: "نشط — آخر منشور خلال آخر 30 يوم",
        pts: 4,
        gap: "الحساب ناعس — مكاين حتى منشور فآخر شهر",
        reco: "خطة محتوى أسبوعية: 2-3 منشورات + ستوريات يومية من داخل العيادة باش يبقى الحساب حي.",
      },
      {
        key: "ig_consistent",
        label: "انتظام فالنشر — 4 منشورات+ فالشهر",
        pts: 4,
        gap: "النشر غير منتظم — شكونوا الناس مكيبقاوش متابعين",
        reco: "تقويم محتوى شهري مبرمج مسبقاً (حالات، نصائح، كواليس العيادة) باش يضمن الاستمرارية.",
      },
      {
        key: "ig_reels",
        label: "كيستعمل الريلز والفيديوهات القصيرة",
        pts: 3,
        gap: "مكيستعملش الريلز — كيضيع أكبر مصدر مجاني للوصول",
        reco: "ريلز قصيرة (15-30 ثانية): تنظيف الأسنان، تبييض قبل/بعد، أخطاء شائعة — هي لي كتوصل للناس دابا.",
      },
      {
        key: "ig_cases",
        label: "محتوى حالات قبل/بعد حقيقية (بإذن المرضى)",
        pts: 3,
        gap: "بلا حالات قبل/بعد — ماكاينةش بروفا على الجودة",
        reco: "توثيق الحالات بصور احترافية موحدة الإضاءة مع موافقة كتابية، وهذا أقوى محتوى إقناع للمريض الجديد.",
      },
    ],
  },
  {
    key: "video",
    label: "فيديو جولة العيادة",
    tagline: "من الخارج… حتى الكورسي",
    icon: "video",
    weight: 14,
    tone: "#8B5CF6",
    items: [
      {
        key: "tour_exterior",
        label: "لقطات خارجية — واجهة العيادة من الشارع",
        pts: 2,
        gap: "مكاين حتى تصوير للواجهة من برا",
        reco: "لقطة ثابتة للواجهة واللافتة باش المريض يتعرف على العيادة بسهولة قبل ما يوصل.",
      },
      {
        key: "tour_reception",
        label: "الريسيبسيون والمدخل",
        pts: 2,
        gap: "الريسيبسيون ما متصورش",
        reco: "لقطة ترحيبية من الباب للريسيبسيون — أول انطباع هو لي كيبيع.",
      },
      {
        key: "tour_waiting",
        label: "قاعة الانتظار",
        pts: 3,
        gap: "قاعة الانتظار غائبة على الصور والفيديو",
        reco: "إبراز الراحة والنظافة فقاعة الانتظار — كيحارب الخوف من طبيب الأسنان.",
      },
      {
        key: "tour_room",
        label: "قاعة العلاج — بيت الدوكتور",
        pts: 3,
        gap: "قاعة العلاج ما مبياناش",
        reco: "تصوير قاعة العلاج والتعقيم — الشفافية كتبني الثقة قبل أول زيارة.",
      },
      {
        key: "tour_chair",
        label: "لقطة واضحة للكورسي والتجهيزات",
        pts: 2,
        gap: "الكورسي — قلب العيادة — ما باينش مزيان",
        reco: "لقطة مقربة نظيفة للكرسي والأجهزة الحديثة، هي أول حاجة كيقلب عليها المريض.",
      },
      {
        key: "tour_published",
        label: "فيديو مونتاج كامل منشور (إنستغرام/يوتيوب/خرائط)",
        pts: 2,
        gap: "مكاينش فيديو جولة منشور",
        reco: "مونتاج 45-60 ثانية: برا → ريسيبسيون → انتظار → قاعة العلاج → الكورسي، وينشر فكل المنصات.",
      },
    ],
  },
  {
    key: "maps",
    label: "خرائط جوجل",
    tagline: "البطاقة والصور والمعلومات",
    icon: "map-pin",
    weight: 18,
    tone: "#2E7DD1",
    items: [
      {
        key: "maps_listing",
        label: "بطاقة Google Business مفعّلة ومُستملَكة",
        pts: 4,
        gap: "البطاقة فخرائط جوجل إما غائبة أو غير مستملَكة",
        reco: "استملاك Google Business Profile وتوثيقه — هنا كيبدأ 70% من مرضى 'طبيب أسنان قريب مني'.",
      },
      {
        key: "maps_photos_ext",
        label: "صور الواجهة الخارجية على الخرائط",
        pts: 3,
        gap: "مكاين حتى صورة للعيادة من برا فالخرائط",
        reco: "رفع صور نهارية واضحة للواجهة واللافتة باش الناس يتعرفو على المكان من أول مرة.",
      },
      {
        key: "maps_photos_int",
        label: "صور الداخل: الريسيبسيون وقاعة الانتظار",
        pts: 3,
        gap: "مكاينش داخل العيادة فصور الخرائط",
        reco: "صور احترافية للريسيبسيون وقاعة الانتظار — كتحطّم حاجز الخوف من المجهول.",
      },
      {
        key: "maps_photos_room",
        label: "صور قاعة العلاج والكورسي",
        pts: 3,
        gap: "بيت العلاج والكورسي ما موجودينش فالصور",
        reco: "صور للكرسي والمعدات الحديثة — كتطمّن المريض على مستوى التجهيز قبل ما يجي.",
      },
      {
        key: "maps_info",
        label: "معلومات محيّنة: الهاتف، الأوقات، الخدمات",
        pts: 3,
        gap: "الأوقات أو الهاتف قدام أو غلطين فالخرائط",
        reco: "تحيين الساعات، الهاتف، الخدمات، وأيام العطل — معلومة غلط = مريض ضايع للمنافس.",
      },
      {
        key: "maps_pin",
        label: "الموقع (الدبوس) دقيق فالخريطة",
        pts: 2,
        gap: "الدبوس مضروب — الناس كيتديو لبلاصة أخرى",
        reco: "تصحيح إحداثيات الدبوس واختبار الطريق من أحياء مختلفة.",
      },
    ],
  },
  {
    key: "website",
    label: "الموقع والحجز",
    tagline: "واجهة رقمية كتجيب مواعيد",
    icon: "globe",
    weight: 20,
    tone: "#0C7C64",
    items: [
      {
        key: "web_exists",
        label: "عندو موقع ويب",
        pts: 5,
        gap: "ماعندوش موقع — غائب على جوجل سيرش",
        reco: "موقع بسيط من صفحة أو واحد احترافي: الخدمات، الصور، الموقع، وأزرار الحجز — الواجهة الرسمية ديالو.",
      },
      {
        key: "web_booking",
        label: "حجز المواعيد أونلاين من الموقع",
        pts: 6,
        gap: "ماكاينش حجز أونلاين — المريض خاصو يتصل ويستنى",
        reco: "نظام حجز مباشر (كالندلي أو نظام مخصص) مربوط بجدول العيادة — كيحوّل الزائر لمريض وهو ناعس.",
      },
      {
        key: "web_whatsapp",
        label: "زر تواصل واتساب مباشر",
        pts: 4,
        gap: "مكاين زر واتساب",
        reco: "زر واتساب عائم برسالة جاهزة ('سلام، بغيت نحجز موعد…') — أسرع قناة تواصل فالمغرب.",
      },
      {
        key: "web_mobile",
        label: "الموقع مريح فالتيليفون وسريع",
        pts: 3,
        gap: "الموقع ثقيل أو مكسّر فالهاتف",
        reco: "تحسين السرعة والتجاوب مع الموبايل — 80% من الزيارات كيجيو من التيليفون.",
      },
      {
        key: "web_services",
        label: "صفحة الخدمات والأسعار التوجيهية",
        pts: 2,
        gap: "الخدمات والأثمنة ما مذكورينش",
        reco: "صفحة خدمات (تبييض، تقويم، زراعة…) مع أثمنة توجيهية — كتفلطري المكالمات وكتبني الثقة.",
      },
    ],
  },
  {
    key: "reviews",
    label: "التقييمات والسمعة",
    tagline: "نجوم جوجل كيحسمو القرار",
    icon: "star",
    weight: 18,
    tone: "#E8A020",
    items: [
      {
        key: "rev_count10",
        label: "10+ تقييمات على خرائط جوجل",
        pts: 4,
        gap: "قل من 10 تقييمات — ماكاينةش ثقة",
        reco: "تشجيع كل مريض راضي يخلّي تقييم عبر رابط QR مباشر فالريسيبسيون أو رسالة واتساب بعد الموعد.",
      },
      {
        key: "rev_rating",
        label: "معدل التقييم 4.0+",
        pts: 5,
        gap: "المعدل تحت 4 نجوم — كيخوّف المرضى الجدد",
        reco: "معالجة أسباب التقييمات السلبية + جمع تقييمات جديدة إيجابية باش يترفع المعدل فوق 4.2.",
      },
      {
        key: "rev_reply",
        label: "الدوكتور كيجاوب على التقييمات",
        pts: 4,
        gap: "حتى جواب على التقييمات — ولا على السلبية",
        reco: "الرد على كل تقييم (حتى السلبي بهدوء واحترافية) — كيبين أن العيادة عايشة وكتهتم.",
      },
      {
        key: "rev_recent",
        label: "تقييمات حديثة خلال آخر 90 يوم",
        pts: 3,
        gap: "التقييمات قديمة — كيبان كأن العيادة سدّات",
        reco: "تدفق مستمر: دعوة 3-4 مرضى كل أسبوع للتقييم باش يبقى التاريخ حديث دائماً.",
      },
      {
        key: "rev_count30",
        label: "30+ تقييم — حجم ثقة قوي",
        pts: 2,
        gap: "حجم التقييمات صغير بزاف",
        reco: "الهدف 30 ثم 100 تقييم: نظام تلقائي ديال طلب التقييم بعد كل موعد.",
      },
    ],
  },
  {
    key: "engagement",
    label: "التفاعل مع المرضى",
    tagline: "الأجوبة كتصنع الثقة",
    icon: "message-circle",
    weight: 12,
    tone: "#0891B2",
    items: [
      {
        key: "qa_google",
        label: "كيجاوب على أسئلة المرضى فخرائط جوجل (Q&A)",
        pts: 4,
        gap: "أسئلة جوجل بلا أجوبة — المنافس غالباً هو لي كيجاوب",
        reco: "تفعيل إشعارات Q&A والرد خلال 24 ساعة + زرع أسئلة شائعة مع أجوبتها مسبقاً.",
      },
      {
        key: "qa_comments",
        label: "كيرد على التعليقات والرسائل فالسوشيال",
        pts: 4,
        gap: "التعليقات والرسائل مهملة",
        reco: "ردّ سريع (أقل من ساعة بخدمة) مع ردود جاهزة ومحادثة واتساب — كل رسالة هي مريض محتمل.",
      },
      {
        key: "qa_faq",
        label: "محتوى أجوبة للأسئلة الشائعة: الوجع؟ الثمن؟ المدة؟",
        pts: 4,
        gap: "مكاين حتى محتوى كيجاوب على أسئلة المرضى",
        reco: "سلسلة 'الدوكتور كيجاوبك': فيديوهات وكاروسيلات على أكثر 10 أسئلة كيتساؤلو عليها المرضى.",
      },
    ],
  },
];

export const ALL_ITEMS: (Criterion & { category: CategoryKey })[] =
  CATEGORIES.flatMap((c) =>
    c.items.map((i) => ({ ...i, category: c.key })),
  );

export const ITEM_MAP = new Map(ALL_ITEMS.map((i) => [i.key, i]));
export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.key, c]));

/* ------------------------------------------------------------------ */
/*  الحساب                                                             */
/* ------------------------------------------------------------------ */

export type CategoryScore = {
  key: CategoryKey;
  label: string;
  tone: string;
  icon: string;
  weight: number;
  earned: number;
  pct: number; // 0..100 within category
};

export type Gap = {
  key: string;
  category: CategoryKey;
  categoryLabel: string;
  tone: string;
  label: string; // معيار
  gap: string; // وصف النقص
  reco: string; // توصية
  pts: number;
  priority: "high" | "medium" | "low";
};

export type ScoreResult = {
  total: number; // 0..100
  checked: number;
  totalItems: number;
  categories: CategoryScore[];
  gaps: Gap[];
  grade: Grade;
};

export type Grade = {
  label: string;
  hint: string;
  tone: "emerald" | "lime" | "amber" | "orange" | "red";
};

export function computeScore(responses: AuditResponses): ScoreResult {
  let total = 0;
  let checked = 0;
  const categories: CategoryScore[] = CATEGORIES.map((c) => {
    const earned = c.items.reduce(
      (s, i) => s + (responses[i.key] ? i.pts : 0),
      0,
    );
    total += earned;
    checked += c.items.filter((i) => responses[i.key]).length;
    return {
      key: c.key,
      label: c.label,
      tone: c.tone,
      icon: c.icon,
      weight: c.weight,
      earned,
      pct: Math.round((earned / c.weight) * 100),
    };
  });

  const gaps: Gap[] = ALL_ITEMS.filter((i) => !responses[i.key]).map((i) => {
    const cat = CATEGORY_MAP.get(i.category)!;
    return {
      key: i.key,
      category: i.category,
      categoryLabel: cat.label,
      tone: cat.tone,
      label: i.label,
      gap: i.gap,
      reco: i.reco,
      pts: i.pts,
      priority: i.pts >= 4 ? "high" : i.pts === 3 ? "medium" : "low",
    };
  });

  gaps.sort((a, b) => b.pts - a.pts);

  return {
    total,
    checked,
    totalItems: ALL_ITEMS.length,
    categories,
    gaps,
    grade: gradeOf(total),
  };
}

export function gradeOf(score: number): Grade {
  if (score >= 80)
    return {
      label: "حضور رقمي قوي",
      hint: "العيادة متقدمة رقمياً — باقي غير التحسين والاستمرارية",
      tone: "emerald",
    };
  if (score >= 60)
    return {
      label: "أساس جيد",
      hint: "كاينة قاعدة مزيانة — كاين خدمة محددة باش يتسدّ الفراغ",
      tone: "lime",
    };
  if (score >= 40)
    return {
      label: "حضور متوسط",
      hint: "فرص كبيرة ضايعة — النواقص واضحة وممكن تتدار فشهرين",
      tone: "amber",
    };
  if (score >= 20)
    return {
      label: "حضور ضعيف",
      hint: "المرضى كيلقاو المنافسين قبل ما يلقاو هاد العيادة",
      tone: "orange",
    };
  return {
    label: "شبه غائب رقمياً",
    hint: "العيادة كتعتمد فقط على السمعة الشفهية — خسارة يومية ديال المرضى",
    tone: "red",
  };
}

export const GRADE_COLORS: Record<Grade["tone"], string> = {
  emerald: "#0C8A5F",
  lime: "#65A30D",
  amber: "#D97706",
  orange: "#EA580C",
  red: "#DC2626",
};

/* ------------------------------------------------------------------ */
/*  الاقتراحات الآلية                                                  */
/* ------------------------------------------------------------------ */

export function autoSuggest(checks: AutoChecks | null | undefined): {
  key: string;
  reason: string;
}[] {
  if (!checks) return [];
  const out: { key: string; reason: string }[] = [];
  if (checks.website?.reachable) {
    out.push({ key: "web_exists", reason: "الموقع خدام (تم التحقق آلياً)" });
    if (checks.website.hasBooking)
      out.push({
        key: "web_booking",
        reason: "كاين شكل ديال حجز/موعد فالموقع (آلي)",
      });
    if (checks.website.hasWhatsApp)
      out.push({ key: "web_whatsapp", reason: "زر واتساب متواجد (آلي)" });
    if (checks.website.mobileReady)
      out.push({ key: "web_mobile", reason: "الموقع متجاوب مع الهاتف (آلي)" });
  }
  if (checks.instagram?.valid && checks.instagram.provided)
    out.push({ key: "ig_account", reason: "صيغة الحساب صحيحة (آلي)" });
  if (checks.maps?.valid)
    out.push({
      key: "maps_listing",
      reason: "رابط خرائط جوجل صالح ويشير لمكان (آلي)",
    });
  return out;
}

/* ------------------------------------------------------------------ */
/*  خطة العمل                                                          */
/* ------------------------------------------------------------------ */

export function buildPlan(gaps: Gap[]): {
  phase: string;
  title: string;
  items: Gap[];
}[] {
  const high = gaps.filter((g) => g.priority === "high").slice(0, 6);
  const med = gaps.filter((g) => g.priority === "medium").slice(0, 6);
  const low = gaps.filter((g) => g.priority === "low").slice(0, 6);
  return [
    { phase: "الأسبوع 1—2", title: "الإصلاحات العاجلة", items: high },
    { phase: "الشهر الأول", title: "بنية الحضور", items: med },
    { phase: "الشهر 2—3", title: "التحسين والنمو", items: low },
  ].filter((p) => p.items.length > 0);
}

export function fmtDate(d: string | Date): string {
  try {
    return new Intl.DateTimeFormat("ar-MA-u-nu-latn", {
      dateStyle: "medium",
    }).format(new Date(d));
  } catch {
    return String(d);
  }
}
