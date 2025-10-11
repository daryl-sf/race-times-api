import { builder } from "@/schema/builder";
import { ResultCacheApi } from "@/schema/objects";
import { logUpdate } from "@/lib/audit";

builder.mutationField("adjustParticipantTime", (t) =>
  t.prismaField({
    type: ResultCacheApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
      adjustmentMs: t.arg({ type: 'BigInt', required: true }),
      reason: t.arg.string({ required: true }),
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
        throw new Error("Not authorized to adjust times for this race");
      }

      // Get existing result
      const existingResult = await db.resultCache.findFirst({
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
        },
      });

      if (!existingResult) {
        throw new Error("Result not found for this participant");
      }

      // Apply adjustment
      const newChipTime = existingResult.chipTimeMs ? existingResult.chipTimeMs + args.adjustmentMs : null;
      const newNetTime = existingResult.netTimeMs ? existingResult.netTimeMs + args.adjustmentMs : null;

      // Log the adjustment
      await logUpdate(
        db,
        args.raceId,
        'ResultCache',
        existingResult.id,
        { chipTimeMs: existingResult.chipTimeMs, netTimeMs: existingResult.netTimeMs },
        { chipTimeMs: newChipTime, netTimeMs: newNetTime },
        currentUser?.id,
        args.reason
      );

      return db.resultCache.update({
        ...query,
        where: { id: existingResult.id },
        data: {
          chipTimeMs: newChipTime,
          netTimeMs: newNetTime,
          updatedAt: new Date(),
        },
      });
    },
  })
);

builder.mutationField("disqualifyParticipant", (t) =>
  t.prismaField({
    type: ResultCacheApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
      reason: t.arg.string({ required: true }),
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
        throw new Error("Not authorized to disqualify participants for this race");
      }

      // Get existing result
      const existingResult = await db.resultCache.findFirst({
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
        },
      });

      if (!existingResult) {
        throw new Error("Result not found for this participant");
      }

      // Log the DQ
      await logUpdate(
        db,
        args.raceId,
        'ResultCache',
        existingResult.id,
        { category: existingResult.category, place: existingResult.place },
        { category: 'DQ', place: null },
        currentUser?.id,
        `DISQUALIFIED: ${args.reason}`
      );

      // Set category to DQ and remove place
      return db.resultCache.update({
        ...query,
        where: { id: existingResult.id },
        data: {
          category: 'DQ',
          place: null,
          updatedAt: new Date(),
        },
      });
    },
  })
);

builder.mutationField("reinstateParticipant", (t) =>
  t.prismaField({
    type: ResultCacheApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
      category: t.arg.string(),
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
        throw new Error("Not authorized to reinstate participants for this race");
      }

      // Get existing result
      const existingResult = await db.resultCache.findFirst({
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
        },
      });

      if (!existingResult) {
        throw new Error("Result not found for this participant");
      }

      if (existingResult.category !== 'DQ') {
        throw new Error("Participant is not disqualified");
      }

      // Log the reinstatement
      await logUpdate(
        db,
        args.raceId,
        'ResultCache',
        existingResult.id,
        { category: 'DQ', place: null },
        { category: args.category || 'Open', place: null },
        currentUser?.id,
        'Participant reinstated'
      );

      // Reinstate
      return db.resultCache.update({
        ...query,
        where: { id: existingResult.id },
        data: {
          category: args.category || 'Open',
          updatedAt: new Date(),
        },
      });
    },
  })
);

builder.mutationField("addTimePenalty", (t) =>
  t.prismaField({
    type: ResultCacheApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
      penaltySeconds: t.arg.int({ required: true }),
      reason: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      const penaltyMs = BigInt(args.penaltySeconds * 1000);

      // Verify race belongs to user's organization
      const race = await db.race.findUnique({
        where: { id: args.raceId },
        select: { organizationId: true },
      });

      if (!race) {
        throw new Error("Race not found");
      }

      if (race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to add penalties for this race");
      }

      // Get existing result
      const existingResult = await db.resultCache.findFirst({
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
        },
      });

      if (!existingResult) {
        throw new Error("Result not found for this participant");
      }

      // Add penalty
      const newChipTime = existingResult.chipTimeMs ? existingResult.chipTimeMs + penaltyMs : null;
      const newNetTime = existingResult.netTimeMs ? existingResult.netTimeMs + penaltyMs : null;

      // Log the penalty
      await logUpdate(
        db,
        args.raceId,
        'ResultCache',
        existingResult.id,
        { chipTimeMs: existingResult.chipTimeMs, netTimeMs: existingResult.netTimeMs },
        { chipTimeMs: newChipTime, netTimeMs: newNetTime },
        currentUser?.id,
        `PENALTY ${args.penaltySeconds}s: ${args.reason}`
      );

      return db.resultCache.update({
        ...query,
        where: { id: existingResult.id },
        data: {
          chipTimeMs: newChipTime,
          netTimeMs: newNetTime,
          updatedAt: new Date(),
        },
      });
    },
  })
);
