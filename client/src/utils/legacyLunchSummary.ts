import type { LunchIdea } from '../types'

export function buildLunchSummaries(lunches: LunchIdea[]): string[] {
  return lunches.map(
    (lunch) => `${lunch.name} - ${lunch.category} - ${lunch.prepTimeMinutes} min`,
  )
}