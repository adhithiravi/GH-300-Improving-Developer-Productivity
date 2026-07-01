import { Router, Request, Response } from 'express'

type LunchCategory = 'main' | 'snack' | 'fruit' | 'drink' | 'treat'

type LunchIdea = {
  id: number
  name: string
  category: LunchCategory
  notes: string
  nutFree: boolean
  prepTimeMinutes: number
}

type CreateLunchIdeaInput = {
  name?: unknown
  category?: unknown
  notes?: unknown
  nutFree?: unknown
  prepTimeMinutes?: unknown
}

type ValidationErrors = Partial<Record<keyof Omit<LunchIdea, 'id'>, string>>

const VALID_CATEGORIES: LunchCategory[] = ['main', 'snack', 'fruit', 'drink', 'treat']

const lunchIdeas: LunchIdea[] = []
let nextId = 1

function isLunchCategory(value: unknown): value is LunchCategory {
  return typeof value === 'string' && VALID_CATEGORIES.includes(value as LunchCategory)
}

function validateLunchInput(input: CreateLunchIdeaInput): {
  errors: ValidationErrors
  value?: Omit<LunchIdea, 'id'>
} {
  const errors: ValidationErrors = {}
  let category: LunchCategory | undefined
  let nutFree: boolean | undefined

  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (!name) {
    errors.name = 'name is required'
  }

  if (!isLunchCategory(input.category)) {
    errors.category = `category must be one of: ${VALID_CATEGORIES.join(', ')}`
  } else {
    category = input.category
  }

  const notes = typeof input.notes === 'string' ? input.notes.trim() : ''
  if (!notes) {
    errors.notes = 'notes is required'
  }

  if (typeof input.nutFree !== 'boolean') {
    errors.nutFree = 'nutFree must be a boolean'
  } else {
    nutFree = input.nutFree
  }

  const prepTimeMinutes =
    typeof input.prepTimeMinutes === 'number' ? input.prepTimeMinutes : Number.NaN
  if (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes <= 0) {
    errors.prepTimeMinutes = 'prepTimeMinutes must be a number greater than 0'
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  if (category === undefined || nutFree === undefined) {
    return {
      errors: {
        category: 'category is required',
        nutFree: 'nutFree is required',
      },
    }
  }

  return {
    errors,
    value: {
      name,
      category,
      notes,
      nutFree,
      prepTimeMinutes,
    },
  }
}

const lunchesRouter = Router()

lunchesRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ data: lunchIdeas })
})

lunchesRouter.post('/', (req: Request, res: Response) => {
  const validation = validateLunchInput(req.body as CreateLunchIdeaInput)

  if (!validation.value) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: validation.errors,
    })
  }

  const newLunch: LunchIdea = {
    id: nextId,
    ...validation.value,
  }

  nextId += 1
  lunchIdeas.unshift(newLunch)

  return res.status(201).json({ data: newLunch })
})

export default lunchesRouter