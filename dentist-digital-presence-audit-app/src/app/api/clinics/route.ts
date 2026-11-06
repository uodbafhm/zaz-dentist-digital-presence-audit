import { NextResponse } from "next/server";
import { db } from "@/db";
import { audits, clinics, type AuditResponses, type AutoChecks } from "@/db/schema";
import { computeScore } from "@/lib/criteria";

const clean = (v: unknown, max = 200): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      clinic?: Record<string, unknown>;
      responses?: AuditResponses;
      autoChecks?: AutoChecks | null;
    };

    const name = clean(body.clinic?.name, 120);
    if (!name) {
      return NextResponse.json(
        { error: "اسم العيادة ضروري" },
        { status: 400 },
      );
    }

    const responses = body.responses ?? {};
    const score = computeScore(responses).total;

    const [clinic] = await db
      .insert(clinics)
      .values({
        name,
        dentist: clean(body.clinic?.dentist, 120),
        city: clean(body.clinic?.city, 80),
        phone: clean(body.clinic?.phone, 40),
        mapsUrl: clean(body.clinic?.mapsUrl, 500),
        instagram: clean(body.clinic?.instagram, 200),
        website: clean(body.clinic?.website, 300),
        notes: clean(body.clinic?.notes, 1000),
      })
      .returning();

    const [audit] = await db
      .insert(audits)
      .values({
        clinicId: clinic.id,
        responses,
        autoChecks: body.autoChecks ?? null,
        score,
      })
      .returning();

    return NextResponse.json({ clinic, audit }, { status: 201 });
  } catch (err) {
    console.error("POST /api/clinics", err);
    return NextResponse.json(
      { error: "وقع خطأ أثناء الحفظ — عاود المحاولة" },
      { status: 500 },
    );
  }
}
