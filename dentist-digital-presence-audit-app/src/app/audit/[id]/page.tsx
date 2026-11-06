import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { audits, clinics, type AuditResponses, type AutoChecks } from "@/db/schema";
import AuditDetail, { type AuditDetailData } from "@/components/audit-detail";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auditId = Number(id);
  if (!Number.isFinite(auditId)) notFound();

  const rows = await db
    .select({ clinic: clinics, audit: audits })
    .from(audits)
    .innerJoin(clinics, eq(audits.clinicId, clinics.id))
    .where(eq(audits.id, auditId))
    .limit(1);

  if (rows.length === 0) notFound();
  const { clinic, audit } = rows[0];

  const data: AuditDetailData = {
    auditId: audit.id,
    clinic: {
      id: clinic.id,
      name: clinic.name,
      dentist: clinic.dentist,
      city: clinic.city,
      phone: clinic.phone,
      instagram: clinic.instagram,
      website: clinic.website,
      mapsUrl: clinic.mapsUrl,
      notes: clinic.notes,
    },
    responses: audit.responses as AuditResponses,
    autoChecks: (audit.autoChecks as AutoChecks | null) ?? null,
    score: audit.score,
    createdAt: audit.createdAt.toISOString(),
    updatedAt: audit.updatedAt.toISOString(),
  };

  return <AuditDetail data={data} />;
}
