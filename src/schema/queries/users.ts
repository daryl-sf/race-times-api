import { builder } from "@/schema/builder";
import { UserApi } from "../objects";

builder.queryFields((t) => ({
  me: t.prismaField({
    type: UserApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    resolve: (_query, _root, _args, { currentUser }) => {
      return currentUser;
    }
  }),

  users: t.prismaField({
    type: [UserApi],
    authScopes: { isAuthenticated: true },
    args: {
      organizationId: t.arg.string(),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      const orgId = args.organizationId || currentUser?.organizationId;

      if (!orgId) {
        return [];
      }

      // User can only see users from their organization
      if (args.organizationId && args.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to view users from other organizations");
      }

      return db.user.findMany({
        ...query,
        where: { organizationId: orgId },
        orderBy: { email: 'asc' },
      });
    },
  }),

  user: t.prismaField({
    type: UserApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      const user = await db.user.findUnique({
        ...query,
        where: { id: args.id },
      });

      // User can only view users from their organization
      if (user && user.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to view this user");
      }

      return user;
    },
  }),
}));
