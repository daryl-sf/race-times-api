import { builder } from "@/schema/builder";

export const ParticipantApi = builder.prismaNode('Participant', {
  id: { field: 'id' },
  fields: (t) => ({
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    fullName: t.string({
      description: "Full name - first and last name joined",
      resolve: ({ firstName, lastName }) => `${firstName} ${lastName}`
    }),
    gender: t.exposeString('gender', { nullable: true }),
    birthYear: t.exposeInt('birthYear', { nullable: true }),
    country: t.exposeString('country', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    race: t.relation('race'),
    registrations: t.relation('registrations'),
    timingEvents: t.relation('timingEvents'),
    resultCache: t.relation('resultCache'),
  }),
});
