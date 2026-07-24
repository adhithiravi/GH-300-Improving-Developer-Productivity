import { CreateLunchIdeaInput, SavedLunchIdea } from '../types'

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

export async function getLunchIdeas(): Promise<SavedLunchIdea[]> {
  const response = await fetch(`${API_BASE_URL}/api/lunches`)
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: SavedLunchIdea[] }
  return payload.data
}

export async function createLunchIdea(
  input: CreateLunchIdeaInput,
): Promise<SavedLunchIdea> {
  const response = await fetch(`${API_BASE_URL}/api/lunches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: SavedLunchIdea }
  return payload.data
}

export async function updateLunchIdea(
  id: number,
  input: CreateLunchIdeaInput,
): Promise<SavedLunchIdea> {
  const response = await fetch(`${API_BASE_URL}/api/lunches/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: SavedLunchIdea }
  return payload.data
}

export async function deleteLunchIdea(id: number): Promise<SavedLunchIdea> {
  const response = await fetch(`${API_BASE_URL}/api/lunches/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }

  const payload = (await response.json()) as { data: SavedLunchIdea }
  return payload.data
}