import { DIFFICULTY_CONFIG } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DifficultyBadgeProps {
  difficulty: keyof typeof DIFFICULTY_CONFIG
  size?: 'sm' | 'md'
}

export function DifficultyBadge({ difficulty, size = 'sm' }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      config.color, config.textColor,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}