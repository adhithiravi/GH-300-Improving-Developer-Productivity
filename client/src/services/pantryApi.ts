import { CreatePantryItemInput, PantryItem, RecipeIdea } from '../types'
import { apiRequest, jsonRequestInit } from './apiClient'

export async function getPantryItems(): Promise<PantryItem[]> {
  const payload = await apiRequest<{ data: PantryItem[] }>('/api/pantry')
  return payload.data
}

export async function createPantryItems(items: CreatePantryItemInput[]): Promise<PantryItem[]> {
  const payload = await apiRequest<{ data: PantryItem[] }>(
    '/api/pantry',
    jsonRequestInit('POST', { items }),
  )
  return payload.data
}

export async function setPantryItemLowStock(id: number, lowStock: boolean): Promise<PantryItem> {
  const payload = await apiRequest<{ data: PantryItem }>(
    `/api/pantry/${id}`,
    jsonRequestInit('PATCH', { lowStock }),
  )
  return payload.data
}

export async function getPantryRecipes(): Promise<RecipeIdea[]> {
  const payload = await apiRequest<{ data: RecipeIdea[] }>('/api/pantry/recipes')
  return payload.data
}

export async function getRecipeIdeas(): Promise<RecipeIdea[]> {
  const payload = await apiRequest<{ data: RecipeIdea[] }>('/api/pantry/recipe-ideas')
  return payload.data
}
