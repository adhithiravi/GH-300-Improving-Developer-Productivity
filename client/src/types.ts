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

export type PantryCategory = 'produce' | 'protein' | 'grain' | 'dairy' | 'condiment'

export type PantryItem = {
  id: number
  name: string
  category: PantryCategory
  quantity: string
  nutFree: boolean
  lowStock: boolean
}

export type CreatePantryItemInput = Omit<PantryItem, 'id' | 'lowStock'>

export type PantryRecipe = {
  id: number
  name: string
  ingredients: string[]
  notes: string
  category: LunchCategory
  prepTimeMinutes: number
}

export type RecipeIdea = PantryRecipe & { nutFree: boolean }
