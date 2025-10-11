import { builder } from "@/schema/builder";
import { ResultCacheApi } from "@/schema/objects";
import { refreshRaceResults } from "@/lib/results";

builder.mutationField("setCategoryForParticipant", (t) =>
  t.prismaField({
    type: ResultCacheApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
      category: t.arg.string({ required: true }),
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
        throw new Error("Not authorized to set categories for this race");
      }

      // Update or create result cache entry with category
      const existingResult = await db.resultCache.findFirst({
        where: {
          raceId: args.raceId,
          participantId: args.participantId,
        },
      });

      if (existingResult) {
        return db.resultCache.update({
          ...query,
          where: { id: existingResult.id },
          data: { category: args.category },
        });
      } else {
        // Create placeholder result with category
        return db.resultCache.create({
          ...query,
          data: {
            raceId: args.raceId,
            participantId: args.participantId,
            registrationId: null,
            category: args.category,
            updatedAt: new Date(),
          },
        });
      }
    },
  })
);

builder.mutationField("recalculateCategoryResults", (t) =>
  t.field({
    type: 'Int',
    description: 'Recalculate places within a specific category. Returns count of updated results.',
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      category: t.arg.string({ required: true }),
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
        throw new Error("Not authorized to recalculate results for this race");
      }

      // Get all results in this category
      const categoryResults = await db.resultCache.findMany({
        where: {
          raceId: args.raceId,
          category: args.category,
          chipTimeMs: { not: null },
        },
        orderBy: { chipTimeMs: 'asc' },
      });

      // Update places within category
      let updateCount = 0;
      for (let i = 0; i < categoryResults.length; i++) {
        await db.resultCache.update({
          where: { id: categoryResults[i].id },
          data: { place: i + 1 },
        });
        updateCount++;
      }

      return updateCount;
    },
  })
);

builder.mutationField("assignCategoriesToAll", (t) =>
  t.field({
    type: 'Int',
    description: 'Auto-assign categories based on age/gender. Returns count of assigned participants.',
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
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
        throw new Error("Not authorized to assign categories for this race");
      }

      // Get all participants with results
      const results = await db.resultCache.findMany({
        where: { raceId: args.raceId },
        include: { participant: true },
      });

      const currentYear = new Date().getFullYear();
      let updateCount = 0;

      for (const result of results) {
        const participant = result.participant;
        let category = 'Open';

        // Calculate age-based category
        if (participant.birthYear && participant.gender) {
          const age = currentYear - participant.birthYear;
          const gender = participant.gender.toUpperCase();

          // Standard age group categories
          if (age < 18) {
            category = `${gender} U18`;
          } else if (age < 30) {
            category = `${gender} 18-29`;
          } else if (age < 40) {
            category = `${gender} 30-39`;
          } else if (age < 50) {
            category = `${gender} 40-49`;
          } else if (age < 60) {
            category = `${gender} 50-59`;
          } else {
            category = `${gender} 60+`;
          }
        }

        await db.resultCache.update({
          where: { id: result.id },
          data: { category },
        });
        updateCount++;
      }

      return updateCount;
    },
  })
);
