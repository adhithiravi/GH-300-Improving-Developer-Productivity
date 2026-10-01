import { describe, expect, it } from 'vitest'
import { validateLunchInput } from './lunches.js'

type TestInput = {
  name?: unknown
  category?: unknown
  notes?: unknown
  nutFree?: unknown
  prepTimeMinutes?: unknown
}

function makeValidInput(overrides: TestInput = {}): TestInput {
  return {
    name: 'Turkey sandwich',
    category: 'main',
    notes: 'Easy to pack',
    nutFree: true,
    prepTimeMinutes: 10,
    ...overrides,
  }
}

describe('validateLunchInput', () => {
  describe('input object runtime type', () => {
    it('throws when input is undefined', () => {
      expect(() => validateLunchInput(undefined as unknown as TestInput)).toThrow(TypeError)
    })

    it('throws when input is null', () => {
      expect(() => validateLunchInput(null as unknown as TestInput)).toThrow(TypeError)
    })
  })

  describe('valid input', () => {
    it('returns value and empty errors for a fully valid payload', () => {
      const result = validateLunchInput(makeValidInput())

      expect(result.errors).toEqual({})
      expect(result.value).toEqual({
        name: 'Turkey sandwich',
        category: 'main',
        notes: 'Easy to pack',
        nutFree: true,
        prepTimeMinutes: 10,
      })
    })

    it('trims name and notes in returned value', () => {
      const result = validateLunchInput(
        makeValidInput({
          name: '  Turkey sandwich  ',
          notes: '  Easy to pack  ',
        }),
      )

      expect(result.value).toEqual({
        name: 'Turkey sandwich',
        category: 'main',
        notes: 'Easy to pack',
        nutFree: true,
        prepTimeMinutes: 10,
      })
    })

    it.each(['main', 'snack', 'fruit', 'drink', 'treat'] as const)(
      'accepts category %s',
      (category) => {
        const result = validateLunchInput(makeValidInput({ category }))

        expect(result.errors).toEqual({})
        expect(result.value?.category).toBe(category)
      },
    )
  })

  describe('required values', () => {
    it('requires name', () => {
      expect(validateLunchInput(makeValidInput({ name: undefined })).errors.name).toBe('name is required')
      expect(validateLunchInput(makeValidInput({ name: 42 })).errors.name).toBe('name is required')
      expect(validateLunchInput(makeValidInput({ name: '   ' })).errors.name).toBe('name is required')
    })

    it('requires notes', () => {
      expect(validateLunchInput(makeValidInput({ notes: undefined })).errors.notes).toBe('notes is required')
      expect(validateLunchInput(makeValidInput({ notes: 42 })).errors.notes).toBe('notes is required')
      expect(validateLunchInput(makeValidInput({ notes: '   ' })).errors.notes).toBe('notes is required')
    })

    it('requires nutFree to be a boolean', () => {
      expect(validateLunchInput(makeValidInput({ nutFree: undefined })).errors.nutFree).toBe(
        'nutFree must be a boolean',
      )
      expect(validateLunchInput(makeValidInput({ nutFree: 'true' })).errors.nutFree).toBe(
        'nutFree must be a boolean',
      )
    })

    it('requires prepTimeMinutes to be a whole number greater than 0', () => {
      expect(validateLunchInput(makeValidInput({ prepTimeMinutes: undefined })).errors.prepTimeMinutes).toBe(
        'prepTimeMinutes must be a whole number greater than 0',
      )
      expect(validateLunchInput(makeValidInput({ prepTimeMinutes: '10' })).errors.prepTimeMinutes).toBe(
        'prepTimeMinutes must be a whole number greater than 0',
      )
    })

    it('rejects missing category', () => {
      expect(validateLunchInput(makeValidInput({ category: undefined })).errors.category).toBe(
        'category must be one of: main, snack, fruit, drink, treat',
      )
    })
  })

  describe('validation boundaries', () => {
    it('accepts minimum non-empty trimmed name and notes', () => {
      const result = validateLunchInput(
        makeValidInput({
          name: ' x ',
          notes: ' y ',
        }),
      )

      expect(result.errors).toEqual({})
      expect(result.value?.name).toBe('x')
      expect(result.value?.notes).toBe('y')
    })

    it('accepts a 60-character name and rejects 61 characters', () => {
      const maxName = 'n'.repeat(60)
      const tooLongName = 'n'.repeat(61)

      expect(validateLunchInput(makeValidInput({ name: maxName })).errors).toEqual({})
      expect(validateLunchInput(makeValidInput({ name: tooLongName })).errors.name).toBe(
        'name must be 60 characters or fewer',
      )
    })

    it('accepts a 300-character notes value and rejects 301 characters', () => {
      const maxNotes = 'a'.repeat(300)
      const tooLongNotes = 'a'.repeat(301)

      expect(validateLunchInput(makeValidInput({ notes: maxNotes })).errors).toEqual({})
      expect(validateLunchInput(makeValidInput({ notes: tooLongNotes })).errors.notes).toBe(
        'notes must be 300 characters or fewer',
      )
    })

    it('accepts max-length name and notes after trimming outer whitespace', () => {
      const nameWithPadding = ` ${'n'.repeat(60)} `
      const notesWithPadding = ` ${'a'.repeat(300)} `

      const result = validateLunchInput(
        makeValidInput({
          name: nameWithPadding,
          notes: notesWithPadding,
        }),
      )

      expect(result.errors).toEqual({})
      expect(result.value?.name.length).toBe(60)
      expect(result.value?.notes.length).toBe(300)
    })

    it('accepts prepTimeMinutes values at lower and upper bounds', () => {
      expect(validateLunchInput(makeValidInput({ prepTimeMinutes: 1 })).errors).toEqual({})
      expect(validateLunchInput(makeValidInput({ prepTimeMinutes: 240 })).errors).toEqual({})
    })

    it('rejects prepTimeMinutes greater than max', () => {
      expect(validateLunchInput(makeValidInput({ prepTimeMinutes: 241 })).errors.prepTimeMinutes).toBe(
        'prepTimeMinutes must be 240 or fewer',
      )
    })

    it.each([0, -1, 2.5, Number.NaN, Number.POSITIVE_INFINITY])(
      'rejects invalid prepTimeMinutes value: %p',
      (prepTimeMinutes) => {
        expect(validateLunchInput(makeValidInput({ prepTimeMinutes })).errors.prepTimeMinutes).toBe(
          'prepTimeMinutes must be a whole number greater than 0',
        )
      },
    )
  })

  describe('categories', () => {
    it('rejects whitespace-only category', () => {
      expect(validateLunchInput(makeValidInput({ category: '   ' })).errors.category).toBe(
        'category must be one of: main, snack, fruit, drink, treat',
      )
    })

    it.each(['dessert', 'Main', '', 'main ', 123, null])(
      'rejects invalid category value: %p',
      (category) => {
        expect(validateLunchInput(makeValidInput({ category })).errors.category).toBe(
          'category must be one of: main, snack, fruit, drink, treat',
        )
      },
    )
  })

  describe('error aggregation', () => {
    it('reports only the failing fields when input is partially valid', () => {
      const result = validateLunchInput(
        makeValidInput({
          notes: '   ',
          prepTimeMinutes: 0,
        }),
      )

      expect(result.value).toBeUndefined()
      expect(result.errors).toEqual({
        notes: 'notes is required',
        prepTimeMinutes: 'prepTimeMinutes must be a whole number greater than 0',
      })
    })

    it('returns all field errors and no value when multiple fields are invalid', () => {
      const result = validateLunchInput({
        name: '   ',
        category: 'dessert',
        notes: '',
        nutFree: 'yes',
        prepTimeMinutes: 0,
      })

      expect(result.value).toBeUndefined()
      expect(result.errors).toEqual({
        name: 'name is required',
        category: 'category must be one of: main, snack, fruit, drink, treat',
        notes: 'notes is required',
        nutFree: 'nutFree must be a boolean',
        prepTimeMinutes: 'prepTimeMinutes must be a whole number greater than 0',
      })
    })
  })

  describe('invalid runtime types', () => {
    it.each([null, {}, [], 1])('rejects non-boolean nutFree type: %p', (nutFree) => {
      expect(validateLunchInput(makeValidInput({ nutFree })).errors.nutFree).toBe(
        'nutFree must be a boolean',
      )
    })

    it.each([null, {}, [], true])('rejects non-number prepTimeMinutes type: %p', (prepTimeMinutes) => {
      expect(validateLunchInput(makeValidInput({ prepTimeMinutes })).errors.prepTimeMinutes).toBe(
        'prepTimeMinutes must be a whole number greater than 0',
      )
    })
  })
})
