import { PrismaClient, User } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { YogaInitialContext } from 'graphql-yoga';

export type Context = {
  prisma: PrismaClient;
  currentUser: User | null;
};

export async function createContext({ request }: YogaInitialContext): Promise<Context> {
  const authToken = request.headers.get('authorization')?.split(' ')[1] || null;
  if (!authToken) {
    return {
      prisma: new PrismaClient(),
      currentUser: null,
    };
  }

  const decodedToken = verifyToken(authToken);
  const currentUser = decodedToken ?? null;

  return {
    prisma: new PrismaClient(),
    currentUser,
  };
}
