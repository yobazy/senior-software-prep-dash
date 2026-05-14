import { useState } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { Collapsible } from '../components/Collapsible'
import { cycleStory } from '../utils/statusCycles'
import { StatusPill } from '../components/StatusPill'
import type { StoryCard } from '../types'

export function StoryTab() {
  const {
    data,
    updatePositioning,
    updateStoryCard,
    deleteStoryCard,
    addStoryCard,
    addStoryLink,
    deleteStoryLink,
  } = useInterviewPrep()
  const [newTitle, setNewTitle] = useState('')
  const [newContext, setNewContext] = useState('')
  const [newStar, setNewStar] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  function addCard(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    addStoryCard({
      title: newTitle.trim(),
      context: newContext.trim(),
      star: newStar.trim(),
      notes: newNotes.trim(),
      status: 'not_practiced',
    })
    setNewTitle('')
    setNewContext('')
    setNewStar('')
    setNewNotes('')
  }

  function addLink(e: React.FormEvent) {
    e.preventDefault()
    addStoryLink(linkLabel, linkUrl)
    setLinkLabel('')
    setLinkUrl('')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-heading">Story</h1>
        <p className="app-page-desc">
          Positioning, STAR cards, and quick links.
        </p>
      </div>

      <section className="app-card">
        <h2 className="app-section-label">Positioning statement</h2>
        <textarea
          className="app-field mt-3 min-h-[5rem] w-full resize-y leading-relaxed"
          value={data.positioningStatement}
          onChange={(e) => updatePositioning(e.target.value)}
          rows={3}
        />
      </section>

      <section className="space-y-4">
        <h2 className="app-section-heading">Story cards</h2>
        <ul className="space-y-4">
          {data.storyCards.map((card: StoryCard) => (
            <li key={card.id} className="app-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    className="w-full border-b border-transparent bg-transparent text-base font-semibold text-teal-950 outline-none transition-colors duration-200 focus:border-teal-400 dark:text-teal-50 dark:focus:border-teal-500"
                    value={card.title}
                    onChange={(e) =>
                      updateStoryCard(card.id, { title: e.target.value })
                    }
                  />
                  <input
                    className="w-full border-b border-transparent bg-transparent text-sm text-teal-800/90 outline-none transition-colors duration-200 focus:border-teal-400 dark:text-teal-300/90 dark:focus:border-teal-500"
                    value={card.context}
                    onChange={(e) =>
                      updateStoryCard(card.id, { context: e.target.value })
                    }
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill
                    kind="story"
                    status={card.status}
                    onClick={() =>
                      updateStoryCard(card.id, {
                        status: cycleStory(card.status),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="app-btn-danger"
                    onClick={() => deleteStoryCard(card.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <Collapsible title="STAR narrative">
                  <textarea
                    className="app-field min-h-[8rem] w-full resize-y"
                    value={card.star}
                    onChange={(e) =>
                      updateStoryCard(card.id, { star: e.target.value })
                    }
                  />
                </Collapsible>
                <Collapsible title="Notes">
                  <textarea
                    className="app-field min-h-[5rem] w-full resize-y"
                    value={card.notes}
                    onChange={(e) =>
                      updateStoryCard(card.id, { notes: e.target.value })
                    }
                  />
                </Collapsible>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="app-card">
        <h3 className="app-section-heading">Add story card</h3>
        <form onSubmit={addCard} className="mt-3 space-y-3">
          <input
            required
            className="app-field w-full"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            className="app-field w-full"
            placeholder="Context (company, stack)"
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
          />
          <textarea
            className="app-field min-h-[6rem] w-full resize-y"
            placeholder="STAR narrative"
            value={newStar}
            onChange={(e) => setNewStar(e.target.value)}
          />
          <textarea
            className="app-field min-h-[4rem] w-full resize-y"
            placeholder="Notes (optional)"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />
          <button type="submit" className="app-btn-accent">
            Add card
          </button>
        </form>
      </section>

      <section className="app-card">
        <h2 className="app-section-heading">Links</h2>
        <ul className="mt-3 space-y-2">
          {data.storyLinks.map((l) => (
            <li
              key={l.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-100 px-3 py-2 text-sm dark:border-teal-800/70"
            >
              <a
                href={l.url}
                className="app-link"
                target="_blank"
                rel="noreferrer"
              >
                {l.label}
              </a>
              <div className="flex items-center gap-2">
                <span className="max-w-[12rem] truncate text-xs text-teal-700/75 dark:text-teal-400/75">
                  {l.url}
                </span>
                <button
                  type="button"
                  className="app-btn-danger"
                  onClick={() => deleteStoryLink(l.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={addLink} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className="app-field min-w-0 flex-1"
            placeholder="Label"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
          />
          <input
            className="app-field min-w-0 flex-1"
            placeholder="https://"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <button type="submit" className="app-btn-ghost shrink-0">
            Add link
          </button>
        </form>
      </section>
    </div>
  )
}
