import { builder } from "@/schema/builder";
import { refreshRaceResults } from "@/lib/results";

builder.mutationField("refreshResults", (t) =>
  t.field({
    type: 'Int',
    description: 'Refresh race results cache. Returns the number of results calculated.',
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
        throw new Error("Not authorized to refresh results for this race");
      }

      // Refresh results
      const count = await refreshRaceResults(db, args.raceId);
      return count;
    },
  })
);
