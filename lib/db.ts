// antonyhyson/klickhire/Klickhire-e4bc0e3dd700b8b7e4ec33875385fb3f8308bc6d/lib/db.ts
import { neon } from "@neondatabase/serverless";

// You should already have DATABASE_URL set in your .env file
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);