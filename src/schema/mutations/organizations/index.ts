import { builder } from "@/schema/builder";
import { OrganizationApi } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("createOrganization", (t) =>
  t.prismaField({
    type: OrganizationApi,
    authScopes: { isAuthenticated: true },
    args: {
      name: t.arg.string({ required: true, validate: z.string().min(1).max(200) }),
      timezone: t.arg.string({ required: true, validate: z.string().min(1) }),
    },
    resolve: async (query, _root, args, { db }) => {
      // Note: In a real app, you'd check if user is a super admin here
      return db.organization.create({
        ...query,
        data: {
          name: args.name,
          timezone: args.timezone,
        },
      });
    },
  })
);

builder.mutationField("updateOrganization", (t) =>
  t.prismaField({
    type: OrganizationApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string({ validate: z.string().min(1).max(200) }),
      timezone: t.arg.string({ validate: z.string().min(1) }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify user belongs to this organization
      if (currentUser?.organizationId !== args.id) {
        throw new Error("Not authorized to update this organization");
      }

      const updateData: any = {};
      if (args.name !== undefined) updateData.name = args.name;
      if (args.timezone !== undefined) updateData.timezone = args.timezone;

      return db.organization.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);
