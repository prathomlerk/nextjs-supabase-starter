'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function FileUpload({ userId, initialFiles }) {
  const [files, setFiles] = useState(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const supabase = createClient()

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)' })
      return
    }

    setUploading(true)
    setMessage({ type: '', text: '' })

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const result = await res.json()

    if (!res.ok) {
      setMessage({ type: 'error', text: result.error || 'อัปโหลดไม่สำเร็จ' })
    } else {
      setMessage({ type: 'success', text: `อัปโหลด ${file.name} สำเร็จ!` })
      // Refresh file list
      const { data } = await supabase.storage.from('uploads').list(userId, { limit: 20 })
      if (data) setFiles(data)
    }
    setUploading(false)
    e.target.value = ''
  }

  const deleteFile = async (name) => {
    const { error } = await supabase.storage.from('uploads').remove([`${userId}/${name}`])
    if (!error) {
      setFiles(files.filter((f) => f.name !== name))
    }
  }

  const getFileUrl = (name) => {
    const { data } = supabase.storage.from('uploads').getPublicUrl(`${userId}/${name}`)
    return data.publicUrl
  }

  return (
    <div className="card">
      <h2 style={{ fontWeight: '600', marginBottom: '1rem' }}>📁 Files</h2>

      <label
        htmlFor="file-upload"
        style={{ display: 'block', border: '2px dashed #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: uploading ? '#f9fafb' : 'white', marginBottom: '1rem' }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{uploading ? '⏳' : '☁️'}</div>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {uploading ? 'กำลังอัปโหลด...' : 'คลิกหรือลากไฟล์มาวางที่นี่ (สูงสุด 5MB)'}
        </p>
        <input
          id="file-upload"
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>

      {message.text && <p className={message.type} style={{ marginBottom: '1rem' }}>{message.text}</p>}

      {files.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
          ยังไม่มีไฟล์ — อัปโหลดไฟล์แรกได้เลย!
        </p>
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map((file) => (
            <li
              key={file.name}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.375rem' }}
            >
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{file.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {(file.metadata?.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href={getFileUrl(file.name)} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                  ดู
                </a>
                <button onClick={() => deleteFile(file.name)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                  ลบ
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
