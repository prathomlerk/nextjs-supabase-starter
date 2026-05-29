export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import LogoutButton from '@/components/LogoutButton'
import FileUpload from '@/components/FileUpload'
import NotesList from '@/components/NotesList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user's notes from database
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch user's files from storage
  const { data: files } = await supabase.storage
    .from('uploads')
    .list(user.id, { limit: 20 })

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* User Info Card */}
          <div className="card">
            <h2 style={{ fontWeight: '600', marginBottom: '1rem' }}>👤 ข้อมูลผู้ใช้</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>User ID:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{user.id.slice(0, 8)}...</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>อีเมล:</span>
                <span>{user.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>สมัครเมื่อ:</span>
                <span>{new Date(user.created_at).toLocaleDateString('th-TH')}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h2 style={{ fontWeight: '600', marginBottom: '1rem' }}>📊 สรุป</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Notes', value: notes?.length || 0, icon: '📝' },
                { label: 'Files', value: files?.length || 0, icon: '📁' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div style={{ marginTop: '1.5rem' }}>
          <NotesList initialNotes={notes || []} userId={user.id} />
        </div>

        {/* File Upload Section */}
        <div style={{ marginTop: '1.5rem' }}>
          <FileUpload userId={user.id} initialFiles={files || []} />
        </div>
      </div>
    </main>
  )
}
