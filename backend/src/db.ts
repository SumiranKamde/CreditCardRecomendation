// Prisma client singleton.
// ---------------------------------------------------------------------------
// One shared PrismaClient for the whole process. In dev we run with
// `node --watch`, which re-imports modules on every file change; caching the
// client on `globalThis` stops each reload from opening a brand-new connection
// pool against Neon (which would eventually exhaust the free-tier limit).
//
// NOTE: PrismaClient reads DATABASE_URL from the environment when constructed,
// so `dotenv` must be loaded before this module is first imported. server.ts
// does that with `import "dotenv/config"` as its very first line.
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
