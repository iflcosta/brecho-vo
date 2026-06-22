// Brechó na Mão — Prisma config (Prisma 7+)
// Refs: https://pris.ly/d/config-datasource
//
// Prisma 7 separou a config de datasource do schema.prisma.
// Connection URL vai aqui; schema.prisma só define o provider e os models.

import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
