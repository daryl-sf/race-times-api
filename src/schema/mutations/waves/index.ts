import { builder } from "@/schema/builder";
import { WaveApi } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("createWave", (t) =>
  t.prismaField({
    type: WaveApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      name: t.arg.string({ validate: z.string().max(200) }),
      scheduledStart: t.arg({ type: 'DateTime' }),
      position: t.arg.int(),
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
        throw new Error("Not authorized to create waves for this race");
      }

      return db.wave.create({
        ...query,
        data: {
          raceId: args.raceId,
          name: args.name || null,
          scheduledStart: args.scheduledStart || null,
          position: args.position || null,
        },
      });
    },
  })
);

builder.mutationField("updateWave", (t) =>
  t.prismaField({
    type: WaveApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string({ validate: z.string().max(200) }),
      scheduledStart: t.arg({ type: 'DateTime' }),
      position: t.arg.int(),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify wave's race belongs to user's organization
      const wave = await db.wave.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!wave) {
        throw new Error("Wave not found");
      }

      if (wave.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to update this wave");
      }

      const updateData: any = {};
      if (args.name !== undefined) updateData.name = args.name;
      if (args.scheduledStart !== undefined) updateData.scheduledStart = args.scheduledStart;
      if (args.position !== undefined) updateData.position = args.position;

      return db.wave.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

builder.mutationField("deleteWave", (t) =>
  t.field({
    type: 'Boolean',
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db, currentUser }) => {
      // Verify wave's race belongs to user's organization
      const wave = await db.wave.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!wave) {
        throw new Error("Wave not found");
      }

      if (wave.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to delete this wave");
      }

      await db.wave.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);

builder.mutationField("reorderWaves", (t) =>
  t.field({
    type: 'Boolean',
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      waveIds: t.arg.stringList({ required: true }),
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
        throw new Error("Not authorized to reorder waves for this race");
      }

      // Update position for each wave based on array order
      for (let i = 0; i < args.waveIds.length; i++) {
        await db.wave.update({
          where: { id: args.waveIds[i] },
          data: { position: i + 1 },
        });
      }

      return true;
    },
  })
);
