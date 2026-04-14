import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Activity, User } from './types'
import { MOCK_ACTIVITIES, MOCK_USERS } from './data'

interface AppState {
  activities: Activity[]
  users: User[]
  currentUserId: string
  addActivity: (activity: Omit<Activity, 'id' | 'currentParticipants' | 'participants' | 'status'>) => void
  joinActivity: (activityId: string) => void
  leaveActivity: (activityId: string) => void
  toast: { message: string; type: 'success' | 'error' } | null
  showToast: (message: string, type: 'success' | 'error') => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES)
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [toast, setToast] = useState<AppState['toast']>(null)
  const currentUserId = 'u1'

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'currentParticipants' | 'participants' | 'status'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `a${Date.now()}`,
      currentParticipants: 1,
      participants: [currentUserId],
      status: 'upcoming',
    }
    setActivities(prev => [newActivity, ...prev])
    setUsers(prev => prev.map(u =>
      u.id === currentUserId ? { ...u, activitiesOrganized: u.activitiesOrganized + 1 } : u
    ))
    showToast('活动发布成功！', 'success')
  }, [currentUserId, showToast])

  const joinActivity = useCallback((activityId: string) => {
    setActivities(prev => prev.map(a => {
      if (a.id === activityId) {
        if (a.participants.includes(currentUserId)) {
          showToast('你已经加入了该活动', 'error')
          return a
        }
        if (a.currentParticipants >= a.maxParticipants) {
          showToast('活动人数已满', 'error')
          return a
        }
        showToast('成功加入活动！', 'success')
        return {
          ...a,
          currentParticipants: a.currentParticipants + 1,
          participants: [...a.participants, currentUserId],
        }
      }
      return a
    }))
    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        const activity = activities.find(a => a.id === activityId)
        if (activity && !activity.participants.includes(currentUserId)) {
          return {
            ...u,
            activitiesJoined: u.activitiesJoined + 1,
            totalPoints: u.totalPoints + activity.points,
          }
        }
      }
      return u
    }))
  }, [currentUserId, activities, showToast])

  const leaveActivity = useCallback((activityId: string) => {
    setActivities(prev => prev.map(a => {
      if (a.id === activityId && a.participants.includes(currentUserId)) {
        showToast('已退出活动', 'success')
        return {
          ...a,
          currentParticipants: a.currentParticipants - 1,
          participants: a.participants.filter(p => p !== currentUserId),
        }
      }
      return a
    }))
    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId) {
        const activity = activities.find(a => a.id === activityId)
        if (activity && activity.participants.includes(currentUserId)) {
          return {
            ...u,
            activitiesJoined: u.activitiesJoined - 1,
            totalPoints: u.totalPoints - activity.points,
          }
        }
      }
      return u
    }))
  }, [currentUserId, activities, showToast])

  return (
    <AppContext.Provider value={{ activities, users, currentUserId, addActivity, joinActivity, leaveActivity, toast, showToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}