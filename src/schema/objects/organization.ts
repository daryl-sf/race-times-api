import { builder } from "@/schema/builder";

export const OrganizationApi = builder.prismaNode('Organization', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    timezone: t.exposeString('timezone'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    races: t.relation('races'),
    users: t.relation('users'),
  }),
});
