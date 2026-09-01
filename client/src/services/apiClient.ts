const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050'

type ApiValidationError = {
  error: string
  details?: Record<string, string>
}

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

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)
  if (!response.ok) {
    throw new Error(await parseErrorResponse(response))
  }
  return (await response.json()) as T
}

export function jsonRequestInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
}
