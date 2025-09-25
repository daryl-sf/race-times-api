import { createToken, hashPassword } from "@/lib/auth";
import { builder } from "@/schema/builder";
import { AuthPayload } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("createUser", (t) =>
  t.field({
    type: AuthPayload,
    // authScopes: { isAdmin: true },
    args: {
      email: t.arg.string({ required: true, validate: z.email() }),
      name: t.arg.string({ required: false, validate: z.string().min(2).max(100) }),
      password: t.arg.string({ required: true, validate: z.string().min(6).max(100) }),
    },
    resolve: async (_, args, context, _info) => {
      const hashedPassword = await hashPassword(args.password);
      console.log(context.prisma)
      const user = await context.prisma.user.create({
        data: {
          email: args.email,
          name: args.name || null,
          password: hashedPassword,
          profile: {
            create: {
              firstName: "",
              lastName: "",
            }
          }
        },
      });

      const token = createToken(user);
      return { user, token };
    }
  })
);
