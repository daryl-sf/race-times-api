import { builder, RoleEnum } from "@/schema/builder";
import { UserApi } from "@/schema/objects";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

builder.mutationField("createUser", (t) =>
  t.prismaField({
    type: UserApi,
    authScopes: { isAuthenticated: true },
    args: {
      email: t.arg.string({ required: true, validate: z.email() }),
      password: t.arg.string({ required: true, validate: z.string().min(6).max(100) }),
      organizationId: t.arg.string({ required: true }),
      role: t.arg({ type: RoleEnum, required: true }),
      firstName: t.arg.string({ required: true }),
      lastName: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify current user is from same organization and has permission
      if (currentUser?.organizationId !== args.organizationId) {
        throw new Error("Not authorized to create users for this organization");
      }

      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email: args.email },
      });

      if (existingUser) {
        throw new Error("Email already in use");
      }

      // Hash password
      const hashedPassword = await hashPassword(args.password);

      // Create user and profile in transaction
      const user = await db.user.create({
        ...query,
        data: {
          email: args.email,
          password: hashedPassword,
          organizationId: args.organizationId,
          role: args.role,
          profile: {
            create: {
              firstName: args.firstName,
              lastName: args.lastName,
            },
          },
        },
      });

      return user;
    },
  })
);
