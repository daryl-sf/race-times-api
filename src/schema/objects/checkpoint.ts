import { builder } from "@/schema/builder";

export const CheckpointApi = builder.prismaNode('Checkpoint', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    name: t.exposeString('name', { nullable: true }),
    positionMeters: t.exposeInt('positionMeters', { nullable: true }),
    isStart: t.exposeBoolean('isStart'),
    isFinish: t.exposeBoolean('isFinish'),
    orderIndex: t.exposeInt('orderIndex'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    race: t.relation('race'),
    timingEvents: t.relation('timingEvents'),
  }),
});
