import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");
  const adapter = new PrismaPg({ connectionString: url.toString(), ssl: true });
  return new PrismaClient({ adapter });
}

// Proxy defers client creation (and DATABASE_URL access) to first actual use,
// so the module can be safely imported during Next.js build without the env var.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient());
    const val = Reflect.get(client, prop, client);
    return typeof val === "function" ? val.bind(client) : val;
  },
});
