import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export type AuditResponses = Record<string, boolean>;

export type WebsiteCheck = {
  provided: boolean;
  reachable: boolean;
  hasBooking: boolean;
  hasWhatsApp: boolean;
  mobileReady: boolean;
  title?: string;
  statusCode?: number;
};

export type InstagramCheck = {
  provided: boolean;
  handle?: string;
  url?: string;
  valid: boolean;
};

export type MapsCheck = {
  provided: boolean;
  valid: boolean;
  kind: "place" | "share" | "unknown";
};

export type AutoChecks = {
  website?: WebsiteCheck;
  instagram?: InstagramCheck;
  maps?: MapsCheck;
  checkedAt: string;
};

export const clinics = pgTable("clinics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dentist: text("dentist"),
  city: text("city"),
  phone: text("phone"),
  mapsUrl: text("maps_url"),
  instagram: text("instagram"),
  website: text("website"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id")
    .notNull()
    .references(() => clinics.id, { onDelete: "cascade" }),
  responses: jsonb("responses").$type<AuditResponses>().notNull().default({}),
  autoChecks: jsonb("auto_checks").$type<AutoChecks | null>(),
  score: integer("score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ClinicRow = typeof clinics.$inferSelect;
export type AuditRow = typeof audits.$inferSelect;
