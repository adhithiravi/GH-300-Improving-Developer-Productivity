import { Router, Request, Response } from 'express'

type PantryCategory = 'produce' | 'protein' | 'grain' | 'dairy' | 'condiment'
type LunchCategory = 'main' | 'snack' | 'fruit' | 'drink' | 'treat'

type PantryItem = {
  id: number
  name: string
  category: PantryCategory
  quantity: string
  nutFree: boolean
  lowStock: boolean
}

type PantryRecipe = {
  id: number
  name: string
  ingredients: string[]
  notes: string
  category: LunchCategory
  prepTimeMinutes: number
}

type RecipeIdea = PantryRecipe & { nutFree: boolean }

type CreatePantryItemInput = {
  name?: unknown
  category?: unknown
  quantity?: unknown
  nutFree?: unknown
}

type PantryItemValidationErrors = Partial<Record<'name' | 'category' | 'quantity' | 'nutFree', string>>

const VALID_CATEGORIES: PantryCategory[] = ['produce', 'protein', 'grain', 'dairy', 'condiment']
const MAX_NAME_LENGTH = 60
const MAX_QUANTITY_LENGTH = 40


const pantryItems: PantryItem[] = [
  { id: 1, name: 'Bread', category: 'grain', quantity: '1 loaf', nutFree: true, lowStock: false },
  { id: 2, name: 'Peanut Butter', category: 'condiment', quantity: '1 jar', nutFree: false, lowStock: false },
  { id: 3, name: 'Strawberry Jam', category: 'condiment', quantity: '1 jar', nutFree: true, lowStock: false },
  { id: 4, name: 'Apples', category: 'produce', quantity: '6 count', nutFree: true, lowStock: false },
  { id: 5, name: 'Bananas', category: 'produce', quantity: '5 count', nutFree: true, lowStock: true },
  { id: 6, name: 'Carrots', category: 'produce', quantity: '1 bag', nutFree: true, lowStock: false },
  { id: 7, name: 'String Cheese', category: 'dairy', quantity: '8 pack', nutFree: true, lowStock: false },
  { id: 8, name: 'Yogurt Cups', category: 'dairy', quantity: '6 pack', nutFree: true, lowStock: false },
  { id: 9, name: 'Turkey Slices', category: 'protein', quantity: '1 pack', nutFree: true, lowStock: false },
  { id: 10, name: 'Crackers', category: 'grain', quantity: '1 box', nutFree: true, lowStock: true },
  { id: 11, name: 'Tortillas', category: 'grain', quantity: '1 pack', nutFree: true, lowStock: false },
  { id: 12, name: 'Hummus', category: 'condiment', quantity: '1 tub', nutFree: true, lowStock: false },
  { id: 13, name: 'Milk', category: 'dairy', quantity: '1/2 gallon', nutFree: true, lowStock: false },
  { id: 14, name: 'Granola', category: 'grain', quantity: '1 bag', nutFree: false, lowStock: false },
]

const pantryRecipes: PantryRecipe[] = [
  {
    id: 1,
    name: 'PB&J Sandwich',
    ingredients: ['Bread', 'Peanut Butter', 'Strawberry Jam'],
    notes: 'Classic favorite - cut into fun shapes with a cookie cutter.',
    category: 'main',
    prepTimeMinutes: 5,
  },
  {
    id: 2,
    name: 'Turkey & Cheese Roll-Up',
    ingredients: ['Tortillas', 'Turkey Slices', 'String Cheese'],
    notes: 'Roll tightly and slice into bite-sized pinwheels.',
    category: 'main',
    prepTimeMinutes: 8,
  },
  {
    id: 3,
    name: 'Apple & Yogurt Snack Box',
    ingredients: ['Apples', 'Yogurt Cups', 'Granola'],
    notes: 'Slice apples thin and pack the yogurt with a small spoon.',
    category: 'snack',
    prepTimeMinutes: 5,
  },
  {
    id: 4,
    name: 'Veggie & Hummus Dippers',
    ingredients: ['Carrots', 'Hummus', 'Crackers'],
    notes: 'Great finger food - pack the dip in a separate small container.',
    category: 'snack',
    prepTimeMinutes: 10,
  },
  {
    id: 5,
    name: 'Banana Milk Smoothie',
    ingredients: ['Bananas', 'Milk', 'Granola'],
    notes: 'Blend until smooth and top with a sprinkle of granola.',
    category: 'drink',
    prepTimeMinutes: 5,
  },
]

function parsePantryItemId(value: string | string[]): number | null {
  if (Array.isArray(value)) {
    return null
  }

  const id = Number(value)

  if (!Number.isInteger(id) || id <= 0) {
    return null
  }

  return id
}

function isPantryCategory(value: unknown): value is PantryCategory {
  return typeof value === 'string' && VALID_CATEGORIES.includes(value as PantryCategory)
}

function validatePantryItemInput(input: CreatePantryItemInput): {
  errors: PantryItemValidationErrors
  value?: Omit<PantryItem, 'id' | 'lowStock'>
} {
  const errors: PantryItemValidationErrors = {}
  let category: PantryCategory | undefined
  let nutFree: boolean | undefined

  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (!name) {
    errors.name = 'name is required'
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `name must be ${MAX_NAME_LENGTH} characters or fewer`
  }

  if (!isPantryCategory(input.category)) {
    errors.category = `category must be one of: ${VALID_CATEGORIES.join(', ')}`
  } else {
    category = input.category
  }

  const quantity = typeof input.quantity === 'string' ? input.quantity.trim() : ''
  if (!quantity) {
    errors.quantity = 'quantity is required'
  } else if (quantity.length > MAX_QUANTITY_LENGTH) {
    errors.quantity = `quantity must be ${MAX_QUANTITY_LENGTH} characters or fewer`
  }

  if (typeof input.nutFree !== 'boolean') {
    errors.nutFree = 'nutFree must be a boolean'
  } else {
    nutFree = input.nutFree
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
    value: { name, category, quantity, nutFree },
  }
}

function isRecipeAvailable(recipe: PantryRecipe): boolean {
  return recipe.ingredients.every((ingredientName) => {
    const item = pantryItems.find((pantryItem) => pantryItem.name === ingredientName)
    return item !== undefined && !item.lowStock
  })
}

function isRecipeNutFree(recipe: PantryRecipe): boolean {
  return recipe.ingredients.every((ingredientName) => {
    const item = pantryItems.find((pantryItem) => pantryItem.name === ingredientName)
    return item !== undefined && item.nutFree
  })
}

function toRecipeIdea(recipe: PantryRecipe): RecipeIdea {
  return { ...recipe, nutFree: isRecipeNutFree(recipe) }
}

const pantryRouter = Router()

let nextPantryItemId = pantryItems.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1

pantryRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ data: pantryItems })
})

pantryRouter.post('/', (req: Request, res: Response) => {
  const { items } = req.body as { items?: unknown }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: {
        items: 'Provide at least one pantry item',
      },
    })
  }

  const itemErrors: Record<string, string> = {}
  const validatedItems: Omit<PantryItem, 'id' | 'lowStock'>[] = []

  items.forEach((rawItem, index) => {
    const validation = validatePantryItemInput(rawItem as CreatePantryItemInput)

    if (!validation.value) {
      Object.entries(validation.errors).forEach(([field, message]) => {
        itemErrors[`items[${index}].${field}`] = message as string
      })
    } else {
      validatedItems.push(validation.value)
    }
  })

  if (Object.keys(itemErrors).length > 0) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: itemErrors,
    })
  }

  const newItems: PantryItem[] = validatedItems.map((value) => {
    const newItem: PantryItem = { id: nextPantryItemId, ...value, lowStock: false }
    nextPantryItemId += 1
    return newItem
  })

  pantryItems.push(...newItems)

  return res.status(201).json({ data: newItems })
})

pantryRouter.patch('/:id', (req: Request, res: Response) => {
  const id = parsePantryItemId(req.params.id)

  if (id === null) {
    return res.status(400).json({
      error: 'Invalid request params',
      details: {
        id: 'id must be a positive integer',
      },
    })
  }

  const item = pantryItems.find((pantryItem) => pantryItem.id === id)

  if (!item) {
    return res.status(404).json({
      error: 'Pantry item not found',
    })
  }

  const { lowStock } = req.body as { lowStock?: unknown }

  if (typeof lowStock !== 'boolean') {
    return res.status(400).json({
      error: 'Invalid request body',
      details: {
        lowStock: 'lowStock must be a boolean',
      },
    })
  }

  item.lowStock = lowStock

  return res.status(200).json({ data: item })
})

pantryRouter.get('/recipes', (_req: Request, res: Response) => {
  res.status(200).json({ data: pantryRecipes.map(toRecipeIdea) })
})

pantryRouter.get('/recipe-ideas', (_req: Request, res: Response) => {
  const ideas = pantryRecipes.filter(isRecipeAvailable).map(toRecipeIdea)
  res.status(200).json({ data: ideas })
})

export default pantryRouter
