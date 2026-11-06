import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { audits, clinics, type AuditResponses } from "@/db/schema";
import { computeScore } from "@/lib/criteria";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const auditId = Number(id);
    if (!Number.isFinite(auditId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }

    const body = (await req.json()) as {
      responses?: AuditResponses;
      clinic?: Record<string, unknown>;
    };

    if (body.clinic) {
      const c = body.clinic;
      const [audit] = await db
        .select()
        .from(audits)
        .where(eq(audits.id, auditId))
        .limit(1);
      if (!audit)
        return NextResponse.json({ error: "الفحص ما موجودش" }, { status: 404 });

      await db
        .update(clinics)
        .set({
          name: typeof c.name === "string" && c.name.trim() ? c.name.trim().slice(0, 120) : undefined,
          dentist: typeof c.dentist === "string" ? c.dentist.trim().slice(0, 120) : undefined,
          city: typeof c.city === "string" ? c.city.trim().slice(0, 80) : undefined,
          phone: typeof c.phone === "string" ? c.phone.trim().slice(0, 40) : undefined,
          mapsUrl: typeof c.mapsUrl === "string" ? c.mapsUrl.trim().slice(0, 500) : undefined,
          instagram: typeof c.instagram === "string" ? c.instagram.trim().slice(0, 200) : undefined,
          website: typeof c.website === "string" ? c.website.trim().slice(0, 300) : undefined,
          notes: typeof c.notes === "string" ? c.notes.trim().slice(0, 1000) : undefined,
        })
        .where(eq(clinics.id, audit.clinicId));
    }

    if (body.responses) {
      const score = computeScore(body.responses).total;
      const [updated] = await db
        .update(audits)
        .set({
          responses: body.responses,
          score,
          updatedAt: new Date(),
        })
        .where(eq(audits.id, auditId))
        .returning();

      if (!updated)
        return NextResponse.json({ error: "الفحص ما موجودش" }, { status: 404 });

      return NextResponse.json({ audit: updated });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/audits/[id]", err);
    return NextResponse.json({ error: "وقع خطأ" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const auditId = Number(id);
    if (!Number.isFinite(auditId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }

    const [audit] = await db
      .select()
      .from(audits)
      .where(eq(audits.id, auditId))
      .limit(1);

    if (!audit)
      return NextResponse.json({ error: "الفحص ما موجودش" }, { status: 404 });

    await db.delete(clinics).where(eq(clinics.id, audit.clinicId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/audits/[id]", err);
    return NextResponse.json({ error: "وقع خطأ" }, { status: 500 });
  }
}
