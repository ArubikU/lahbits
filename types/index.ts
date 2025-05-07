export type User = {
  id: string
  username: string
  nickname?: string
  full_name?: string
  profile_image_url?: string
  current_level: number
  current_xp: number
  total_xp: number
  gold: number
  birth_date?: Date
  gender?: string
  is_student?: boolean
  is_working?: boolean
  is_email_notifications?: boolean
  prestige_level: number
  theme_id: number
  role: "root" | "admin" | "user" // Nuevo campo para roles
  notifications: boolean
}

export type UserDevice = {
  id: number
  user_id: string
  device_id: string
  last_active: Date
}

export type StatCategory = {
  id: number
  name: string
  description?: string
  icon?: string
  color: string
  userId: string
}

export type Stat = {
  id: number
  category_id: number
  userId: string
  name: string
  current_value: number
  max_value: number
  category?: StatCategory

  
}

export type Task = {
  id: number
  user_id: string
  stat_id?: number
  title: string
  description?: string
  xp_reward: number
  deadline?: Date
  is_completed: boolean
  is_failed: boolean
  stat?: Stat
  favorite?: boolean
}

export type Theme = {
  id: number
  name: string
  is_dark: boolean
  primary_color: string
  secondary_color?: string
  accent_color?: string
  is_system: boolean
  user_id?: number
}

export type LevelThreshold = {
  level: number
  xp_required: number
  prestige_required: number
}

export type Streak = {
  id: number
  user_id: string
  current_streak: number
  max_streak: number
  last_activity_date: Date
  recovery_cost: number
}

export type StreakBonus = {
  id: number
  user_id: string
  min_days: number
  max_days?: number | null
  xp_bonus: number
}

export type MarketplaceItem = {
  id: number
  user_id: string
  name: string
  description?: string
  price: number
  max_purchases?: number
  times_purchased: number
  is_active: boolean
  created_at?: Date
  updated_at?: Date
}

export type Purchase = {
  id: number
  user_id: string
  item_id: number
  price_paid: number
  purchased_at: Date
  item?: MarketplaceItem
}
