import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    });

if (process.env.NEXT_PUBLIC_PGADMIN_DB_URL !== 'production') 
    globalForPrisma.prisma = prisma;
