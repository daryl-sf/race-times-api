import { builder } from "@/schema/builder";

export const WaveApi = builder.prismaNode('Wave', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name', { nullable: true }),
    scheduledStart: t.expose('scheduledStart', { type: 'DateTime', nullable: true }),
    position: t.exposeInt('position', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    race: t.relation('race'),
    registrations: t.relation('registrations'),
  }),
});
