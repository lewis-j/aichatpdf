import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

// Load the appropriate .env file based on environment
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

// npx drizzle-kit push:pg
