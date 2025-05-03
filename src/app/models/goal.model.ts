export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  startDate: string
  targetDate: string
  category: string
  color: string
  notes?: string
  linkedTransactionIds: string[]
  createdAt: string
  updatedAt: string
}

export interface GoalProgress {
  percentComplete: number
  daysLeft: number
  amountLeft: number
  onTrack: boolean
}
