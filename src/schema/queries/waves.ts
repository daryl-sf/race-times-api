import { builder } from "@/schema/builder";
import { WaveApi } from "../objects";

builder.queryFields((t) => ({
  waves: t.prismaField({
    type: [WaveApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.wave.findMany({
        ...query,
        where: { raceId: args.raceId },
        orderBy: { position: 'asc' },
      });
    },
  }),

  wave: t.prismaField({
    type: WaveApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.wave.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  }),
}));
