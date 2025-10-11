import { builder } from "@/schema/builder";

export const RegistrationApi = builder.prismaNode('Registration', {
  id: { field: 'id' },
  fields: (t) => ({
    bib: t.exposeString('bib'),
    seededPosition: t.exposeInt('seededPosition', { nullable: true }),
    externalId: t.exposeString('externalId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    participant: t.relation('participant'),
    wave: t.relation('wave', { nullable: true }),
    timingEvents: t.relation('timingEvents'),
    resultCache: t.relation('resultCache'),
  }),
});
