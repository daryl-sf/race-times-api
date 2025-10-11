import { PrismaClient } from "@prisma/client";

export interface ParticipantResult {
  participantId: string;
  registrationId: string | null;
  gunTimeMs: bigint | null;
  chipTimeMs: bigint | null;
  netTimeMs: bigint | null;
  place: number | null;
  category: string | null;
}

/**
 * Calculate results for a single participant
 */
export async function calculateParticipantResult(
  db: PrismaClient,
  raceId: string,
  participantId: string
): Promise<ParticipantResult | null> {
  // Get checkpoints
  const startCheckpoint = await db.checkpoint.findFirst({
    where: { raceId, isStart: true },
  });

  const finishCheckpoint = await db.checkpoint.findFirst({
    where: { raceId, isFinish: true },
  });

  if (!startCheckpoint || !finishCheckpoint) {
    return null; // Race doesn't have start/finish configured
  }

  // Get participant's registration
  const registration = await db.registration.findFirst({
    where: { participantId },
  });

  // Get start time (gun time)
  const startEvent = await db.timingEvent.findFirst({
    where: {
      raceId,
      participantId,
      checkpointId: startCheckpoint.id,
      deleted: false,
    },
    orderBy: { timeMs: 'asc' },
  });

  // Get finish time
  const finishEvent = await db.timingEvent.findFirst({
    where: {
      raceId,
      participantId,
      checkpointId: finishCheckpoint.id,
      deleted: false,
    },
    orderBy: { timeMs: 'asc' },
  });

  if (!finishEvent) {
    // Participant hasn't finished yet
    return {
      participantId,
      registrationId: registration?.id || null,
      gunTimeMs: null,
      chipTimeMs: null,
      netTimeMs: null,
      place: null,
      category: null,
    };
  }

  // Gun time: time from race start to finish (elapsed time)
  const gunTimeMs = finishEvent.elapsedMs;

  // Chip time: actual time between participant's start and finish
  const chipTimeMs = startEvent
    ? finishEvent.timeMs - startEvent.timeMs
    : finishEvent.elapsedMs;

  // Net time: for wave races, typically same as chip time
  const netTimeMs = chipTimeMs;

  return {
    participantId,
    registrationId: registration?.id || null,
    gunTimeMs,
    chipTimeMs,
    netTimeMs,
    place: null, // Will be calculated in ranking
    category: null,
  };
}

/**
 * Calculate results for all participants in a race and update ResultCache
 */
export async function refreshRaceResults(
  db: PrismaClient,
  raceId: string
): Promise<number> {
  // Get all participants
  const participants = await db.participant.findMany({
    where: { raceId },
  });

  const results: ParticipantResult[] = [];

  // Calculate individual results
  for (const participant of participants) {
    const result = await calculateParticipantResult(db, raceId, participant.id);
    if (result && result.chipTimeMs !== null) {
      results.push(result);
    }
  }

  // Sort by chip time and assign places
  results.sort((a, b) => {
    if (a.chipTimeMs === null) return 1;
    if (b.chipTimeMs === null) return -1;
    return Number(a.chipTimeMs - b.chipTimeMs);
  });

  // Assign places
  results.forEach((result, index) => {
    result.place = index + 1;
  });

  // Delete old results for this race
  await db.resultCache.deleteMany({
    where: { raceId },
  });

  // Insert new results
  const cacheEntries = results.map(result => ({
    raceId,
    participantId: result.participantId,
    registrationId: result.registrationId,
    gunTimeMs: result.gunTimeMs,
    chipTimeMs: result.chipTimeMs,
    netTimeMs: result.netTimeMs,
    place: result.place,
    category: result.category,
    updatedAt: new Date(),
  }));

  if (cacheEntries.length > 0) {
    await db.resultCache.createMany({
      data: cacheEntries,
    });
  }

  return cacheEntries.length;
}

/**
 * Get ranked results from cache (leaderboard)
 */
export async function getLeaderboard(
  db: PrismaClient,
  raceId: string,
  category?: string
) {
  const where: any = {
    raceId,
    chipTimeMs: { not: null },
  };

  if (category) {
    where.category = category;
  }

  return db.resultCache.findMany({
    where,
    include: {
      participant: true,
      registration: true,
    },
    orderBy: { place: 'asc' },
  });
}

/**
 * Format time in milliseconds to readable format (HH:MM:SS.mmm)
 */
export function formatTime(timeMs: bigint | null): string | null {
  if (timeMs === null) return null;

  const ms = Number(timeMs);
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}
