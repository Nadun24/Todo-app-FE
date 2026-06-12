export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">TodoApp</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Stay organized,<br />stay productive.
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Manage your tasks effortlessly with a clean, fast, and focused experience.
          </p>
        </div>

        <ul className="space-y-5">
          {[
            { icon: 'M5 13l4 4L19 7', text: 'Create and organize todos instantly' },
            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Track priorities and due dates' },
            { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', text: 'Filter and search your task list' },
          ].map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-indigo-100">
              <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </span>
              <span className="text-sm">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md animate-auth">
          {children}
        </div>
      </div>
    </div>
  )
}
