import './globals.css'

export const metadata = {
  title: 'My App',
  description: 'Built with Next.js + Supabase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
