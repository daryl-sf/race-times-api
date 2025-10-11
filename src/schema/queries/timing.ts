import { builder } from "@/schema/builder";
import { TimingEventApi } from "../objects";

builder.queryFields((t) => ({
  timingEvents: t.prismaField({
    type: [TimingEventApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string(),
      checkpointId: t.arg.string(),
      timingSessionId: t.arg.string(),
      includeDeleted: t.arg.boolean({ defaultValue: false }),
    },
    resolve: async (query, _root, args, { db }) => {
      const where: any = {
        raceId: args.raceId,
      };

      if (args.participantId) {
        where.participantId = args.participantId;
      }

      if (args.checkpointId) {
        where.checkpointId = args.checkpointId;
      }

      if (args.timingSessionId) {
        where.timingSessionId = args.timingSessionId;
      }

      if (!args.includeDeleted) {
        where.deleted = false;
      }

      return db.timingEvent.findMany({
        ...query,
        where,
        orderBy: { sequence: 'asc' },
      });
    },
  }),

  timingEvent: t.prismaField({
    type: TimingEventApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.timingEvent.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  }),

  participantTimes: t.prismaField({
    type: [TimingEventApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.timingEvent.findMany({
        ...query,
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
          deleted: false,
        },
        orderBy: [
          { checkpoint: { orderIndex: 'asc' } },
          { timeMs: 'asc' },
        ],
      });
    },
  }),
}));
