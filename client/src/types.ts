export type LunchCategory = 'main' | 'snack' | 'fruit' | 'drink' | 'treat'

export type LunchIdea = {
  name: string
  category: LunchCategory
  prepTimeMinutes: number
  notes: string
  nutFree: boolean
}

export type SavedLunchIdea = LunchIdea & { id: number }

export type CreateLunchIdeaInput = LunchIdea
