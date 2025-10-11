import { builder } from "@/schema/builder";
import { TimingEventApi } from "@/schema/objects";
import {
  calculateElapsedTime,
  getNextSequence,
  validateCheckpointForRace,
  validateParticipantForRace
} from "@/lib/timing";
import { z } from "zod";

builder.mutationField("recordTimingEvent", (t) =>
  t.prismaField({
    type: TimingEventApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
      checkpointId: t.arg.string({ required: true }),
      registrationId: t.arg.string(),
      timingSessionId: t.arg.string(),
      timeMs: t.arg({ type: 'BigInt', required: true }),
      deviceTs: t.arg({ type: 'DateTime' }),
      source: t.arg.string({ validate: z.string().max(100) }),
      qualifier: t.arg.string({ validate: z.string().max(50) }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify race belongs to user's organization
      const race = await db.race.findUnique({
        where: { id: args.raceId },
        select: { organizationId: true },
      });

      if (!race) {
        throw new Error("Race not found");
      }

      if (race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to record timing events for this race");
      }

      // Validate checkpoint belongs to race
      const isValidCheckpoint = await validateCheckpointForRace(
        db,
        args.checkpointId,
        args.raceId
      );
      if (!isValidCheckpoint) {
        throw new Error("Checkpoint does not belong to this race");
      }

      // Validate participant belongs to race
      const isValidParticipant = await validateParticipantForRace(
        db,
        args.participantId,
        args.raceId
      );
      if (!isValidParticipant) {
        throw new Error("Participant is not registered for this race");
      }

      // Calculate elapsed time
      const elapsedMs = await calculateElapsedTime(
        db,
        args.raceId,
        args.participantId,
        args.checkpointId,
        args.timeMs
      );

      // Get next sequence number
      const sequence = await getNextSequence(db, args.raceId);

      // Create timing event
      return db.timingEvent.create({
        ...query,
        data: {
          raceId: args.raceId,
          participantId: args.participantId,
          checkpointId: args.checkpointId,
          registrationId: args.registrationId || null,
          timingSessionId: args.timingSessionId || null,
          timeMs: args.timeMs,
          deviceTs: args.deviceTs || null,
          elapsedMs,
          source: args.source || null,
          qualifier: args.qualifier || null,
          sequence,
          createdById: currentUser?.id || null,
        },
      });
    },
  })
);

// Input type for bulk timing events
const BulkTimingEventInput = builder.inputType('BulkTimingEventInput', {
  fields: (t) => ({
    participantId: t.string({ required: true }),
    checkpointId: t.string({ required: true }),
    registrationId: t.string(),
    timeMs: t.field({ type: 'BigInt', required: true }),
    deviceTs: t.field({ type: 'DateTime' }),
    source: t.string(),
    qualifier: t.string(),
  }),
});

builder.mutationField("recordBulkTimingEvents", (t) =>
  t.field({
    type: [TimingEventApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      timingSessionId: t.arg.string(),
      events: t.arg({ type: [BulkTimingEventInput], required: true }),
    },
    resolve: async (_root, args, { db, currentUser }) => {
      // Verify race belongs to user's organization
      const race = await db.race.findUnique({
        where: { id: args.raceId },
        select: { organizationId: true },
      });

      if (!race) {
        throw new Error("Race not found");
      }

      if (race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to record timing events for this race");
      }

      // Get starting sequence number
      let sequence = await getNextSequence(db, args.raceId);

      // Prepare timing events
      const timingEventsToCreate = [];

      for (const event of args.events) {
        // Validate checkpoint
        const isValidCheckpoint = await validateCheckpointForRace(
          db,
          event.checkpointId,
          args.raceId
        );
        if (!isValidCheckpoint) {
          throw new Error(`Checkpoint ${event.checkpointId} does not belong to this race`);
        }

        // Validate participant
        const isValidParticipant = await validateParticipantForRace(
          db,
          event.participantId,
          args.raceId
        );
        if (!isValidParticipant) {
          throw new Error(`Participant ${event.participantId} is not registered for this race`);
        }

        // Calculate elapsed time
        const elapsedMs = await calculateElapsedTime(
          db,
          args.raceId,
          event.participantId,
          event.checkpointId,
          event.timeMs
        );

        timingEventsToCreate.push({
          raceId: args.raceId,
          participantId: event.participantId,
          checkpointId: event.checkpointId,
          registrationId: event.registrationId || null,
          timingSessionId: args.timingSessionId || null,
          timeMs: event.timeMs,
          deviceTs: event.deviceTs || null,
          elapsedMs,
          source: event.source || null,
          qualifier: event.qualifier || null,
          sequence,
          createdById: currentUser?.id || null,
        });

        sequence++;
      }

      // Bulk create all timing events
      await db.timingEvent.createMany({
        data: timingEventsToCreate,
      });

      // Fetch and return created events
      const createdEvents = await db.timingEvent.findMany({
        where: {
          raceId: args.raceId,
          sequence: {
            gte: await getNextSequence(db, args.raceId) - BigInt(timingEventsToCreate.length),
          },
        },
        orderBy: { sequence: 'asc' },
      });

      return createdEvents;
    },
  })
);

builder.mutationField("updateTimingEvent", (t) =>
  t.prismaField({
    type: TimingEventApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      timeMs: t.arg({ type: 'BigInt' }),
      deviceTs: t.arg({ type: 'DateTime' }),
      source: t.arg.string({ validate: z.string().max(100) }),
      qualifier: t.arg.string({ validate: z.string().max(50) }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Get existing timing event
      const existingEvent = await db.timingEvent.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!existingEvent) {
        throw new Error("Timing event not found");
      }

      if (existingEvent.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to update this timing event");
      }

      const updateData: any = {};
      if (args.deviceTs !== undefined) updateData.deviceTs = args.deviceTs;
      if (args.source !== undefined) updateData.source = args.source;
      if (args.qualifier !== undefined) updateData.qualifier = args.qualifier;

      // If timeMs changed, recalculate elapsed time
      if (args.timeMs !== undefined && args.timeMs !== null) {
        updateData.timeMs = args.timeMs;
        if (existingEvent.checkpointId) {
          const elapsedMs = await calculateElapsedTime(
            db,
            existingEvent.raceId,
            existingEvent.participantId,
            existingEvent.checkpointId,
            args.timeMs as bigint
          );
          updateData.elapsedMs = elapsedMs;
        }
      }

      return db.timingEvent.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

builder.mutationField("deleteTimingEvent", (t) =>
  t.prismaField({
    type: TimingEventApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Get existing timing event
      const existingEvent = await db.timingEvent.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!existingEvent) {
        throw new Error("Timing event not found");
      }

      if (existingEvent.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to delete this timing event");
      }

      // Soft delete
      return db.timingEvent.update({
        ...query,
        where: { id: args.id },
        data: { deleted: true },
      });
    },
  })
);

builder.mutationField("undoTimingEventDeletion", (t) =>
  t.prismaField({
    type: TimingEventApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Get existing timing event
      const existingEvent = await db.timingEvent.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!existingEvent) {
        throw new Error("Timing event not found");
      }

      if (existingEvent.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to restore this timing event");
      }

      if (!existingEvent.deleted) {
        throw new Error("Timing event is not deleted");
      }

      // Restore
      return db.timingEvent.update({
        ...query,
        where: { id: args.id },
        data: { deleted: false },
      });
    },
  })
);

builder.mutationField("recalculateTimes", (t) =>
  t.field({
    type: 'Int',
    description: 'Recalculate elapsed times for all timing events of a participant. Returns count of updated events.',
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db, currentUser }) => {
      // Verify race belongs to user's organization
      const race = await db.race.findUnique({
        where: { id: args.raceId },
        select: { organizationId: true },
      });

      if (!race) {
        throw new Error("Race not found");
      }

      if (race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to recalculate times for this race");
      }

      // Get all timing events for this participant
      const events = await db.timingEvent.findMany({
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
          deleted: false,
        },
        orderBy: { timeMs: 'asc' },
      });

      let updateCount = 0;

      // Recalculate elapsed time for each event
      for (const event of events) {
        if (event.checkpointId) {
          const elapsedMs = await calculateElapsedTime(
            db,
            args.raceId,
            args.participantId,
            event.checkpointId,
            event.timeMs
          );

          await db.timingEvent.update({
            where: { id: event.id },
            data: { elapsedMs },
          });

          updateCount++;
        }
      }

      return updateCount;
    },
  })
);
