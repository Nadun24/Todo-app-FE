'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [shaking, setShaking] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setGeneralError(data.message || 'Registration failed')
          setShaking(true)
          setTimeout(() => setShaking(false), 400)
        }
        return
      }

      window.location.href = '/todos'
    } catch {
      setGeneralError('Something went wrong. Please try again.')
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
    } finally {
      setLoading(false)
    }
  }

  function FloatingInput({
    id, label, type = 'text', value, onChange, error, required = true,
    rightSlot,
  }: {
    id: string
    label: string
    type?: string
    value: string
    onChange: (v: string) => void
    error?: string
    required?: boolean
    rightSlot?: React.ReactNode
  }) {
    return (
      <div>
        <div className="relative">
          <input
            id={id}
            type={type}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder=" "
            className={`peer w-full border rounded-xl px-4 pt-5 pb-2 ${rightSlot ? 'pr-11' : ''} text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
          />
          <label
            htmlFor={id}
            className={`absolute left-4 top-3.5 text-sm transition-all pointer-events-none peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-xs ${error ? 'text-red-400 peer-not-placeholder-shown:text-red-400' : 'text-gray-400 peer-not-placeholder-shown:text-gray-500'}`}
          >
            {label}
          </label>
          {rightSlot && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightSlot}
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
      </div>
    )
  }

  function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
    return (
      <button type="button" onClick={onToggle} className="text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
        {show ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
        <p className="text-gray-500 mt-2">Start managing your tasks today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <div className={`bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${shaking ? 'animate-shake' : ''}`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {generalError}
          </div>
        )}

        <FloatingInput
          id="name"
          label="Full name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          error={errors.name?.[0]}
        />

        <FloatingInput
          id="email"
          label="Email address"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          error={errors.email?.[0]}
        />

        <FloatingInput
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          error={errors.password?.[0]}
          rightSlot={<EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
        />

        <FloatingInput
          id="password_confirmation"
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          value={form.password_confirmation}
          onChange={(v) => setForm({ ...form, password_confirmation: v })}
          error={errors.password_confirmation?.[0]}
          rightSlot={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account…
            </>
          ) : 'Create account'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
          or
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
