import { createToken, verifyPassword } from "@/lib/auth";
import { builder } from "@/schema/builder";
import { AuthPayload } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("login", (t) =>
  t.field({
    type: AuthPayload,
    args: {
      email: t.arg.string({ required: true, validate: z.email() }),
      password: t.arg.string({ required: true, validate: z.string().min(6).max(100) }),
    },
    resolve: async (_root, { email, password }, { prisma, currentUser }) => {
      if ( currentUser ) {
        return { user: currentUser, token: createToken(currentUser) };
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid login");

      const valid = await verifyPassword(password, user.password);
      if (!valid) throw new Error("Invalid login");

      return { user, token: createToken(user) };
    },
  })
);
