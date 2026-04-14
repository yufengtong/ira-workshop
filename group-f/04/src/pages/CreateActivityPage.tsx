import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/lib/store'
import { HIKING_ROUTES } from '@/lib/data'
import { DIFFICULTY_CONFIG } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'

export function CreateActivityPage() {
  const { addActivity } = useApp()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [routeId, setRouteId] = useState('')
  const [date, setDate] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(10)
  const [description, setDescription] = useState('')

  const selectedRoute = HIKING_ROUTES.find(r => r.id === routeId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !routeId || !date || !selectedRoute) return

    addActivity({
      title,
      routeId,
      routeName: selectedRoute.name,
      difficulty: selectedRoute.difficulty,
      points: selectedRoute.points,
      date,
      maxParticipants,
      organizer: '山野老狼',
      organizerAvatar: '🧑‍🦰',
      description,
      province: selectedRoute.province,
      city: selectedRoute.city,
    })

    navigate('/activities')
  }

  const inputClass = 'w-full h-10 px-3 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

  return (
    <main className="container py-8 max-w-2xl">
      <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">发布登山活动</CardTitle>
          <p className="text-sm text-muted-foreground">创建一个新的登山活动，邀请山友一起出发</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className={labelClass}>活动标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如：周末香山赏秋之旅"
                className={inputClass}
                required
              />
            </div>

            {/* Route selection */}
            <div>
              <label className={labelClass}>选择路线</label>
              <select
                value={routeId}
                onChange={e => setRouteId(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">请选择登山路线</option>
                {HIKING_ROUTES.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.province} · {route.name} ({DIFFICULTY_CONFIG[route.difficulty].label} +{route.points}分)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected route info */}
            {selectedRoute && (
              <div className="rounded-lg bg-secondary p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{selectedRoute.name}</span>
                  <span className="text-xs font-medium text-accent">
                    {DIFFICULTY_CONFIG[selectedRoute.difficulty].emoji} {DIFFICULTY_CONFIG[selectedRoute.difficulty].label} · +{selectedRoute.points}积分
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedRoute.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>海拔 {selectedRoute.elevation}m</span>
                  <span>距离 {selectedRoute.distance}km</span>
                  <span>耗时 {selectedRoute.duration}</span>
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label className={labelClass}>活动日期</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* Max participants */}
            <div>
              <label className={labelClass}>最大参与人数</label>
              <input
                type="number"
                value={maxParticipants}
                onChange={e => setMaxParticipants(Number(e.target.value))}
                min={2}
                max={100}
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>活动描述</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="描述活动详情、集合地点、注意事项等..."
                rows={4}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Submit */}
            <Button type="submit" variant="forest" size="lg" className="w-full">
              发布活动
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}