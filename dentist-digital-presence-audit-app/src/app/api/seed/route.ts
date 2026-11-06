import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { audits, clinics, type AuditResponses } from "@/db/schema";
import { computeScore } from "@/lib/criteria";

const DEMO: {
  clinic: {
    name: string;
    dentist: string;
    city: string;
    phone: string;
    instagram?: string;
    website?: string;
    mapsUrl?: string;
    notes?: string;
  };
  on: string[];
}[] = [
  {
    clinic: {
      name: "عيادة ابتسامة الأطلس",
      dentist: "د. سلمى بنعمر",
      city: "الدار البيضاء",
      phone: "0522 44 55 66",
      instagram: "@sourire.atlas",
      website: "https://sourire-atlas.ma",
      mapsUrl: "https://maps.app.goo.gl/atlas-demo",
      notes: "عيادة عصرية فالمعاريف — مهتمين بالتسويق",
    },
    on: [
      "ig_account", "ig_active", "ig_consistent", "ig_reels", "ig_cases",
      "tour_exterior", "tour_reception", "tour_waiting", "tour_room", "tour_chair",
      "maps_listing", "maps_photos_ext", "maps_photos_int", "maps_info", "maps_pin",
      "web_exists", "web_booking", "web_whatsapp", "web_mobile", "web_services",
      "rev_count10", "rev_rating", "rev_reply",
      "qa_comments", "qa_faq",
    ],
  },
  {
    clinic: {
      name: "عيادة النور لطب الأسنان",
      dentist: "د. هشام العلوي",
      city: "الرباط",
      phone: "0537 77 88 99",
      instagram: "@cabinet.ennour",
      mapsUrl: "https://maps.app.goo.gl/ennour-demo",
      notes: "التقييمات مزيانة ولكن السوشيال ناعسة",
    },
    on: [
      "ig_account", "ig_active", "ig_cases",
      "maps_listing", "maps_photos_ext", "maps_info", "maps_pin",
      "web_exists", "web_whatsapp",
      "rev_count10", "rev_rating",
      "qa_comments",
    ],
  },
  {
    clinic: {
      name: "عيادة الأمل — د. ياسين بلقاضي",
      dentist: "د. ياسين بلقاضي",
      city: "طنجة",
      phone: "0539 11 22 33",
      notes: "سمعة شفهية فقط — بلا حضور رقمي تقريباً",
    },
    on: ["ig_account", "maps_listing", "maps_info"],
  },
];

export async function POST() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clinics);

    if (count > 0) {
      return NextResponse.json({ skipped: true, created: 0 });
    }

    const created: number[] = [];

    for (const d of DEMO) {
      const responses: AuditResponses = Object.fromEntries(
        d.on.map((k) => [k, true]),
      );
      const score = computeScore(responses).total;

      const [clinic] = await db
        .insert(clinics)
        .values({
          name: d.clinic.name,
          dentist: d.clinic.dentist,
          city: d.clinic.city,
          phone: d.clinic.phone,
          instagram: d.clinic.instagram ?? null,
          website: d.clinic.website ?? null,
          mapsUrl: d.clinic.mapsUrl ?? null,
          notes: d.clinic.notes ?? null,
        })
        .returning();

      await db.insert(audits).values({
        clinicId: clinic.id,
        responses,
        score,
        autoChecks: {
          checkedAt: new Date().toISOString(),
          website: d.clinic.website
            ? {
                provided: true,
                reachable: true,
                hasBooking: d.on.includes("web_booking"),
                hasWhatsApp: d.on.includes("web_whatsapp"),
                mobileReady: d.on.includes("web_mobile"),
                title: `${d.clinic.name} — الصفحة الرئيسية`,
              }
            : undefined,
          instagram: d.clinic.instagram
            ? {
                provided: true,
                handle: d.clinic.instagram.replace("@", ""),
                url: `https://instagram.com/${d.clinic.instagram.replace("@", "")}`,
                valid: true,
              }
            : undefined,
          maps: d.clinic.mapsUrl
            ? { provided: true, valid: true, kind: "share" }
            : undefined,
        },
      });

      created.push(clinic.id);
    }

    return NextResponse.json({ created: created.length });
  } catch (err) {
    console.error("POST /api/seed", err);
    return NextResponse.json({ error: "وقع خطأ" }, { status: 500 });
  }
}
