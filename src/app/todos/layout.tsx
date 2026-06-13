import { Navbar } from '@/components/Navbar'

export default function TodosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-50 min-h-full">
        <div className="max-w-5xl mx-auto w-full px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
