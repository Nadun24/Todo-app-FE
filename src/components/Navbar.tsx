'use client'
import { useState, useEffect, useRef } from 'react'

interface Notification {
  id: string
  message: string
  type: string
  read_at: string | null
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const typeConfig: Record<string, { label: string; className: string }> = {
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
  reminder: { label: 'Reminder', className: 'bg-amber-100 text-amber-700' },
  info: { label: 'Info', className: 'bg-blue-100 text-blue-700' },
}

export function Navbar() {
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)user-name=([^;]*)/)
    setUserName(match ? decodeURIComponent(match[1]) : '')
  }, [])

  const unreadCount = notifications.filter((n) => !n.read_at).length


  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.data ?? [])
    } catch {
      // silent fail — notifications are non-critical
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markRead(id: string) {
    // Optimistically mark as read in UI
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
  }

  async function handleLogout() {
    setLogoutLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">TodoApp</span>
        </div>

        {userName && (
          <span className="text-sm text-gray-500 hidden sm:block">
            Hi, <span className="font-semibold text-gray-800">{userName}</span>
          </span>
        )}

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-400">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const t = typeConfig[n.type] ?? { label: n.type, className: 'bg-gray-100 text-gray-600' }
                      return (
                        <div
                          key={n.id}
                          onClick={() => !n.read_at && markRead(n.id)}
                          className={`px-4 py-3 flex gap-3 items-start transition-colors hover:bg-gray-50 ${!n.read_at ? 'bg-indigo-50/40 cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read_at ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${t.className}`}>
                                {t.label}
                              </span>
                              <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            {logoutLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
            {logoutLoading ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </nav>
  )
}
