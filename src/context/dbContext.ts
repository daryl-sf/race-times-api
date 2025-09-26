import { prisma } from '@/lib/prisma';

export async function dbContext() {
  return prisma;
}
