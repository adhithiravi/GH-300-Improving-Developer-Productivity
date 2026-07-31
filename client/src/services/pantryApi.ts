import { CreatePantryItemInput, PantryItem, RecipeIdea } from '../types'

type ApiValidationError = {
  error: string
  details?: Record<string, string>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050'

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiValidationError
    if (payload.details) {
      const details = Object.values(payload.details).join(', ')
      if (details) {
        return details
      }
    }
    return payload.error || `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

export async function getPantryItems(): Promise<PantryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/pantry`)
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: PantryItem[] }
  return payload.data
}

export async function createPantryItems(items: CreatePantryItemInput[]): Promise<PantryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/pantry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: PantryItem[] }
  return payload.data
}

export async function setPantryItemLowStock(id: number, lowStock: boolean): Promise<PantryItem> {
  const response = await fetch(`${API_BASE_URL}/api/pantry/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lowStock }),
  })

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: PantryItem }
  return payload.data
}

export async function getPantryRecipes(): Promise<RecipeIdea[]> {
  const response = await fetch(`${API_BASE_URL}/api/pantry/recipes`)
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: RecipeIdea[] }
  return payload.data
}

export async function getRecipeIdeas(): Promise<RecipeIdea[]> {
  const response = await fetch(`${API_BASE_URL}/api/pantry/recipe-ideas`)
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: RecipeIdea[] }
  return payload.data
}
