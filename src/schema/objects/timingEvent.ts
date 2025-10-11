import { builder } from "@/schema/builder";

export const TimingEventApi = builder.prismaNode('TimingEvent', {
  id: { field: 'id' },
  fields: (t) => ({
    raceId: t.exposeString('raceId'),
    checkpointId: t.exposeString('checkpointId', { nullable: true }),
    participantId: t.exposeString('participantId'),
    registrationId: t.exposeString('registrationId', { nullable: true }),
    timingSessionId: t.exposeString('timingSessionId', { nullable: true }),
    serverTs: t.expose('serverTs', { type: 'DateTime' }),
    deviceTs: t.expose('deviceTs', { type: 'DateTime', nullable: true }),
    timeMs: t.expose('timeMs', { type: 'BigInt' }),
    elapsedMs: t.expose('elapsedMs', { type: 'BigInt', nullable: true }),
    source: t.exposeString('source', { nullable: true }),
    qualifier: t.exposeString('qualifier', { nullable: true }),
    sequence: t.expose('sequence', { type: 'BigInt' }),
    createdById: t.exposeString('createdById', { nullable: true }),
    deleted: t.exposeBoolean('deleted'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    race: t.relation('race'),
    checkpoint: t.relation('checkpoint', { nullable: true }),
    participant: t.relation('participant'),
    registration: t.relation('registration', { nullable: true }),
    timingSession: t.relation('timingSession', { nullable: true }),
    createdBy: t.relation('createdBy', { nullable: true }),
  }),
});

export const TimingEventInput = builder.inputType('TimingEventInput', {
  fields: (t) => ({
    raceId: t.string({ required: true }),
    checkpointId: t.string(),
    participantId: t.string({ required: true }),
    registrationId: t.string(),
    deviceTs: t.field({ type: 'DateTime' }),
    timeMs: t.field({ type: 'BigInt', required: true }),
    source: t.string(),
    qualifier: t.string(),
    createdById: t.string(),
  }),
});
