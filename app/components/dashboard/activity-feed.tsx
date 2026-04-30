// ============================================================
// VOIX — Activity Feed
// Dashboard activity timeline
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Star, 
  UserPlus, 
  Mail, 
  Zap,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Activity {
  id: string
  type: 'testimonial_received' | 'testimonial_published' | 'widget_created' | 'campaign_sent' | 'invite_opened'
  description: string
  created_at: string
  metadata?: Record<string, unknown>
}

interface Props {
  profileId: string
}

const activityIcons = {
  testimonial_received: MessageSquare,
  testimonial_published: Star,
  widget_created: Zap,
  campaign_sent: Mail,
  invite_opened: UserPlus,
}

const activityColors = {
  testimonial_received: 'bg-emerald-500/10 text-emerald-500',
  testimonial_published: 'bg-amber-500/10 text-amber-500',
  widget_created: 'bg-blue-500/10 text-blue-500',
  campaign_sent: 'bg-violet-500/10 text-violet-500',
  invite_opened: 'bg-pink-500/10 text-pink-500',
}

export function ActivityFeed({ profileId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [profileId])

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/activities?profileId=${profileId}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 mx-auto text-slate-600 mb-3" />
        <p className="text-sm text-slate-500">Aucune activité récente</p>
        <p className="text-xs text-slate-600 mt-1">
          Les actions apparaîtront ici en temps réel
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || Zap
          const colorClass = activityColors[activity.type] || 'bg-slate-500/10 text-slate-500'

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 leading-relaxed">
                  {activity.description}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(activity.created_at), { 
                    addSuffix: true,
                    locale: fr 
                  })}
                </p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
