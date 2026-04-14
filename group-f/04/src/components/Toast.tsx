import { useApp } from '@/lib/store'

export function Toast() {
  const { toast } = useApp()

  if (!toast) return null

  const bgClass = toast.type === 'success' ? 'bg-gradient-forest' : 'bg-destructive'

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-up">
      <div className={`${bgClass} text-primary-foreground px-5 py-3 rounded-lg shadow-card-hover flex items-center gap-2`}>
        <span>{toast.type === 'success' ? '✓' : '✕'}</span>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  )
}