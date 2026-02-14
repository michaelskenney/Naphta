import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const emails = pgTable(
  "emails",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    sourceUrl: text("source_url"),
    subject: text("subject"),
    sender: text("sender"),
    recipients: text("recipients"),
    sentAt: timestamp("sent_at"),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("emails_sender_idx").on(table.sender),
    index("emails_sent_at_idx").on(table.sentAt),
  ],
);

export const emailImages = pgTable("email_images", {
  emailId: varchar("email_id", { length: 255 })
    .primaryKey()
    .references(() => emails.id),
  blobUrl: text("blob_url"),
  blobPath: text("blob_path"),
  promptUsed: text("prompt_used"),
  model: varchar("model", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("queued"),
  errorReason: text("error_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const imageJobs = pgTable(
  "image_jobs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    emailId: varchar("email_id", { length: 255 })
      .notNull()
      .references(() => emails.id),
    state: varchar("state", { length: 50 }).notNull().default("queued"),
    attemptCount: integer("attempt_count").notNull().default(0),
    lastError: text("last_error"),
    runAfter: timestamp("run_after"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("image_jobs_email_id_idx").on(table.emailId),
    index("image_jobs_state_idx").on(table.state),
  ],
);

export const generationEvents = pgTable(
  "generation_events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    emailId: varchar("email_id", { length: 255 }).notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    payloadJson: text("payload_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("generation_events_email_id_idx").on(table.emailId),
  ],
);
