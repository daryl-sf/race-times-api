import { builder } from "@/schema/builder";
import { TimingSessionApi } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("startTimingSession", (t) =>
  t.prismaField({
    type: TimingSessionApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      deviceId: t.arg.string({ validate: z.string().max(200) }),
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
        throw new Error("Not authorized to start timing sessions for this race");
      }

      return db.timingSession.create({
        ...query,
        data: {
          raceId: args.raceId,
          deviceId: args.deviceId || null,
          userId: currentUser?.id || null,
          startedAt: new Date(),
        },
      });
    },
  })
);

builder.mutationField("endTimingSession", (t) =>
  t.prismaField({
    type: TimingSessionApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify session's race belongs to user's organization
      const session = await db.timingSession.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!session) {
        throw new Error("Timing session not found");
      }

      if (session.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to end this timing session");
      }

      if (session.endedAt) {
        throw new Error("Timing session already ended");
      }

      return db.timingSession.update({
        ...query,
        where: { id: args.id },
        data: { endedAt: new Date() },
      });
    },
  })
);

builder.mutationField("updateTimingSession", (t) =>
  t.prismaField({
    type: TimingSessionApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      deviceId: t.arg.string({ validate: z.string().max(200) }),
      metadata: t.arg.string(), // JSON string
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify session's race belongs to user's organization
      const session = await db.timingSession.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!session) {
        throw new Error("Timing session not found");
      }

      if (session.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to update this timing session");
      }

      const updateData: any = {};
      if (args.deviceId !== undefined) updateData.deviceId = args.deviceId;
      if (args.metadata !== undefined && args.metadata !== null) {
        try {
          updateData.metadata = JSON.parse(args.metadata);
        } catch (e) {
          throw new Error("Invalid JSON metadata");
        }
      }

      return db.timingSession.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);
