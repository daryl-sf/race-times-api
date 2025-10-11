import { builder } from "@/schema/builder";

// AuditAction enum
export const AuditActionEnum = builder.enumType('AuditAction', {
  values: ['CREATE', 'UPDATE', 'DELETE', 'UNDO'] as const,
});

export const AuditLogApi = builder.prismaNode('AuditLog', {
  id: { field: 'id' },
  fields: (t) => ({
    entityType: t.exposeString('entityType'),
    entityId: t.exposeString('entityId', { nullable: true }),
    action: t.expose('action', { type: AuditActionEnum }),
    ts: t.expose('ts', { type: 'DateTime' }),
    reason: t.exposeString('reason', { nullable: true }),
    race: t.relation('race'),
    user: t.relation('user', { nullable: true }),
    // JSON fields for before/after state
    beforeJson: t.string({
      nullable: true,
      resolve: (parent) => parent.before ? JSON.stringify(parent.before) : null,
    }),
    afterJson: t.string({
      nullable: true,
      resolve: (parent) => parent.after ? JSON.stringify(parent.after) : null,
    }),
  }),
});
