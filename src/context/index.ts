import { PrismaClient, User } from '@prisma/client';
import { YogaInitialContext } from 'graphql-yoga';
import { authContext, AuthContext } from './authContext';
import { dbContext } from './dbContext';

export type Context = {
  db: PrismaClient;
  currentUser: AuthContext['user'];
  setAuthCookie: AuthContext['setAuthCookie'];
} & YogaInitialContext;

export async function createContext(ctx: YogaInitialContext): Promise<Context> {
  const [auth, db] = await Promise.all([
    authContext(ctx),
    dbContext(),
  ]);
  return {
    db,
    currentUser: auth.user,
    setAuthCookie: auth.setAuthCookie,
    ...ctx
  };
}
