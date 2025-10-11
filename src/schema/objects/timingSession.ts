import { builder } from "@/schema/builder";

export const TimingSessionApi = builder.prismaNode('TimingSession', {
  id: { field: 'id' },
  fields: (t) => ({
    deviceId: t.exposeString('deviceId', { nullable: true }),
    startedAt: t.expose('startedAt', { type: 'DateTime' }),
    endedAt: t.expose('endedAt', { type: 'DateTime', nullable: true }),
    race: t.relation('race'),
    user: t.relation('user', { nullable: true }),
    timingEvents: t.relation('timingEvents'),
  }),
});
