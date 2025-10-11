import { builder } from "@/schema/builder";
import { ResultCacheApi } from "../objects";
import { getLeaderboard } from "@/lib/results";

builder.queryFields((t) => ({
  results: t.prismaField({
    type: [ResultCacheApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      category: t.arg.string(),
    },
    resolve: async (query, _root, args, { db }) => {
      const where: any = {
        raceId: args.raceId,
      };

      if (args.category) {
        where.category = args.category;
      }

      return db.resultCache.findMany({
        ...query,
        where,
        orderBy: { place: 'asc' },
      });
    },
  }),

  leaderboard: t.field({
    type: [ResultCacheApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      category: t.arg.string(),
      limit: t.arg.int({ defaultValue: 100 }),
    },
    resolve: async (_root, args, { db }) => {
      const results = await getLeaderboard(db, args.raceId, args.category || undefined);
      return results.slice(0, args.limit || 100);
    },
  }),

  participantResult: t.prismaField({
    type: ResultCacheApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.resultCache.findFirst({
        ...query,
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
        },
      });
    },
  }),

  resultsByCategory: t.prismaField({
    type: [ResultCacheApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      category: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.resultCache.findMany({
        ...query,
        where: {
          raceId: args.raceId,
          category: args.category,
          chipTimeMs: { not: null },
        },
        orderBy: { place: 'asc' },
      });
    },
  }),

  categoriesInRace: t.field({
    type: ['String'],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db }) => {
      const results = await db.resultCache.findMany({
        where: {
          raceId: args.raceId,
          category: { not: null },
        },
        select: { category: true },
        distinct: ['category'],
      });
      return results.map(r => r.category).filter(c => c !== null) as string[];
    },
  }),

  genderResults: t.prismaField({
    type: [ResultCacheApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      gender: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.resultCache.findMany({
        ...query,
        where: {
          raceId: args.raceId,
          participant: {
            gender: args.gender,
          },
          chipTimeMs: { not: null },
        },
        orderBy: { chipTimeMs: 'asc' },
      });
    },
  }),
}));
