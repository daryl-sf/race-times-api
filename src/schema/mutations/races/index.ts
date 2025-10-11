import { builder, RaceTypeEnum } from "@/schema/builder";
import { RaceApi } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("createRace", (t) =>
  t.prismaField({
    type: RaceApi,
    authScopes: { isAuthenticated: true },
    args: {
      name: t.arg.string({ required: true, validate: z.string().min(1).max(200) }),
      description: t.arg.string({ validate: z.string().max(1000) }),
      startDate: t.arg({ type: 'DateTime', required: true }),
      timezone: t.arg.string({ required: true, validate: z.string().min(1) }),
      raceType: t.arg({ type: RaceTypeEnum, required: true }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      if (!currentUser?.organizationId) {
        throw new Error("User must belong to an organization to create races");
      }

      return db.race.create({
        ...query,
        data: {
          name: args.name,
          description: args.description || null,
          startDate: args.startDate,
          timezone: args.timezone,
          raceType: args.raceType,
          organizationId: currentUser.organizationId,
        },
      });
    },
  })
);

builder.mutationField("updateRace", (t) =>
  t.prismaField({
    type: RaceApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string({ validate: z.string().min(1).max(200) }),
      description: t.arg.string({ validate: z.string().max(1000) }),
      startDate: t.arg({ type: 'DateTime' }),
      timezone: t.arg.string({ validate: z.string().min(1) }),
      raceType: t.arg({ type: RaceTypeEnum }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify race belongs to user's organization
      const race = await db.race.findUnique({
        where: { id: args.id },
        select: { organizationId: true },
      });

      if (!race) {
        throw new Error("Race not found");
      }

      if (race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to update this race");
      }

      const updateData: any = {};
      if (args.name !== undefined) updateData.name = args.name;
      if (args.description !== undefined) updateData.description = args.description;
      if (args.startDate !== undefined) updateData.startDate = args.startDate;
      if (args.timezone !== undefined) updateData.timezone = args.timezone;
      if (args.raceType !== undefined) updateData.raceType = args.raceType;

      return db.race.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);
