export interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface TransactionSummary {
  balance: number
  income: number
  expense: number
}

export interface CategorySummary {
  category: string
  amount: number
  percentage: number
  color: string
}
