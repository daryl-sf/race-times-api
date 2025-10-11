import { builder } from "@/schema/builder";
import { ParticipantApi, RegistrationApi } from "@/schema/objects";
import { z } from "zod";

builder.mutationField("createParticipant", (t) =>
  t.prismaField({
    type: ParticipantApi,
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      firstName: t.arg.string({ required: true, validate: z.string().min(1).max(100) }),
      lastName: t.arg.string({ required: true, validate: z.string().min(1).max(100) }),
      gender: t.arg.string({ validate: z.string().max(50) }),
      birthYear: t.arg.int({ validate: z.number().min(1900).max(new Date().getFullYear()) }),
      country: t.arg.string({ validate: z.string().max(100) }),
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
        throw new Error("Not authorized to create participants for this race");
      }

      return db.participant.create({
        ...query,
        data: {
          raceId: args.raceId,
          firstName: args.firstName,
          lastName: args.lastName,
          gender: args.gender || null,
          birthYear: args.birthYear || null,
          country: args.country || null,
        },
      });
    },
  })
);

builder.mutationField("updateParticipant", (t) =>
  t.prismaField({
    type: ParticipantApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      firstName: t.arg.string({ validate: z.string().min(1).max(100) }),
      lastName: t.arg.string({ validate: z.string().min(1).max(100) }),
      gender: t.arg.string({ validate: z.string().max(50) }),
      birthYear: t.arg.int({ validate: z.number().min(1900).max(new Date().getFullYear()) }),
      country: t.arg.string({ validate: z.string().max(100) }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify participant's race belongs to user's organization
      const participant = await db.participant.findUnique({
        where: { id: args.id },
        include: { race: { select: { organizationId: true } } },
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      if (participant.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to update this participant");
      }

      const updateData: any = {};
      if (args.firstName !== undefined) updateData.firstName = args.firstName;
      if (args.lastName !== undefined) updateData.lastName = args.lastName;
      if (args.gender !== undefined) updateData.gender = args.gender;
      if (args.birthYear !== undefined) updateData.birthYear = args.birthYear;
      if (args.country !== undefined) updateData.country = args.country;

      return db.participant.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

builder.mutationField("createRegistration", (t) =>
  t.prismaField({
    type: RegistrationApi,
    authScopes: { isAuthenticated: true },
    args: {
      participantId: t.arg.string({ required: true }),
      bib: t.arg.string({ required: true, validate: z.string().min(1).max(50) }),
      waveId: t.arg.string(),
      seededPosition: t.arg.int(),
      externalId: t.arg.string({ validate: z.string().max(100) }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify participant's race belongs to user's organization
      const participant = await db.participant.findUnique({
        where: { id: args.participantId },
        include: { race: { select: { organizationId: true } } },
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      if (participant.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to create registration for this participant");
      }

      // Check if bib number is already taken for this participant
      const existingReg = await db.registration.findFirst({
        where: {
          participantId: args.participantId,
          bib: args.bib,
        },
      });

      if (existingReg) {
        throw new Error("This bib number is already assigned to this participant");
      }

      return db.registration.create({
        ...query,
        data: {
          participantId: args.participantId,
          bib: args.bib,
          waveId: args.waveId || null,
          seededPosition: args.seededPosition || null,
          externalId: args.externalId || null,
        },
      });
    },
  })
);

builder.mutationField("updateRegistration", (t) =>
  t.prismaField({
    type: RegistrationApi,
    authScopes: { isAuthenticated: true },
    args: {
      id: t.arg.string({ required: true }),
      bib: t.arg.string({ validate: z.string().min(1).max(50) }),
      waveId: t.arg.string(),
      seededPosition: t.arg.int(),
      externalId: t.arg.string({ validate: z.string().max(100) }),
    },
    resolve: async (query, _root, args, { db, currentUser }) => {
      // Verify registration's participant's race belongs to user's organization
      const registration = await db.registration.findUnique({
        where: { id: args.id },
        include: {
          participant: {
            include: { race: { select: { organizationId: true } } },
          },
        },
      });

      if (!registration) {
        throw new Error("Registration not found");
      }

      if (registration.participant.race.organizationId !== currentUser?.organizationId) {
        throw new Error("Not authorized to update this registration");
      }

      const updateData: any = {};
      if (args.bib !== undefined) updateData.bib = args.bib;
      if (args.waveId !== undefined) updateData.waveId = args.waveId;
      if (args.seededPosition !== undefined) updateData.seededPosition = args.seededPosition;
      if (args.externalId !== undefined) updateData.externalId = args.externalId;

      return db.registration.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);
