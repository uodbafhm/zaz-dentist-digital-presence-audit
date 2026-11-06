import { NextResponse } from "next/server";
import type { AutoChecks, MapsCheck, WebsiteCheck } from "@/db/schema";

const BOOKING_KEYWORDS = [
  "rendez-vous",
  "rendezvous",
  "rdv",
  "booking",
  "book now",
  "book-now",
  "reserv",
  "appointment",
  "prendre rendez",
  "calendly",
  "doctolib",
  "zocdoc",
  "حجز",
  "موعد",
  "احجز",
];

function normalizeUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return null;
  }
}

async function checkWebsite(raw: string): Promise<WebsiteCheck> {
  const url = normalizeUrl(raw);
  if (!url) {
    return {
      provided: true,
      reachable: false,
      hasBooking: false,
      hasWhatsApp: false,
      mobileReady: false,
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; MapsaRadarBot/1.0; +https://mapsoradar.app)",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    clearTimeout(timer);

    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      const decoder = new TextDecoder();
      let bytes = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (bytes > 400_000) break;
      }
      reader.cancel().catch(() => {});
    }

    const lower = html.toLowerCase();
    const titleMatch = /<title[^>]*>([^<]{1,160})<\/title>/i.exec(html);

    return {
      provided: true,
      reachable: res.ok || (res.status >= 200 && res.status < 500),
      statusCode: res.status,
      hasBooking: BOOKING_KEYWORDS.some((k) => lower.includes(k)),
      hasWhatsApp: lower.includes("wa.me") || lower.includes("whatsapp"),
      mobileReady: /name=["']viewport["']/i.test(html),
      title: titleMatch?.[1]?.trim(),
    };
  } catch {
    return {
      provided: true,
      reachable: false,
      hasBooking: false,
      hasWhatsApp: false,
      mobileReady: false,
    };
  }
}

function checkInstagram(raw: string) {
  const t = raw.trim();
  if (!t) return { provided: false, valid: false };

  let handle = t;
  const urlMatch = /instagram\.com\/([A-Za-z0-9._]+)/i.exec(t);
  if (urlMatch) handle = urlMatch[1];
  handle = handle.replace(/^@/, "").replace(/\/+$/, "");

  const valid = /^[A-Za-z0-9._]{1,30}$/.test(handle);
  return {
    provided: true,
    handle: valid ? handle : undefined,
    url: valid ? `https://instagram.com/${handle}` : undefined,
    valid,
  };
}

function checkMaps(raw: string): MapsCheck {
  const t = raw.trim().toLowerCase();
  if (!t) return { provided: false, valid: false, kind: "unknown" };

  const isGoogle =
    t.includes("google.") || t.includes("goo.gl/maps") || t.includes("maps.app.goo.gl");
  const isShare = t.includes("maps.app.goo.gl") || t.includes("goo.gl/maps");
  const isPlace =
    t.includes("/maps/place/") || t.includes("!1s") || t.includes("cid=") || t.includes("/maps/search");

  return {
    provided: true,
    valid: isGoogle && (isPlace || isShare || t.includes("/maps")),
    kind: isShare ? "share" : isPlace ? "place" : "unknown",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      website?: string;
      instagram?: string;
      mapsUrl?: string;
    };

    const result: AutoChecks = { checkedAt: new Date().toISOString() };

    const tasks: Promise<void>[] = [];

    if (body.website?.trim()) {
      tasks.push(
        checkWebsite(body.website).then((w) => {
          result.website = w;
        }),
      );
    }
    if (body.instagram?.trim()) {
      result.instagram = checkInstagram(body.instagram);
    }
    if (body.mapsUrl?.trim()) {
      result.maps = checkMaps(body.mapsUrl);
    }

    await Promise.all(tasks);

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/check", err);
    return NextResponse.json({ error: "تعذّر الفحص الآلي" }, { status: 500 });
  }
}
