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

type UpdateLunchIdeaInput = CreateLunchIdeaInput

type ValidationErrors = Partial<Record<keyof Omit<LunchIdea, 'id'>, string>>

const VALID_CATEGORIES: LunchCategory[] = ['main', 'snack', 'fruit', 'drink', 'treat']

const MAX_NAME_LENGTH = 60
const MAX_NOTES_LENGTH = 300
const MAX_PREP_TIME_MINUTES = 240

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
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `name must be ${MAX_NAME_LENGTH} characters or fewer`
  }

  if (!isLunchCategory(input.category)) {
    errors.category = `category must be one of: ${VALID_CATEGORIES.join(', ')}`
  } else {
    category = input.category
  }

  const notes = typeof input.notes === 'string' ? input.notes.trim() : ''
  if (!notes) {
    errors.notes = 'notes is required'
  } else if (notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `notes must be ${MAX_NOTES_LENGTH} characters or fewer`
  }

  if (typeof input.nutFree !== 'boolean') {
    errors.nutFree = 'nutFree must be a boolean'
  } else {
    nutFree = input.nutFree
  }

  const prepTimeMinutes =
    typeof input.prepTimeMinutes === 'number' ? input.prepTimeMinutes : Number.NaN
  if (!Number.isFinite(prepTimeMinutes) || !Number.isInteger(prepTimeMinutes) || prepTimeMinutes <= 0) {
    errors.prepTimeMinutes = 'prepTimeMinutes must be a whole number greater than 0'
  } else if (prepTimeMinutes > MAX_PREP_TIME_MINUTES) {
    errors.prepTimeMinutes = `prepTimeMinutes must be ${MAX_PREP_TIME_MINUTES} or fewer`
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

function parseLunchId(value: string | string[]): number | null {
  if (Array.isArray(value)) {
    return null
  }

  const id = Number(value)

  if (!Number.isInteger(id) || id <= 0) {
    return null
  }

  return id
}

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

lunchesRouter.delete('/:id', (req: Request, res: Response) => {
  const id = parseLunchId(req.params.id)

  if (id === null) {
    return res.status(400).json({
      error: 'Invalid request params',
      details: {
        id: 'id must be a positive integer',
      },
    })
  }

  const lunchIndex = lunchIdeas.findIndex((lunch) => lunch.id === id)

  if (lunchIndex === -1) {
    return res.status(404).json({
      error: 'Lunch idea not found',
    })
  }

  const [deletedLunch] = lunchIdeas.splice(lunchIndex, 1)

  return res.status(200).json({ data: deletedLunch })
})

lunchesRouter.put('/:id', (req: Request, res: Response) => {
  const id = parseLunchId(req.params.id)

  if (id === null) {
    return res.status(400).json({
      error: 'Invalid request params',
      details: {
        id: 'id must be a positive integer',
      },
    })
  }

  const lunchIndex = lunchIdeas.findIndex((lunch) => lunch.id === id)

  if (lunchIndex === -1) {
    return res.status(404).json({
      error: 'Lunch idea not found',
    })
  }

  const validation = validateLunchInput(req.body as UpdateLunchIdeaInput)

  if (!validation.value) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: validation.errors,
    })
  }

  const updatedLunch: LunchIdea = {
    id,
    ...validation.value,
  }

  lunchIdeas[lunchIndex] = updatedLunch

  return res.status(200).json({ data: updatedLunch })
})

export default lunchesRouter