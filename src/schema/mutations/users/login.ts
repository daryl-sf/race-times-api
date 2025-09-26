import { createToken, verifyPassword } from "@/lib/auth";
import { builder } from "@/schema/builder";
import { UserApi } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("login", (t) =>
  t.field({
    type: UserApi,
    args: {
      email: t.arg.string({ required: true, validate: z.email() }),
      password: t.arg.string({ required: true, validate: z.string().min(6).max(100) }),
    },
    resolve: async (_root, { email, password }, { db, currentUser, setAuthCookie, ...ctx }) => {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid login");

      const valid = await verifyPassword(password, user.password);
      if (!valid) throw new Error("Invalid login");

      const token = createToken(user);
      setAuthCookie(token);

      return user;
    },
  })
);
