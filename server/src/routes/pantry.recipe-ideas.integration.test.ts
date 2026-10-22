import express, { type Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Router } from 'express'

async function createTestApp(): Promise<Express> {
  vi.resetModules()
  const pantryModule = (await import('./pantry.js')) as unknown as { default: Router }
  const pantryRouter = pantryModule.default

  const app = express()
  app.use(express.json())
  app.use('/api/pantry', pantryRouter)

  return app
}

describe('GET /api/pantry/recipe-ideas integration', () => {
  let app: Express

  beforeEach(async () => {
    app = await createTestApp()
  })

  it('returns only available recipes with the same ordering and nutFree flags', async () => {
    const response = await request(app).get('/api/pantry/recipe-ideas')

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual([
      {
        id: 1,
        name: 'PB&J Sandwich',
        ingredients: ['Bread', 'Peanut Butter', 'Strawberry Jam'],
        notes: 'Classic favorite - cut into fun shapes with a cookie cutter.',
        category: 'main',
        prepTimeMinutes: 5,
        nutFree: false,
      },
      {
        id: 2,
        name: 'Turkey & Cheese Roll-Up',
        ingredients: ['Tortillas', 'Turkey Slices', 'String Cheese'],
        notes: 'Roll tightly and slice into bite-sized pinwheels.',
        category: 'main',
        prepTimeMinutes: 8,
        nutFree: true,
      },
      {
        id: 3,
        name: 'Apple & Yogurt Snack Box',
        ingredients: ['Apples', 'Yogurt Cups', 'Granola'],
        notes: 'Slice apples thin and pack the yogurt with a small spoon.',
        category: 'snack',
        prepTimeMinutes: 5,
        nutFree: false,
      },
    ])
  })

  it('includes a recipe idea after a required ingredient is no longer low stock', async () => {
    const patchResponse = await request(app).patch('/api/pantry/5').send({ lowStock: false })

    expect(patchResponse.status).toBe(200)

    const response = await request(app).get('/api/pantry/recipe-ideas')
    const recipeIdeaIds = (response.body.data as Array<{ id: number }>).map((recipe) => recipe.id)

    expect(response.status).toBe(200)
    expect(recipeIdeaIds).toEqual([1, 2, 3, 5])

    const smoothieIdea = (response.body.data as Array<{ id: number; nutFree: boolean }>).find(
      (recipe) => recipe.id === 5,
    )

    expect(smoothieIdea).toMatchObject({ id: 5, nutFree: false })
  })

  it('keeps using the first matching pantry item name when duplicate names are added', async () => {
    const duplicateTortillaResponse = await request(app).post('/api/pantry').send({
      items: [{ name: 'Tortillas', category: 'grain', quantity: '1 pack', nutFree: true }],
    })

    expect(duplicateTortillaResponse.status).toBe(201)

    const duplicateTortillaId = duplicateTortillaResponse.body.data[0].id as number

    const duplicateCheeseResponse = await request(app).post('/api/pantry').send({
      items: [{ name: 'String Cheese', category: 'dairy', quantity: '8 pack', nutFree: false }],
    })

    expect(duplicateCheeseResponse.status).toBe(201)

    const setLowStockResponse = await request(app)
      .patch(`/api/pantry/${duplicateTortillaId}`)
      .send({ lowStock: true })

    expect(setLowStockResponse.status).toBe(200)

    const response = await request(app).get('/api/pantry/recipe-ideas')
    const rollUpIdea = (response.body.data as Array<{ id: number; nutFree: boolean }>).find(
      (recipe) => recipe.id === 2,
    )

    expect(response.status).toBe(200)
    expect(rollUpIdea).toMatchObject({ id: 2, nutFree: true })
  })
})
