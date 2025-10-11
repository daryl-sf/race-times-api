import { builder } from "@/schema/builder";
import { ParticipantApi, RegistrationApi } from "../objects";

builder.queryFields((t) => ({
  participants: t.prismaField({
    type: [ParticipantApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.participant.findMany({
        ...query,
        where: { raceId: args.raceId },
        orderBy: { lastName: 'asc' },
      });
    },
  }),

  participant: t.prismaField({
    type: ParticipantApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.participant.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  }),

  searchParticipants: t.prismaField({
    type: [ParticipantApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      query: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      const searchTerm = args.query.toLowerCase();

      return db.participant.findMany({
        ...query,
        where: {
          raceId: args.raceId,
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        orderBy: { lastName: 'asc' },
        take: 50,
      });
    },
  }),

  registrationByBib: t.prismaField({
    type: RegistrationApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      raceId: t.arg.string({ required: true }),
      bib: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      // Find registration by bib for the given race
      const registration = await db.registration.findFirst({
        ...query,
        where: {
          bib: args.bib,
          participant: {
            raceId: args.raceId,
          },
        },
      });

      return registration;
    },
  }),
}));
