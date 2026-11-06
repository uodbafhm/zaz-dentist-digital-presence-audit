import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { audits, clinics, type AuditResponses } from "@/db/schema";
import { ALL_ITEMS, CATEGORY_MAP, computeScore } from "@/lib/criteria";
import DashboardClient, { type DashboardData } from "@/components/dashboard";

export const dynamic = "force-dynamic";

async function getData(): Promise<DashboardData> {
  try {
    const rows = await db
      .select({ clinic: clinics, audit: audits })
      .from(audits)
      .innerJoin(clinics, eq(audits.clinicId, clinics.id))
      .orderBy(desc(audits.updatedAt));

    const cards = rows.map(({ clinic, audit }) => ({
      auditId: audit.id,
      name: clinic.name,
      dentist: clinic.dentist,
      city: clinic.city,
      phone: clinic.phone,
      instagram: clinic.instagram,
      website: clinic.website,
      mapsUrl: clinic.mapsUrl,
      notes: clinic.notes,
      score: audit.score,
      responses: audit.responses as AuditResponses,
      categories: computeScore(audit.responses as AuditResponses).categories.map(
        (c) => ({ key: c.key, label: c.label, tone: c.tone, pct: c.pct }),
      ),
      updatedAt: audit.updatedAt.toISOString(),
    }));

    const total = cards.length;
    const avg = total
      ? Math.round(cards.reduce((s, c) => s + c.score, 0) / total)
      : 0;
    const strong = cards.filter((c) => c.score >= 80).length;
    const weak = cards.filter((c) => c.score < 40).length;

    const gapsTop = ALL_ITEMS.map((item) => {
      const missing = cards.filter((c) => !c.responses[item.key]).length;
      return {
        key: item.key,
        label: item.label,
        categoryLabel: CATEGORY_MAP.get(item.category)?.label ?? "",
        tone: CATEGORY_MAP.get(item.category)?.tone ?? "#0c7c64",
        pts: item.pts,
        missing,
        pctMissing: total ? Math.round((missing / total) * 100) : 0,
      };
    })
      .filter((g) => g.missing > 0)
      .sort((a, b) => b.pctMissing - a.pctMissing || b.pts - a.pts)
      .slice(0, 8);

    return {
      clinics: cards,
      stats: { total, avg, strong, weak },
      gapsTop,
    };
  } catch (err) {
    console.error("dashboard query failed", err);
    return {
      clinics: [],
      stats: { total: 0, avg: 0, strong: 0, weak: 0 },
      gapsTop: [],
    };
  }
}

export default async function Page() {
  const data = await getData();
  return <DashboardClient data={data} />;
}
