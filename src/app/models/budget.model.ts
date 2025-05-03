export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  month: string
  createdAt: string
  updatedAt: string
}

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  percentUsed: number
}
