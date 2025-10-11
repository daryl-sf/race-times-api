import { builder } from "@/schema/builder";
import { OrganizationApi } from "../objects";

builder.queryFields((t) => ({
  myOrganization: t.prismaField({
    type: OrganizationApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    resolve: async (query, _root, _args, { db, currentUser }) => {
      if (!currentUser?.organizationId) {
        return null;
      }

      return db.organization.findUnique({
        ...query,
        where: { id: currentUser.organizationId },
      });
    },
  }),

  organization: t.prismaField({
    type: OrganizationApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.organization.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  }),

  organizations: t.prismaField({
    type: [OrganizationApi],
    authScopes: { isAuthenticated: true },
    resolve: async (query, _root, _args, { db }) => {
      // Note: In a real app, you'd check if user is super admin here
      return db.organization.findMany({
        ...query,
        orderBy: { name: 'asc' },
      });
    },
  }),
}));
