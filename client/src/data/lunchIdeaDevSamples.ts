import type { CreateLunchIdeaInput } from '../types'

const boundaryNameAtMaxLength =
  'Turkey pinwheel box with cucumbers, carrots, and apple wedges'.slice(0, 60)

const boundaryNotesAtMaxLength = (
  'Keep cold with an ice pack. Add napkins and a spoon for easy school lunch cleanup. '
).repeat(4).slice(0, 300)

export const validLunchIdeas: CreateLunchIdeaInput[] = [
  {
    name: 'Turkey and cheese roll-ups',
    category: 'main',
    prepTimeMinutes: 10,
    notes: 'Use whole wheat tortilla strips and pack with cucumber rounds.',
    nutFree: true,
  },
  {
    name: 'Hummus veggie pita pockets',
    category: 'main',
    prepTimeMinutes: 12,
    notes: 'Fill mini pita halves with hummus, shredded carrots, and lettuce.',
    nutFree: true,
  },
  {
    name: 'Yogurt cup with almond granola',
    category: 'snack',
    prepTimeMinutes: 4,
    notes: 'Pack granola separately to keep crunch. Contains almonds.',
    nutFree: false,
  },
  {
    name: 'Cheese cubes and whole grain crackers',
    category: 'snack',
    prepTimeMinutes: 5,
    notes: 'Add a small divider cup for crackers to stay crisp.',
    nutFree: true,
  },
  {
    name: 'Apple slices with cinnamon',
    category: 'fruit',
    prepTimeMinutes: 6,
    notes: 'Toss slices with lemon water first to reduce browning.',
    nutFree: true,
  },
  {
    name: 'Berry and melon fruit cup',
    category: 'fruit',
    prepTimeMinutes: 8,
    notes: 'Use a leak-proof cup and chill before packing.',
    nutFree: true,
  },
  {
    name: 'Cold milk box',
    category: 'drink',
    prepTimeMinutes: 1,
    notes: 'Keep next to an ice pack in an insulated lunch bag.',
    nutFree: true,
  },
  {
    name: 'Chocolate banana smoothie bottle',
    category: 'drink',
    prepTimeMinutes: 7,
    notes: 'Blend with almond butter and freeze 15 minutes before packing.',
    nutFree: false,
  },
  {
    name: 'Oatmeal raisin mini cookie',
    category: 'treat',
    prepTimeMinutes: 3,
    notes: 'Include one cookie as a small dessert portion.',
    nutFree: true,
  },
  {
    name: 'Dark chocolate trail mix bite',
    category: 'treat',
    prepTimeMinutes: 5,
    notes: 'Contains peanuts; pack separately from nut-free foods.',
    nutFree: false,
  },
]

export const boundaryLunchIdeas: CreateLunchIdeaInput[] = [
  {
    name: boundaryNameAtMaxLength,
    category: 'main',
    prepTimeMinutes: 15,
    notes: 'Name is exactly 60 characters after trimming.',
    nutFree: true,
  },
  {
    name: 'Tuna pasta cup with peas',
    category: 'main',
    prepTimeMinutes: 20,
    notes: boundaryNotesAtMaxLength,
    nutFree: true,
  },
  {
    name: 'Orange wedges',
    category: 'fruit',
    prepTimeMinutes: 1,
    notes: 'Uses the minimum allowed prep time boundary.',
    nutFree: true,
  },
  {
    name: 'Weekend batch bento prep',
    category: 'main',
    prepTimeMinutes: 240,
    notes: 'Uses the maximum allowed prep time for a bulk prep session.',
    nutFree: true,
  },
]

type InvalidLunchBodyExample = {
  body: Record<keyof CreateLunchIdeaInput, unknown>
  expectedErrorField: keyof CreateLunchIdeaInput
  failedRule: string
  whyItFails: string
}

export const invalidLunchBodies: InvalidLunchBodyExample[] = [
  {
    body: {
      name: '   ',
      category: 'main',
      prepTimeMinutes: 10,
      notes: 'Everything else is valid, but name is only whitespace.',
      nutFree: true,
    },
    expectedErrorField: 'name',
    failedRule: 'name is required',
    whyItFails: 'The server trims strings and rejects an empty name after trimming.',
  },
  {
    body: {
      name: 'A'.repeat(61),
      category: 'main',
      prepTimeMinutes: 10,
      notes: 'This request only violates the maximum name length.',
      nutFree: true,
    },
    expectedErrorField: 'name',
    failedRule: 'name must be 60 characters or fewer',
    whyItFails: 'The name exceeds the 60-character maximum by one character.',
  },
  {
    body: {
      name: 'Cheese quesadilla',
      category: 'dessert',
      prepTimeMinutes: 12,
      notes: 'Category uses an unsupported value.',
      nutFree: true,
    },
    expectedErrorField: 'category',
    failedRule: 'category must be one of: main, snack, fruit, drink, treat',
    whyItFails: 'The value dessert is not in the allowed category list.',
  },
  {
    body: {
      name: 'Veggie wrap',
      category: 'main',
      prepTimeMinutes: 15,
      notes: 'N'.repeat(301),
      nutFree: true,
    },
    expectedErrorField: 'notes',
    failedRule: 'notes must be 300 characters or fewer',
    whyItFails: 'The notes field is 301 characters long, which is one over the limit.',
  },
  {
    body: {
      name: 'Pear slices',
      category: 'fruit',
      prepTimeMinutes: 3,
      notes: 'nutFree is incorrectly sent as text instead of a boolean.',
      nutFree: 'yes',
    },
    expectedErrorField: 'nutFree',
    failedRule: 'nutFree must be a boolean',
    whyItFails: 'The API expects true or false, not a string value.',
  },
  {
    body: {
      name: 'Rice and beans bowl',
      category: 'main',
      prepTimeMinutes: 12.5,
      notes: 'Prep time must be a whole number.',
      nutFree: true,
    },
    expectedErrorField: 'prepTimeMinutes',
    failedRule: 'prepTimeMinutes must be a whole number greater than 0',
    whyItFails: '12.5 is finite but not an integer, so validation rejects it.',
  },
]
