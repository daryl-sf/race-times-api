import { builder } from "@/schema/builder";
import { CheckpointApi } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("createCheckpoint", (t) =>
  t.prismaField({
    type: CheckpointApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      code: t.arg.string({ required: true, validate: z.string().min(1).max(50) }),
      name: t.arg.string({ validate: z.string().max(200) }),
      positionMeters: t.arg.int(),
      isStart: t.arg.boolean({ defaultValue: false }),
      isFinish: t.arg.boolean({ defaultValue: false }),
      orderIndex: t.arg.int({ required: true }),
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
        throw new Error("Not authorized to create checkpoints for this race");
      }

      return db.checkpoint.create({
        ...query,
        data: {
          raceId: args.raceId,
          code: args.code,
          name: args.name || null,
          positionMeters: args.positionMeters || null,
          isStart: args.isStart || false,
          isFinish: args.isFinish || false,
          orderIndex: args.orderIndex,
        },
      });
    },
  })
);

builder.mutationField("updateCheckpoint", (t) =>
  t.prismaField({
    type: CheckpointApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      code: t.arg.string({ validate: z.string().min(1).max(50) }),
      name: t.arg.string({ validate: z.string().max(200) }),
      positionMeters: t.arg.int(),
      isStart: t.arg.boolean(),
      isFinish: t.arg.boolean(),
      orderIndex: t.arg.int(),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify checkpoint's race belongs to user's organization
      const checkpoint = await db.checkpoint.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!checkpoint) {
        throw new Error("Checkpoint not found");
      }

      if (checkpoint.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to update this checkpoint");
      }

      const updateData: any = {};
      if (args.code !== undefined) updateData.code = args.code;
      if (args.name !== undefined) updateData.name = args.name;
      if (args.positionMeters !== undefined) updateData.positionMeters = args.positionMeters;
      if (args.isStart !== undefined) updateData.isStart = args.isStart;
      if (args.isFinish !== undefined) updateData.isFinish = args.isFinish;
      if (args.orderIndex !== undefined) updateData.orderIndex = args.orderIndex;

      return db.checkpoint.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

builder.mutationField("deleteCheckpoint", (t) =>
  t.field({
    type: 'Boolean',
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db, currentUser }) => {
      // Verify checkpoint's race belongs to user's organization
      const checkpoint = await db.checkpoint.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!checkpoint) {
        throw new Error("Checkpoint not found");
      }

      if (checkpoint.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to delete this checkpoint");
      }

      await db.checkpoint.delete({
        where: { id: args.id },
      });

      return true;
    },
  })
);
