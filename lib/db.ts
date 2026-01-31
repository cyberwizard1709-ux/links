import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // For Turso/libSQL
  if (databaseUrl.startsWith("libsql://")) {
    if (!authToken) {
      throw new Error("TURSO_AUTH_TOKEN is not set");
    }
    const adapter = new PrismaLibSql({ 
      url: databaseUrl,
      authToken: authToken,
    });
    return new PrismaClient({ adapter });
  }

  // For local SQLite file (fallback)
  if (databaseUrl.startsWith("file:")) {
    const adapter = new PrismaLibSql({ url: databaseUrl });
    return new PrismaClient({ adapter });
  }

  // For other connection strings
  return new PrismaClient();
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
