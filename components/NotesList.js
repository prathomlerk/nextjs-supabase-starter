'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function NotesList({ initialNotes, userId }) {
  const [notes, setNotes] = useState(initialNotes)
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const addNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .insert({ content: newNote.trim(), user_id: userId })
      .select()
      .single()

    if (!error && data) {
      setNotes([data, ...notes])
      setNewNote('')
    }
    setLoading(false)
  }

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (!error) {
      setNotes(notes.filter((n) => n.id !== id))
    }
  }

  return (
    <div className="card">
      <h2 style={{ fontWeight: '600', marginBottom: '1rem' }}>📝 Notes</h2>

      <form onSubmit={addNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="เพิ่ม note ใหม่..."
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '...' : 'เพิ่ม'}
        </button>
      </form>

      {notes.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
          ยังไม่มี notes — เพิ่มอันแรกได้เลย!
        </p>
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.375rem' }}
            >
              <div>
                <p style={{ fontSize: '0.875rem' }}>{note.content}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {new Date(note.created_at).toLocaleString('th-TH')}
                </p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
