import { useEffect, useState, FormEvent } from 'react'
import { LunchIdea, LunchCategory, RecipeIdea, SavedLunchIdea } from '../types'
import {
  createLunchIdea,
  deleteLunchIdea,
  getLunchIdeas,
  updateLunchIdea,
} from '../services/lunchApi'
import { getRecipeIdeas } from '../services/pantryApi'
import './LunchForm.css'

const CATEGORIES: { value: LunchCategory; label: string }[] = [
  { value: 'main', label: '🍽️ Main' },
  { value: 'snack', label: '🧇 Snack' },
  { value: 'fruit', label: '🍓 Fruit' },
  { value: 'drink', label: '🥤 Drink' },
  { value: 'treat', label: '🍪 Treat' },
]

type FormState = Omit<LunchIdea, 'prepTimeMinutes'> & { prepTimeMinutes: string }

const EMPTY_FORM: FormState = {
  name: '',
  category: 'main',
  prepTimeMinutes: '',
  notes: '',
  nutFree: false,
}

const MAX_NAME_LENGTH = 60
const MAX_NOTES_LENGTH = 300
const MAX_PREP_TIME_MINUTES = 240

export default function LunchForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [ideas, setIdeas] = useState<SavedLunchIdea[]>([])
  const [showNutFreeOnly, setShowNutFreeOnly] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [successMsg, setSuccessMsg] = useState('')
  const [apiError, setApiError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[]>([])
  const [recipeIdeasError, setRecipeIdeasError] = useState('')

  const filteredIdeas = showNutFreeOnly ? ideas.filter((idea) => idea.nutFree) : ideas
  const isEditing = editingId !== null

  useEffect(() => {
    async function loadIdeas() {
      try {
        const lunches = await getLunchIdeas()
        setIdeas(lunches)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load lunch ideas'
        setApiError(message)
      }
    }

    void loadIdeas()
  }, [])

  useEffect(() => {
    async function loadRecipeIdeas() {
      try {
        const ideasFromPantry = await getRecipeIdeas()
        setRecipeIdeas(ideasFromPantry)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load recipe ideas'
        setRecipeIdeasError(message)
      }
    }

    void loadRecipeIdeas()
  }, [])

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {}

    const trimmedName = form.name.trim()
    if (!trimmedName) {
      newErrors.name = 'Name is required'
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      newErrors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer`
    }

    const trimmedNotes = form.notes.trim()
    if (!trimmedNotes) {
      newErrors.notes = 'Notes are required'
    } else if (trimmedNotes.length > MAX_NOTES_LENGTH) {
      newErrors.notes = `Notes must be ${MAX_NOTES_LENGTH} characters or fewer`
    }

    const prepTime = Number(form.prepTimeMinutes)
    if (!form.prepTimeMinutes.trim() || Number.isNaN(prepTime)) {
      newErrors.prepTimeMinutes = 'Enter a valid prep time (mins)'
    } else if (!Number.isInteger(prepTime) || prepTime <= 0) {
      newErrors.prepTimeMinutes = 'Prep time must be a whole number greater than 0'
    } else if (prepTime > MAX_PREP_TIME_MINUTES) {
      newErrors.prepTimeMinutes = `Prep time must be ${MAX_PREP_TIME_MINUTES} minutes or fewer`
    }

    setErrors(newErrors)

    const fieldIds: Record<'name' | 'prepTimeMinutes' | 'notes', string> = {
      name: 'name',
      prepTimeMinutes: 'prepTime',
      notes: 'notes',
    }
    const firstInvalidField = (['name', 'prepTimeMinutes', 'notes'] as const).find(
      (field) => newErrors[field],
    )
    if (firstInvalidField) {
      document.getElementById(fieldIds[firstInvalidField])?.focus()
    }

    return Object.keys(newErrors).length === 0
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setErrors({})
    setApiError('')
  }

  function startEditing(idea: SavedLunchIdea) {
    setEditingId(idea.id)
    setForm({
      name: idea.name,
      category: idea.category,
      prepTimeMinutes: String(idea.prepTimeMinutes),
      notes: idea.notes,
      nutFree: idea.nutFree,
    })
    setErrors({})
    setSuccessMsg('')
    setApiError('')
  }

  function duplicateIdea(idea: SavedLunchIdea) {
    setEditingId(null)
    setForm({
      name: `${idea.name} (Copy)`,
      category: idea.category,
      prepTimeMinutes: String(idea.prepTimeMinutes),
      notes: idea.notes,
      nutFree: idea.nutFree,
    })
    setErrors({})
    setSuccessMsg('')
    setApiError('')
    document.getElementById('name')?.focus()
  }

  async function handleDelete(id: number) {
    const idea = ideas.find((entry) => entry.id === id)
    if (!idea) {
      return
    }

    const confirmed = window.confirm(`Delete "${idea.name}"?`)
    if (!confirmed) {
      return
    }

    setApiError('')

    try {
      await deleteLunchIdea(id)
      setIdeas((prev) => prev.filter((entry) => entry.id !== id))
      if (editingId === id) {
        resetForm()
      }
      setSuccessMsg(`🗑️ "${idea.name}" deleted!`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete lunch idea'
      setApiError(message)
    }
  }

  async function handleQuickAdd(recipe: RecipeIdea) {
    setApiError('')

    const ideaPayload: LunchIdea = {
      name: recipe.name,
      category: recipe.category,
      prepTimeMinutes: recipe.prepTimeMinutes,
      notes: recipe.notes,
      nutFree: recipe.nutFree,
    }

    try {
      const savedIdea = await createLunchIdea(ideaPayload)
      setIdeas((prev) => [savedIdea, ...prev])
      setSuccessMsg(`✅ "${savedIdea.name}" added from pantry!`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add lunch idea'
      setApiError(message)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setApiError('')

    const ideaPayload: LunchIdea = {
      name: form.name.trim(),
      category: form.category,
      prepTimeMinutes: Number(form.prepTimeMinutes),
      notes: form.notes.trim(),
      nutFree: form.nutFree,
    }

    try {
      if (isEditing && editingId !== null) {
        const updatedIdea = await updateLunchIdea(editingId, ideaPayload)
        setIdeas((prev) => prev.map((entry) => (entry.id === editingId ? updatedIdea : entry)))
        setSuccessMsg(`✅ "${updatedIdea.name}" updated!`)
      } else {
        const savedIdea = await createLunchIdea(ideaPayload)
        setIdeas((prev) => [savedIdea, ...prev])
        setSuccessMsg(`✅ "${savedIdea.name}" added!`)
      }

      resetForm()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save lunch idea'
      setApiError(message)
    }
  }

  return (
    <div className="lf-page">
      <header className="lf-header">
        <span className="lf-header-emoji">🍱</span>
        <h1 className="lf-title">Kids Lunch Planner</h1>
        <p className="lf-subtitle">Add and manage lunch ideas for your little ones!</p>
      </header>

      <section className="lf-recipe-ideas">
        <h2 className="lf-recipe-ideas-title">🥫 Recipe Ideas from Your Pantry</h2>
        {recipeIdeasError && <p className="lf-error" role="alert">{recipeIdeasError}</p>}
        {!recipeIdeasError && recipeIdeas.length === 0 && (
          <p className="lf-empty-state" role="status">
            No recipe ideas available right now — check the Pantry page for low stock items.
          </p>
        )}
        {recipeIdeas.length > 0 && (
          <ul className="lf-recipe-idea-list">
            {recipeIdeas.map((recipe) => (
              <li key={recipe.id} className="lf-recipe-idea-card">
                <div className="lf-recipe-idea-header">
                  <span className="lf-recipe-idea-name">{recipe.name}</span>
                  {recipe.nutFree && <span className="lf-entry-tag">🥜 Nut Free</span>}
                </div>
                <span className="lf-entry-meta">⏱️ {recipe.prepTimeMinutes} min · {recipe.ingredients.join(', ')}</span>
                <button
                  type="button"
                  className="lf-action-button"
                  onClick={() => handleQuickAdd(recipe)}
                  aria-label={`Quick add ${recipe.name} to lunch ideas`}
                >
                  ⚡ Quick Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isEditing && (
        <div className="lf-edit-banner" role="status">
          <span>Editing “{ideas.find((idea) => idea.id === editingId)?.name ?? 'Lunch Idea'}”</span>
          <button type="button" className="lf-link-button" onClick={resetForm}>
            Cancel edit
          </button>
        </div>
      )}

      <form className="lf-form" onSubmit={handleSubmit} noValidate>

        {/* Name */}
        <div className="lf-field">
          <label htmlFor="name" className="lf-label">✏️ Lunch Idea Name</label>
          <input
            id="name"
            type="text"
            maxLength={MAX_NAME_LENGTH}
            className={`lf-input${errors.name ? ' lf-input--error' : ''}`}
            placeholder="e.g. PB&J Sandwich"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <span id="name-error" className="lf-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        {/* Category */}
        <fieldset className="lf-fieldset">
          <legend className="lf-legend">🗂️ Category</legend>
          <div className="lf-card-grid">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className={`lf-card${form.category === cat.value ? ' lf-card--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={form.category === cat.value}
                  onChange={() => setForm({ ...form, category: cat.value })}
                  className="lf-sr-only"
                />
                {cat.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Prep Time */}
        <div className="lf-field">
          <label htmlFor="prepTime" className="lf-label">⏱️ Prep Time (minutes)</label>
          <input
            id="prepTime"
            type="number"
            min={1}
            max={MAX_PREP_TIME_MINUTES}
            className={`lf-input lf-input--short${errors.prepTimeMinutes ? ' lf-input--error' : ''}`}
            placeholder="e.g. 10"
            value={form.prepTimeMinutes}
            onChange={(e) => setForm({ ...form, prepTimeMinutes: e.target.value })}
            required
            aria-invalid={!!errors.prepTimeMinutes}
            aria-describedby={errors.prepTimeMinutes ? 'prepTime-error' : undefined}
          />
          {errors.prepTimeMinutes && (
            <span id="prepTime-error" className="lf-error" role="alert">
              {errors.prepTimeMinutes}
            </span>
          )}
        </div>

        {/* Nut Free */}
        <div className="lf-field lf-field--inline">
          <label className="lf-toggle">
            <input
              type="checkbox"
              checked={form.nutFree}
              onChange={(e) => setForm({ ...form, nutFree: e.target.checked })}
              className="lf-toggle__input"
            />
            <span className="lf-toggle__track" aria-hidden="true" />
            <span className="lf-toggle__label">🥜 Nut Free</span>
          </label>
        </div>

        {/* Notes */}
        <div className="lf-field">
          <label htmlFor="notes" className="lf-label">
            📝 Notes
          </label>
          <textarea
            id="notes"
            maxLength={MAX_NOTES_LENGTH}
            className={`lf-textarea${errors.notes ? ' lf-input--error' : ''}`}
            placeholder="e.g. Cut into triangles, serve with dipping sauce…"
            rows={3}
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            required
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? 'notes-error' : undefined}
          />
          {errors.notes && (
            <span id="notes-error" className="lf-error" role="alert">
              {errors.notes}
            </span>
          )}
        </div>

        <button type="submit" className="lf-submit">
          {isEditing ? 'Save Changes ✨' : 'Add Lunch Idea 🎒'}
        </button>

        {isEditing && (
          <button type="button" className="lf-secondary-button" onClick={resetForm}>
            Cancel
          </button>
        )}

        {successMsg && <p className="lf-success" role="status">{successMsg}</p>}
        {apiError && <p className="lf-error" role="alert">{apiError}</p>}
      </form>

      {/* Saved ideas */}
      {ideas.length > 0 && (
        <section className="lf-entries">
          <div className="lf-entries-header">
            <h2 className="lf-entries-title">💡 Lunch Ideas ({filteredIdeas.length})</h2>
            <label className="lf-toggle">
              <input
                type="checkbox"
                checked={showNutFreeOnly}
                onChange={(e) => setShowNutFreeOnly(e.target.checked)}
                className="lf-toggle__input"
              />
              <span className="lf-toggle__track" aria-hidden="true" />
              <span className="lf-toggle__label">Show nut free only</span>
            </label>
          </div>

          {filteredIdeas.length === 0 ? (
            <p className="lf-empty-state" role="status">
              No lunches match the current filter.
            </p>
          ) : (
            <ul className="lf-entry-list">
              {filteredIdeas.map((idea) => {
                const cat = CATEGORIES.find((c) => c.value === idea.category)
                return (
                  <li key={idea.id} className="lf-entry-card">
                    <div className="lf-entry-header">
                      <span className="lf-entry-name">{idea.name}</span>
                      <span className={`lf-badge lf-badge--${idea.category}`}>{cat?.label}</span>
                    </div>
                    <div className="lf-entry-body">
                      <span className="lf-entry-meta">⏱️ {idea.prepTimeMinutes} min</span>
                      {idea.nutFree && <span className="lf-entry-tag">🥜 Nut Free</span>}
                      {idea.notes && <em className="lf-entry-notes">"{idea.notes}"</em>}
                    </div>
                    <div className="lf-entry-actions">
                      <button
                        type="button"
                        className="lf-action-button"
                        onClick={() => startEditing(idea)}
                        aria-label={`Edit ${idea.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="lf-action-button"
                        onClick={() => duplicateIdea(idea)}
                        aria-label={`Duplicate ${idea.name}`}
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        className="lf-action-button lf-action-button--danger"
                        onClick={() => handleDelete(idea.id)}
                        aria-label={`Delete ${idea.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
