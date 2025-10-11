import { builder } from "@/schema/builder";

// Simple stats object
const RaceStatsType = builder.simpleObject('RaceStats', {
  fields: (t) => ({
    totalParticipants: t.int(),
    totalFinishers: t.int(),
    totalDNF: t.int(),
    totalDQ: t.int(),
    averageTimeSeconds: t.float({ nullable: true }),
    fastestTimeSeconds: t.float({ nullable: true }),
    slowestTimeSeconds: t.float({ nullable: true }),
  }),
});

const CheckpointStatsType = builder.simpleObject('CheckpointStats', {
  fields: (t) => ({
    checkpointId: t.string(),
    checkpointName: t.string({ nullable: true }),
    totalEvents: t.int(),
    averageTimeSeconds: t.float({ nullable: true }),
    throughputPerHour: t.float({ nullable: true }),
  }),
});

const SplitTimeType = builder.simpleObject('SplitTime', {
  fields: (t) => ({
    checkpointId: t.string(),
    checkpointName: t.string({ nullable: true }),
    timeMs: t.field({ type: 'BigInt', nullable: true }),
    elapsedMs: t.field({ type: 'BigInt', nullable: true }),
    orderIndex: t.int(),
  }),
});

builder.queryFields((t) => ({
  raceStatistics: t.field({
    type: RaceStatsType,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db }) => {
      // Get total participants
      const totalParticipants = await db.participant.count({
        where: { raceId: args.raceId },
      });

      // Get results
      const results = await db.resultCache.findMany({
        where: { raceId: args.raceId },
      });

      const totalFinishers = results.filter(r => r.chipTimeMs !== null && r.category !== 'DQ').length;
      const totalDQ = results.filter(r => r.category === 'DQ').length;
      const totalDNF = totalParticipants - totalFinishers - totalDQ;

      // Calculate average time
      const finishedTimes = results
        .filter(r => r.chipTimeMs !== null && r.category !== 'DQ')
        .map(r => Number(r.chipTimeMs));

      const averageTimeSeconds = finishedTimes.length > 0
        ? finishedTimes.reduce((a, b) => a + b, 0) / finishedTimes.length / 1000
        : null;

      const fastestTimeSeconds = finishedTimes.length > 0
        ? Math.min(...finishedTimes) / 1000
        : null;

      const slowestTimeSeconds = finishedTimes.length > 0
        ? Math.max(...finishedTimes) / 1000
        : null;

      return {
        totalParticipants,
        totalFinishers,
        totalDNF,
        totalDQ,
        averageTimeSeconds,
        fastestTimeSeconds,
        slowestTimeSeconds,
      };
    },
  }),

  checkpointStatistics: t.field({
    type: [CheckpointStatsType],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db }) => {
      const checkpoints = await db.checkpoint.findMany({
        where: { raceId: args.raceId },
        orderBy: { orderIndex: 'asc' },
      });

      const stats = [];

      for (const checkpoint of checkpoints) {
        const events = await db.timingEvent.findMany({
          where: {
            raceId: args.raceId,
            checkpointId: checkpoint.id,
            deleted: false,
          },
        });

        const totalEvents = events.length;

        // Calculate average elapsed time
        const elapsedTimes = events
          .filter(e => e.elapsedMs !== null)
          .map(e => Number(e.elapsedMs));

        const averageTimeSeconds = elapsedTimes.length > 0
          ? elapsedTimes.reduce((a, b) => a + b, 0) / elapsedTimes.length / 1000
          : null;

        // Calculate throughput (events per hour)
        let throughputPerHour = null;
        if (events.length > 1) {
          const times = events.map(e => Number(e.timeMs)).sort((a, b) => a - b);
          const firstTime = times[0];
          const lastTime = times[times.length - 1];
          const durationHours = (lastTime - firstTime) / 1000 / 3600;
          if (durationHours > 0) {
            throughputPerHour = events.length / durationHours;
          }
        }

        stats.push({
          checkpointId: checkpoint.id,
          checkpointName: checkpoint.name,
          totalEvents,
          averageTimeSeconds,
          throughputPerHour,
        });
      }

      return stats;
    },
  }),

  participantSplits: t.field({
    type: [SplitTimeType],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db }) => {
      const events = await db.timingEvent.findMany({
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
          deleted: false,
        },
        include: {
          checkpoint: true,
        },
        orderBy: [
          { checkpoint: { orderIndex: 'asc' } },
          { timeMs: 'asc' },
        ],
      });

      return events.map(event => ({
        checkpointId: event.checkpointId || '',
        checkpointName: event.checkpoint?.name || null,
        timeMs: event.timeMs,
        elapsedMs: event.elapsedMs,
        orderIndex: event.checkpoint?.orderIndex || 0,
      }));
    },
  }),

  paceAnalysis: t.field({
    type: ['String'],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db }) => {
      const results = await db.resultCache.findMany({
        where: {
          raceId: args.raceId,
          chipTimeMs: { not: null },
          category: { not: 'DQ' },
        },
        orderBy: { chipTimeMs: 'asc' },
      });

      // Group into pace buckets (10-minute intervals)
      const buckets: { [key: string]: number } = {};

      for (const result of results) {
        if (result.chipTimeMs) {
          const minutes = Math.floor(Number(result.chipTimeMs) / 60000);
          const bucket = Math.floor(minutes / 10) * 10;
          const bucketKey = `${bucket}-${bucket + 10} min`;
          buckets[bucketKey] = (buckets[bucketKey] || 0) + 1;
        }
      }

      return Object.entries(buckets).map(([key, count]) => `${key}: ${count} finishers`);
    },
  }),
}));
