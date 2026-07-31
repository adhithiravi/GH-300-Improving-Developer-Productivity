import { useEffect, useMemo, useState, FormEvent } from 'react'
import { PantryCategory, PantryItem, RecipeIdea } from '../types'
import {
  createPantryItems,
  getPantryItems,
  getPantryRecipes,
  setPantryItemLowStock,
} from '../services/pantryApi'
import './PantryPage.css'

const CATEGORY_LABELS: Record<PantryCategory, string> = {
  produce: '🥕 Produce',
  protein: '🍗 Protein',
  grain: '🍞 Grain',
  dairy: '🧀 Dairy',
  condiment: '🍯 Condiment',
}

const CATEGORIES: { value: PantryCategory; label: string }[] = [
  { value: 'produce', label: '🥕 Produce' },
  { value: 'protein', label: '🍗 Protein' },
  { value: 'grain', label: '🍞 Grain' },
  { value: 'dairy', label: '🧀 Dairy' },
  { value: 'condiment', label: '🍯 Condiment' },
]

type ItemFormState = {
  name: string
  category: PantryCategory
  quantity: string
  nutFree: boolean
}

const EMPTY_ITEM_FORM: ItemFormState = {
  name: '',
  category: 'produce',
  quantity: '',
  nutFree: false,
}

const MAX_NAME_LENGTH = 60
const MAX_QUANTITY_LENGTH = 40

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([])
  const [recipes, setRecipes] = useState<RecipeIdea[]>([])
  const [apiError, setApiError] = useState('')
  const [itemForm, setItemForm] = useState<ItemFormState>(EMPTY_ITEM_FORM)
  const [itemFormErrors, setItemFormErrors] = useState<Partial<Record<keyof ItemFormState, string>>>({})
  const [itemSuccessMsg, setItemSuccessMsg] = useState('')

  useEffect(() => {
    async function loadPantry() {
      try {
        const [pantryItems, pantryRecipes] = await Promise.all([
          getPantryItems(),
          getPantryRecipes(),
        ])
        setItems(pantryItems)
        setRecipes(pantryRecipes)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load pantry'
        setApiError(message)
      }
    }

    void loadPantry()
  }, [])

  const lowStockNames = useMemo(
    () => new Set(items.filter((item) => item.lowStock).map((item) => item.name)),
    [items],
  )

  async function toggleLowStock(item: PantryItem) {
    setApiError('')
    try {
      const updated = await setPantryItemLowStock(item.id, !item.lowStock)
      setItems((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update pantry item'
      setApiError(message)
    }
  }

  function validateItemForm(): boolean {
    const newErrors: Partial<Record<keyof ItemFormState, string>> = {}

    const trimmedName = itemForm.name.trim()
    if (!trimmedName) {
      newErrors.name = 'Name is required'
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      newErrors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer`
    }

    const trimmedQuantity = itemForm.quantity.trim()
    if (!trimmedQuantity) {
      newErrors.quantity = 'Quantity is required'
    } else if (trimmedQuantity.length > MAX_QUANTITY_LENGTH) {
      newErrors.quantity = `Quantity must be ${MAX_QUANTITY_LENGTH} characters or fewer`
    }

    setItemFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleAddItem(e: FormEvent) {
    e.preventDefault()
    if (!validateItemForm()) return
    setApiError('')

    try {
      const [created] = await createPantryItems([
        {
          name: itemForm.name.trim(),
          category: itemForm.category,
          quantity: itemForm.quantity.trim(),
          nutFree: itemForm.nutFree,
        },
      ])
      setItems((prev) => [...prev, created])
      setItemForm(EMPTY_ITEM_FORM)
      setItemFormErrors({})
      setItemSuccessMsg(`✅ "${created.name}" added to pantry!`)
      setTimeout(() => setItemSuccessMsg(''), 4000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add pantry item'
      setApiError(message)
    }
  }

  return (
    <div className="pp-page">
      <header className="pp-header">
        <span className="pp-header-emoji">🥫</span>
        <h1 className="pp-title">What's in the Pantry</h1>
        <p className="pp-subtitle">Track what you have on hand and see what you can make!</p>
      </header>

      {apiError && <p className="pp-error" role="alert">{apiError}</p>}

      <section className="pp-add-item">
        <h2 className="pp-section-title">➕ Add Pantry Item</h2>
        <form className="pp-form" onSubmit={handleAddItem} noValidate>
          <div className="pp-field">
            <label htmlFor="itemName" className="pp-label">Item Name</label>
            <input
              id="itemName"
              type="text"
              maxLength={MAX_NAME_LENGTH}
              className={`pp-input${itemFormErrors.name ? ' pp-input--error' : ''}`}
              placeholder="e.g. Blueberries"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            />
            {itemFormErrors.name && <span className="pp-field-error">{itemFormErrors.name}</span>}
          </div>

          <fieldset className="pp-fieldset">
            <legend className="pp-legend">Category</legend>
            <div className="pp-card-grid">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className={`pp-card${itemForm.category === cat.value ? ' pp-card--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="pantryCategory"
                    value={cat.value}
                    checked={itemForm.category === cat.value}
                    onChange={() => setItemForm({ ...itemForm, category: cat.value })}
                    className="pp-sr-only"
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="pp-field">
            <label htmlFor="itemQuantity" className="pp-label">Quantity</label>
            <input
              id="itemQuantity"
              type="text"
              maxLength={MAX_QUANTITY_LENGTH}
              className={`pp-input${itemFormErrors.quantity ? ' pp-input--error' : ''}`}
              placeholder="e.g. 1 bag"
              value={itemForm.quantity}
              onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
            />
            {itemFormErrors.quantity && <span className="pp-field-error">{itemFormErrors.quantity}</span>}
          </div>

          <div className="pp-field pp-field--inline">
            <label className="pp-toggle">
              <input
                type="checkbox"
                checked={itemForm.nutFree}
                onChange={(e) => setItemForm({ ...itemForm, nutFree: e.target.checked })}
                className="pp-toggle__input"
              />
              <span className="pp-toggle__track" aria-hidden="true" />
              <span className="pp-toggle__label">🥜 Nut Free</span>
            </label>
          </div>

          <button type="submit" className="pp-submit">Add to Pantry 🧺</button>
          {itemSuccessMsg && <p className="pp-success" role="status">{itemSuccessMsg}</p>}
        </form>
      </section>

      <section className="pp-items">
        <h2 className="pp-section-title">📦 Pantry Items ({items.length})</h2>
        <ul className="pp-item-list">
          {items.map((item) => (
            <li
              key={item.id}
              className={`pp-item-card${item.lowStock ? ' pp-item-card--low' : ''}`}
            >
              <div className="pp-item-header">
                <span className="pp-item-name">{item.name}</span>
                <span className={`pp-badge pp-badge--${item.category}`}>
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
              <div className="pp-item-body">
                <span className="pp-item-quantity">{item.quantity}</span>
                {item.nutFree && <span className="pp-nut-free-tag">🥜 Nut Free</span>}
                <label className="pp-toggle">
                  <input
                    type="checkbox"
                    checked={item.lowStock}
                    onChange={() => toggleLowStock(item)}
                    className="pp-toggle__input"
                  />
                  <span className="pp-toggle__track" aria-hidden="true" />
                  <span className="pp-toggle__label">⚠️ Running low</span>
                </label>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="pp-recipes">
        <h2 className="pp-section-title">🍽️ Recipes from Your Pantry</h2>
        <ul className="pp-recipe-list">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="pp-recipe-card">
              <span className="pp-recipe-name">{recipe.name}</span>
              <div className="pp-recipe-ingredients">
                {recipe.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className={`pp-ingredient-tag${lowStockNames.has(ingredient) ? ' pp-ingredient-tag--low' : ''}`}
                  >
                    {ingredient}
                    {lowStockNames.has(ingredient) ? ' ⚠️' : ''}
                  </span>
                ))}
              </div>
              <p className="pp-recipe-notes">{recipe.notes}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

