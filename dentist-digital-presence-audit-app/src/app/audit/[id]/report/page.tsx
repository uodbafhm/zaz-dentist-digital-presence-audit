import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { audits, clinics, type AuditResponses } from "@/db/schema";
import ReportView, { type ReportData } from "@/components/report";

export const dynamic = "force-dynamic";

export default async function ReportPage({
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

  const data: ReportData = {
    auditId: audit.id,
    clinic: {
      name: clinic.name,
      dentist: clinic.dentist,
      city: clinic.city,
      phone: clinic.phone,
      instagram: clinic.instagram,
      website: clinic.website,
      mapsUrl: clinic.mapsUrl,
    },
    responses: audit.responses as AuditResponses,
    createdAt: audit.createdAt.toISOString(),
  };

  return <ReportView data={data} />;
}
