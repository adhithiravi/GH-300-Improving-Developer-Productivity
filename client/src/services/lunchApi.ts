import { CreateLunchIdeaInput, SavedLunchIdea } from '../types'
import { apiRequest, jsonRequestInit } from './apiClient'

/**
 * Fetches all saved lunch ideas from the lunches API.
 * @returns The `data` array from `GET /api/lunches`.
 * @throws Propagates any rejection from `apiRequest` for request or response failures.
 */
export async function getLunchIdeas(): Promise<SavedLunchIdea[]> {
  const payload = await apiRequest<{ data: SavedLunchIdea[] }>('/api/lunches')
  return payload.data
}

/**
 * Creates a new lunch idea.
 * @param input Request body sent as JSON.
 * @returns The created lunch idea from the `data` field of `POST /api/lunches`.
 * @throws Propagates any rejection from `apiRequest` for request or response failures.
 */
export async function createLunchIdea(
  input: CreateLunchIdeaInput,
): Promise<SavedLunchIdea> {
  const payload = await apiRequest<{ data: SavedLunchIdea }>(
    '/api/lunches',
    jsonRequestInit('POST', input),
  )
  return payload.data
}

/**
 * Replaces an existing lunch idea by id.
 * @param id Lunch idea id used in the `PUT /api/lunches/:id` path.
 * @param input Request body sent as JSON.
 * @returns The updated lunch idea from the response `data` field.
 * @throws Propagates any rejection from `apiRequest` for request or response failures.
 */
export async function updateLunchIdea(
  id: number,
  input: CreateLunchIdeaInput,
): Promise<SavedLunchIdea> {
  const payload = await apiRequest<{ data: SavedLunchIdea }>(
    `/api/lunches/${id}`,
    jsonRequestInit('PUT', input),
  )
  return payload.data
}

/**
 * Deletes a lunch idea by id.
 * @param id Lunch idea id used in the `DELETE /api/lunches/:id` path.
 * @returns The response `data` field returned by the delete operation.
 * @throws Propagates any rejection from `apiRequest` for request or response failures.
 */
export async function deleteLunchIdea(id: number): Promise<SavedLunchIdea> {
  const payload = await apiRequest<{ data: SavedLunchIdea }>(`/api/lunches/${id}`, {
    method: 'DELETE',
  })
  return payload.data
}