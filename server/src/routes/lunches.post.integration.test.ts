import express, { type Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import lunchesRouter from './lunches.js'

async function createTestApp(): Promise<Express> {
  const app = express()
  app.use(express.json())
  app.use('/api/lunches', lunchesRouter)

  return app
}

describe('POST /api/lunches integration', () => {
  let app: Express

  beforeEach(async () => {
    app = await createTestApp()

    const existingResponse = await request(app).get('/api/lunches')
    const existingLunches = existingResponse.body.data as Array<{ id: number }>

    for (const lunch of existingLunches) {
      await request(app).delete(`/api/lunches/${lunch.id}`)
    }
  })

  it('creates a lunch idea for a valid payload and returns normalized data', async () => {
    const payload = {
      name: '  Turkey & Cheese Wrap  ',
      category: 'main',
      notes: '  Easy protein lunch with cucumber slices.  ',
      nutFree: true,
      prepTimeMinutes: 12,
    }

    const postResponse = await request(app).post('/api/lunches').send(payload)

    expect(postResponse.status).toBe(201)
    expect(postResponse.body.data).toEqual({
      id: expect.any(Number),
      name: 'Turkey & Cheese Wrap',
      category: 'main',
      notes: 'Easy protein lunch with cucumber slices.',
      nutFree: true,
      prepTimeMinutes: 12,
    })

    const createdLunch = postResponse.body.data as { id: number }

    const getResponse = await request(app).get('/api/lunches')

    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toEqual({
      data: [
        {
          id: createdLunch.id,
          name: 'Turkey & Cheese Wrap',
          category: 'main',
          notes: 'Easy protein lunch with cucumber slices.',
          nutFree: true,
          prepTimeMinutes: 12,
        },
      ],
    })
  })

  it('returns 400 with field-level details for invalid payload and does not create data', async () => {
    const invalidPayload = {
      name: '   ',
      category: 'dessert',
      notes: '',
      nutFree: 'yes',
      prepTimeMinutes: 0,
    }

    const postResponse = await request(app).post('/api/lunches').send(invalidPayload)

    expect(postResponse.status).toBe(400)
    expect(postResponse.body).toEqual({
      error: 'Invalid request body',
      details: {
        name: 'name is required',
        category: 'category must be one of: main, snack, fruit, drink, treat',
        notes: 'notes is required',
        nutFree: 'nutFree must be a boolean',
        prepTimeMinutes: 'prepTimeMinutes must be a whole number greater than 0',
      },
    })

    const getResponse = await request(app).get('/api/lunches')

    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toEqual({ data: [] })
  })
})
