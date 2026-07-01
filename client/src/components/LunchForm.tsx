import { useEffect, useState, FormEvent } from 'react'
import { LunchIdea, LunchCategory, SavedLunchIdea } from '../types'
import { createLunchIdea, getLunchIdeas } from '../services/lunchApi'
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

export default function LunchForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [ideas, setIdeas] = useState<SavedLunchIdea[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [successMsg, setSuccessMsg] = useState('')
  const [apiError, setApiError] = useState('')

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

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.notes.trim()) newErrors.notes = 'Notes are required'
    if (!form.prepTimeMinutes || Number(form.prepTimeMinutes) <= 0)
      newErrors.prepTimeMinutes = 'Enter a valid prep time (mins)'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      const savedIdea = await createLunchIdea(ideaPayload)
      setIdeas((prev) => [savedIdea, ...prev])
      setSuccessMsg(`✅ "${savedIdea.name}" added!`)
      setForm(EMPTY_FORM)
      setErrors({})
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
        <p className="lf-subtitle">Add lunch ideas for your little ones!</p>
      </header>

      <form className="lf-form" onSubmit={handleSubmit} noValidate>

        {/* Name */}
        <div className="lf-field">
          <label htmlFor="name" className="lf-label">✏️ Lunch Idea Name</label>
          <input
            id="name"
            type="text"
            className={`lf-input${errors.name ? ' lf-input--error' : ''}`}
            placeholder="e.g. PB&J Sandwich"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <span className="lf-error">{errors.name}</span>}
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
            className={`lf-input lf-input--short${errors.prepTimeMinutes ? ' lf-input--error' : ''}`}
            placeholder="e.g. 10"
            value={form.prepTimeMinutes}
            onChange={(e) => setForm({ ...form, prepTimeMinutes: e.target.value })}
          />
          {errors.prepTimeMinutes && <span className="lf-error">{errors.prepTimeMinutes}</span>}
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
            className={`lf-textarea${errors.notes ? ' lf-input--error' : ''}`}
            placeholder="e.g. Cut into triangles, serve with dipping sauce…"
            rows={3}
            value={form.notes ?? ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          {errors.notes && <span className="lf-error">{errors.notes}</span>}
        </div>

        <button type="submit" className="lf-submit">
          Add Lunch Idea 🎒
        </button>

        {successMsg && <p className="lf-success" role="status">{successMsg}</p>}
        {apiError && <p className="lf-error" role="alert">{apiError}</p>}
      </form>

      {/* Saved ideas */}
      {ideas.length > 0 && (
        <section className="lf-entries">
          <h2 className="lf-entries-title">💡 Lunch Ideas ({ideas.length})</h2>
          <ul className="lf-entry-list">
            {ideas.map((idea) => {
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
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
