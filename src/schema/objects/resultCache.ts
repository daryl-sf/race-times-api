import { builder } from "@/schema/builder";

export const ResultCacheApi = builder.prismaNode('ResultCache', {
  id: { field: 'id' },
  fields: (t) => ({
    gunTimeMs: t.expose('gunTimeMs', { type: 'BigInt', nullable: true }),
    chipTimeMs: t.expose('chipTimeMs', { type: 'BigInt', nullable: true }),
    netTimeMs: t.expose('netTimeMs', { type: 'BigInt', nullable: true }),
    place: t.exposeInt('place', { nullable: true }),
    category: t.exposeString('category', { nullable: true }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    race: t.relation('race'),
    participant: t.relation('participant'),
    registration: t.relation('registration', { nullable: true }),
  }),
});
