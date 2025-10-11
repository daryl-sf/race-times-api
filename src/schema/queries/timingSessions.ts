import { builder } from "@/schema/builder";
import { TimingSessionApi } from "../objects";

builder.queryFields((t) => ({
  timingSessions: t.prismaField({
    type: [TimingSessionApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.timingSession.findMany({
        ...query,
        where: { raceId: args.raceId },
        orderBy: { startedAt: 'desc' },
      });
    },
  }),

  activeTimingSessions: t.prismaField({
    type: [TimingSessionApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.timingSession.findMany({
        ...query,
        where: {
          raceId: args.raceId,
          endedAt: null,
        },
        orderBy: { startedAt: 'desc' },
      });
    },
  }),

  timingSession: t.prismaField({
    type: TimingSessionApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.timingSession.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  }),
}));
