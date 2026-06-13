export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl animate-ping" />
          <div className="relative w-24 h-24 bg-indigo-500/30 rounded-3xl flex items-center justify-center border border-indigo-400/30">
            <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Under Maintenance
        </h1>
        <p className="text-indigo-200 text-lg mb-2">
          We&apos;re working on something
        </p>
        <p className="text-slate-400 text-sm leading-relaxed mb-10">
          The server is temporarily unavailable or undergoing maintenance.
          Please try again in a few moments.
        </p>

        {/* Status indicators */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 mb-8 text-left space-y-3">
          {[
            { label: 'API Server',   status: 'checking' },
            { label: 'Database',     status: 'checking' },
            { label: 'Auth Service', status: 'checking' },
          ].map(({ label }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{label}</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-xs text-amber-400 font-medium">Checking…</span>
              </div>
            </div>
          ))}
        </div>

        {/* Retry button */}
        <a
          href="/todos"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </a>

        <p className="text-slate-600 text-xs mt-6">
          If the problem persists, contact support.
        </p>
      </div>
    </div>
  )
}
