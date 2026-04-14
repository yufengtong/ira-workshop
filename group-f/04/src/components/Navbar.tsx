import { Link, useLocation } from 'react-router-dom'
import { Mountain, Map, Trophy, Compass, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Mountain },
  { path: '/activities', label: '活动', icon: Compass },
  { path: '/create', label: '发布', icon: Plus },
  { path: '/leaderboard', label: '排行榜', icon: Trophy },
  { path: '/routes', label: '路线', icon: Map },
]

export function Navbar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-forest">
            <Mountain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">山行</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-base',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-lg">
            🧑‍🦰
          </div>
        </div>
      </div>
    </header>
  )
}