// Brechó na Mão — Prisma config (Prisma 7+)
// Refs: https://pris.ly/d/config-datasource
//
// Prisma 7 separou a config de datasource do schema.prisma.
// Usar o helper `env()` do prisma/config para type-safe env vars.

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
