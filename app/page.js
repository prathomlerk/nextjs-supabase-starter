import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
          Next.js + Supabase Starter
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
          พร้อม Authentication, Database และ Storage
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {user ? (
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              ไปยัง Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                เข้าสู่ระบบ
              </Link>
              <Link href="/login?tab=signup" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>

        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { icon: '🔐', title: 'Authentication', desc: 'Email/Password & Magic Link' },
            { icon: '🗄️', title: 'Database', desc: 'PostgreSQL with Row Level Security' },
            { icon: '📁', title: 'Storage', desc: 'File upload with public/private buckets' },
          ].map((f) => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
