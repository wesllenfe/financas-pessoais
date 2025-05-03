export type RecurrenceType = "daily" | "weekly" | "monthly" | "yearly"

export interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  recurrenceType: RecurrenceType
  startDate: string
  endDate?: string
  lastGenerated?: string
  active: boolean
  createdAt: string
  updatedAt: string
}
