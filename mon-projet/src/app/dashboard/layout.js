'use client'

import { AuthProvider } from '../../hooks/useAuth'

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}