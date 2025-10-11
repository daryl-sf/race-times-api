import { builder } from "@/schema/builder";
import { RaceApi } from "../objects";

builder.queryFields((t) => ({
  races: t.prismaField({
    type: [RaceApi],
    authScopes: { isAuthenticated: true },
    args: {
      organizationId: t.arg.string(),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      const where: any = {};

      // If organizationId provided, filter by it
      if (args.organizationId) {
        where.organizationId = args.organizationId;
      } else if (currentUser?.organizationId) {
        // Otherwise, filter by user's organization
        where.organizationId = currentUser.organizationId;
      }

      return db.race.findMany({
        ...query,
        where,
        orderBy: { startDate: 'desc' },
      });
    },
  }),

  race: t.prismaField({
    type: RaceApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.race.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  }),

  upcomingRaces: t.prismaField({
    type: [RaceApi],
    authScopes: { isAuthenticated: true },
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      const where: any = {
        startDate: { gte: new Date() },
      };

      if (currentUser?.organizationId) {
        where.organizationId = currentUser.organizationId;
      }

      return db.race.findMany({
        ...query,
        where,
        orderBy: { startDate: 'asc' },
        take: args.limit || 10,
      });
    },
  }),
}));
