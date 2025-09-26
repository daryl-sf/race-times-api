import { hashPassword } from "@/lib/auth";
import { builder } from "@/schema/builder";
import { UserApi } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("createUser", (t) =>
  t.field({
    type: UserApi,
    authScopes: { isAdmin: true },
    args: {
      email: t.arg.string({ required: true, validate: z.email() }),
      name: t.arg.string({ required: false, validate: z.string().min(2).max(100) }),
      password: t.arg.string({ required: true, validate: z.string().min(6).max(100) }),
    },
    resolve: async (_, args, { db }) => {
      const hashedPassword = await hashPassword(args.password);

      const user = await db.user.create({
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

      return user;
    }
  })
);
