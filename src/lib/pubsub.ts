import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

// Event keys
export const TIMING_EVENT = (raceId: string) => `TIMING_EVENT_${raceId}`;
export const LEADERBOARD_UPDATE = (raceId: string) => `LEADERBOARD_UPDATE_${raceId}`;
