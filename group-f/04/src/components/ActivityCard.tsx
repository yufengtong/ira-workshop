import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DifficultyBadge } from '@/components/DifficultyBadge'
import { useApp } from '@/lib/store'
import type { Activity } from '@/lib/types'
import { Calendar, MapPin, Users, Star } from 'lucide-react'

interface ActivityCardProps {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { joinActivity, leaveActivity, currentUserId } = useApp()
  const isJoined = activity.participants.includes(currentUserId)
  const isFull = activity.currentParticipants >= activity.maxParticipants

  return (
    <Card className="overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{activity.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {activity.province} · {activity.routeName}
            </p>
          </div>
          <DifficultyBadge difficulty={activity.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {activity.date}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {activity.currentParticipants}/{activity.maxParticipants}人
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            +{activity.points}积分
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{activity.organizerAvatar}</span>
          <span className="text-sm text-muted-foreground">{activity.organizer} 发起</span>
        </div>
      </CardContent>
      <CardFooter>
        {isJoined ? (
          <Button variant="outline" className="w-full" onClick={() => leaveActivity(activity.id)}>
            已加入 · 点击退出
          </Button>
        ) : (
          <Button
            variant="forest"
            className="w-full"
            disabled={isFull}
            onClick={() => joinActivity(activity.id)}
          >
            {isFull ? '人数已满' : '加入活动'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}