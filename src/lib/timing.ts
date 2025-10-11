import { PrismaClient } from "@prisma/client";

/**
 * Calculate elapsed time from start checkpoint for a participant at a given checkpoint
 */
export async function calculateElapsedTime(
  db: PrismaClient,
  raceId: string,
  participantId: string,
  checkpointId: string,
  currentTimeMs: bigint
): Promise<bigint | null> {
  // Find the start checkpoint for this race
  const startCheckpoint = await db.checkpoint.findFirst({
    where: { raceId, isStart: true },
  });

  if (!startCheckpoint) {
    return null; // No start checkpoint defined
  }

  // If this is the start checkpoint, elapsed time is 0
  if (startCheckpoint.id === checkpointId) {
    return BigInt(0);
  }

  // Find the participant's start time
  const startEvent = await db.timingEvent.findFirst({
    where: {
      raceId,
      participantId,
      checkpointId: startCheckpoint.id,
      deleted: false,
    },
    orderBy: { timeMs: 'asc' }, // Take earliest start time
  });

  if (!startEvent) {
    return null; // Participant hasn't started yet
  }

  // Calculate elapsed time
  return currentTimeMs - startEvent.timeMs;
}

/**
 * Get the next sequence number for timing events in a race
 */
export async function getNextSequence(
  db: PrismaClient,
  raceId: string
): Promise<bigint> {
  const lastEvent = await db.timingEvent.findFirst({
    where: { raceId },
    orderBy: { sequence: 'desc' },
    select: { sequence: true },
  });

  if (!lastEvent) {
    return BigInt(1);
  }

  return lastEvent.sequence + BigInt(1);
}

/**
 * Validate that a checkpoint belongs to a race
 */
export async function validateCheckpointForRace(
  db: PrismaClient,
  checkpointId: string,
  raceId: string
): Promise<boolean> {
  const checkpoint = await db.checkpoint.findUnique({
    where: { id: checkpointId },
    select: { raceId: true },
  });

  return checkpoint?.raceId === raceId;
}

/**
 * Validate that a participant belongs to a race
 */
export async function validateParticipantForRace(
  db: PrismaClient,
  participantId: string,
  raceId: string
): Promise<boolean> {
  const participant = await db.participant.findUnique({
    where: { id: participantId },
    select: { raceId: true },
  });

  return participant?.raceId === raceId;
}
