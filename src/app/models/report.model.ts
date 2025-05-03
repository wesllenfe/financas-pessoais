export interface ReportFilter {
  startDate: string
  endDate: string
  categories?: string[]
  types?: ("income" | "expense")[]
}

export interface TrendData {
  label: string // Mês ou período
  income: number
  expense: number
  balance: number
}

export interface CategoryTrend {
  category: string
  values: number[]
  color: string
}
