import { builder, RaceTypeEnum } from "@/schema/builder";

export const RaceApi = builder.prismaNode('Race', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    description: t.exposeString('description', { nullable: true }),
    startDate: t.expose('startDate', { type: 'DateTime' }),
    timezone: t.exposeString('timezone'),
    raceType: t.expose('raceType', { type: RaceTypeEnum }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    organization: t.relation('organization'),
    waves: t.relation('waves'),
    participants: t.relation('participants'),
    checkpoints: t.relation('checkpoints'),
    timingSessions: t.relation('timingSessions'),
    timingEvents: t.relation('timingEvents'),
    resultCache: t.relation('resultCache'),
  }),
});
