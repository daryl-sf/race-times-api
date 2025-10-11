import { builder, RoleEnum } from "@/schema/builder";
import { UserApi } from "@/schema/objects";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";

builder.mutationField("updateUser", (t) =>
  t.prismaField({
    type: UserApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      email: t.arg.string({ validate: z.email() }),
      role: t.arg({ type: RoleEnum }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Get existing user
      const existingUser = await db.user.findUnique({
        where: { id: args.id },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Verify current user is from same organization
      if (currentUser?.organizationId !== existingUser.organizationId) {
        throw new Error("Not authorized to update this user");
      }

      const updateData: any = {};
      if (args.email !== undefined) updateData.email = args.email;
      if (args.role !== undefined) updateData.role = args.role;

      return db.user.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

builder.mutationField("updateProfile", (t) =>
  t.field({
    type: 'Boolean',
    authScopes: { isAuthenticated: true },
    args: {
      firstName: t.arg.string({ validate: z.string().min(1).max(100) }),
      lastName: t.arg.string({ validate: z.string().min(1).max(100) }),
      bio: t.arg.string({ validate: z.string().max(1000) }),
    },
    resolve: async (_root, args, { db, currentUser }) => {
      if (!currentUser?.id) {
        throw new Error("Not authenticated");
      }

      const updateData: any = {};
      if (args.firstName !== undefined) updateData.firstName = args.firstName;
      if (args.lastName !== undefined) updateData.lastName = args.lastName;
      if (args.bio !== undefined) updateData.bio = args.bio;

      await db.profile.update({
        where: { userId: currentUser.id },
        data: updateData,
      });

      return true;
    },
  })
);

builder.mutationField("changePassword", (t) =>
  t.field({
    type: 'Boolean',
    authScopes: { isAuthenticated: true },
    args: {
      currentPassword: t.arg.string({ required: true }),
      newPassword: t.arg.string({ required: true, validate: z.string().min(6).max(100) }),
    },
    resolve: async (_root, args, { db, currentUser }) => {
      if (!currentUser?.id) {
        throw new Error("Not authenticated");
      }

      const user = await db.user.findUnique({
        where: { id: currentUser.id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const valid = await verifyPassword(args.currentPassword, user.password);

      if (!valid) {
        throw new Error("Current password is incorrect");
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(args.newPassword);

      await db.user.update({
        where: { id: currentUser.id },
        data: { password: hashedPassword },
      });

      return true;
    },
  })
);

builder.mutationField("assignRole", (t) =>
  t.prismaField({
    type: UserApi,
    authScopes: { isAuthenticated: true },
    args: {
      userId: t.arg.string({ required: true }),
      role: t.arg({ type: RoleEnum, required: true }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Get target user
      const targetUser = await db.user.findUnique({
        where: { id: args.userId },
      });

      if (!targetUser) {
        throw new Error("User not found");
      }

      // Verify current user is from same organization
      if (currentUser?.organizationId !== targetUser.organizationId) {
        throw new Error("Not authorized to assign roles for this user");
      }

      return db.user.update({
        ...query,
        where: { id: args.userId },
        data: { role: args.role },
      });
    },
  })
);
