'use client'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    const isNetworkError =
      error.message?.toLowerCase().includes('fetch') ||
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('failed')

    if (isNetworkError) {
      window.location.href = '/maintenance'
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-400/30">
          <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/todos"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Go to Dashboard
          </a>
          <a
            href="/maintenance"
            className="inline-flex items-center gap-2 border border-white/20 text-slate-300 hover:text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Check Status
          </a>
        </div>
      </div>
    </div>
  )
}
