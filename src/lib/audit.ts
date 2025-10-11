import { PrismaClient, AuditAction } from "@prisma/client";

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  db: PrismaClient,
  params: {
    raceId: string;
    entityType: string;
    entityId?: string | null;
    action: AuditAction;
    userId?: string | null;
    before?: any;
    after?: any;
    reason?: string | null;
  }
) {
  return db.auditLog.create({
    data: {
      raceId: params.raceId,
      entityType: params.entityType,
      entityId: params.entityId || null,
      action: params.action,
      userId: params.userId || null,
      before: params.before || null,
      after: params.after || null,
      reason: params.reason || null,
      ts: new Date(),
    },
  });
}

/**
 * Helper to log an UPDATE action
 */
export async function logUpdate(
  db: PrismaClient,
  raceId: string,
  entityType: string,
  entityId: string,
  before: any,
  after: any,
  userId?: string | null,
  reason?: string | null
) {
  return createAuditLog(db, {
    raceId,
    entityType,
    entityId,
    action: 'UPDATE',
    userId,
    before,
    after,
    reason,
  });
}

/**
 * Helper to log a DELETE action
 */
export async function logDelete(
  db: PrismaClient,
  raceId: string,
  entityType: string,
  entityId: string,
  before: any,
  userId?: string | null,
  reason?: string | null
) {
  return createAuditLog(db, {
    raceId,
    entityType,
    entityId,
    action: 'DELETE',
    userId,
    before,
    reason,
  });
}

/**
 * Helper to log an UNDO action
 */
export async function logUndo(
  db: PrismaClient,
  raceId: string,
  entityType: string,
  entityId: string,
  after: any,
  userId?: string | null,
  reason?: string | null
) {
  return createAuditLog(db, {
    raceId,
    entityType,
    entityId,
    action: 'UNDO',
    userId,
    after,
    reason,
  });
}

/**
 * Get audit history for a specific entity
 */
export async function getEntityHistory(
  db: PrismaClient,
  entityType: string,
  entityId: string
) {
  return db.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { ts: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}
