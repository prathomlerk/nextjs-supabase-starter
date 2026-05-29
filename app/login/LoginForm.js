'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('tab') === 'signup') setTab('signup')
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/dashboard` },
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'กรุณากรอกอีเมลก่อน' })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'ส่ง Magic Link ไปยังอีเมลแล้ว!' })
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {tab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </h1>
        <div style={{ display: 'flex', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setMessage({ type: '', text: '' }) }}
              style={{
                flex: 1, padding: '0.625rem',
                background: tab === t ? '#4f46e5' : 'white',
                color: tab === t ? 'white' : '#374151',
                border: 'none', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer',
              }}
            >
              {t === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          ))}
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="email">อีเมล</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div>
              <label htmlFor="password">รหัสผ่าน</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            {message.text && <p className={message.type}>{message.text}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.625rem' }}>
              {loading ? 'กำลังดำเนินการ...' : tab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.75rem' }}>หรือ</div>
            <button onClick={handleMagicLink} className="btn btn-secondary" disabled={loading} style={{ width: '100%' }}>
              ส่ง Magic Link ทางอีเมล
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
