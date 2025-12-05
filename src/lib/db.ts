import { PrismaClient } from '@prisma/client';

// 1. Cria uma variável global para armazenar a instância do Prisma Client.
// Isso impede que a instância seja recriada em cada Hot Reload no desenvolvimento.
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Adiciona um logger para ver as queries SQL no console (útil para debug)
  log: ['query', 'error', 'warn'],
});

// 2. Garante que a instância seja salva na variável global, mas apenas se 
// não estiver em ambiente de produção (para evitar problemas de memória).
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}