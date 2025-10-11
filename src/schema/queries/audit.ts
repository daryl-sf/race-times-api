import { builder } from "@/schema/builder";
import { AuditLogApi, AuditActionEnum } from "../objects/auditLog";
import { getEntityHistory } from "@/lib/audit";

builder.queryFields((t) => ({
  auditLogs: t.prismaField({
    type: [AuditLogApi],
    authScopes: { isAuthenticated: true },
    args: {
      raceId: t.arg.string({ required: true }),
      entityType: t.arg.string(),
      action: t.arg({ type: AuditActionEnum }),
      userId: t.arg.string(),
    },
    resolve: async (query, _root, args, { db }) => {
      const where: any = {
        raceId: args.raceId,
      };

      if (args.entityType) {
        where.entityType = args.entityType;
      }

      if (args.action) {
        where.action = args.action;
      }

      if (args.userId) {
        where.userId = args.userId;
      }

      return db.auditLog.findMany({
        ...query,
        where,
        orderBy: { ts: 'desc' },
      });
    },
  }),

  auditLog: t.prismaField({
    type: AuditLogApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, { db }) => {
      return db.auditLog.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  }),

  entityHistory: t.field({
    type: [AuditLogApi],
    authScopes: { isAuthenticated: true },
    args: {
      entityType: t.arg.string({ required: true }),
      entityId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, { db }) => {
      return getEntityHistory(db, args.entityType, args.entityId);
    },
  }),
}));
