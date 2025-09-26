import { verifyToken } from '@/lib/auth';
import { User } from '@prisma/client';
import { YogaInitialContext } from 'graphql-yoga';

export type AuthContext = {
  user: User | null;
  setAuthCookie: (token: string) => void;
};

export async function authContext({ request }: YogaInitialContext): Promise<AuthContext> {
  const setAuthCookie = (token: string) => {
    request.cookieStore?.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      domain: process.env.NODE_ENV === 'production' ? "" : "localhost", //todo: set domain for production
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });
  };
  
  const authToken = await request.cookieStore?.get('authToken');
  const token = authToken?.value;
  let user: AuthContext['user'] = null;

  if (token) {
    try {
      user = verifyToken(token);
      setAuthCookie(token);
    } catch {
      console.warn('Invalid token');
    }
  }

  

  return { user, setAuthCookie };
}
