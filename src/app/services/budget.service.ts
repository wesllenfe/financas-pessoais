import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { map } from "rxjs/operators"
import { StorageService } from "./storage.service"
import { TransactionService } from "./transaction.service"
import { Budget, BudgetSummary } from "../models/budget.model"
import { v4 as uuidv4 } from "uuid"

@Injectable({
  providedIn: "root",
})
export class BudgetService {
  private STORAGE_KEY = "budgets"
  private _budgets = new BehaviorSubject<Budget[]>([])
  budgets$ = this._budgets.asObservable()

  constructor(
    private storageService: StorageService,
    private transactionService: TransactionService,
  ) {
    this.loadBudgets()
  }

  async loadBudgets() {
    const storedBudgets = (await this.storageService.get(this.STORAGE_KEY)) || []
    this._budgets.next(storedBudgets)
  }

  private async saveBudgets(budgets: Budget[]) {
    await this.storageService.set(this.STORAGE_KEY, budgets)
    this._budgets.next(budgets)
  }

  getBudgets(): Observable<Budget[]> {
    return this.budgets$
  }

  getBudgetsByMonth(month: string): Observable<Budget[]> {
    return this.budgets$.pipe(map((budgets) => budgets.filter((b) => b.month === month)))
  }

  getBudgetById(id: string): Observable<Budget | undefined> {
    return this.budgets$.pipe(map((budgets) => budgets.find((b) => b.id === id)))
  }

  getBudgetSummary(month: string): Observable<BudgetSummary> {
    return this.getBudgetsByMonth(month).pipe(
      map((budgets) => {
        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
        const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
        const remainingBudget = totalBudget - totalSpent
        const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

        return {
          totalBudget,
          totalSpent,
          remainingBudget,
          percentUsed,
        }
      }),
    )
  }

  async addBudget(budget: Omit<Budget, "id" | "spent" | "createdAt" | "updatedAt">): Promise<void> {
    const now = new Date().toISOString()
    const newBudget: Budget = {
      ...budget,
      id: uuidv4(),
      spent: 0,
      createdAt: now,
      updatedAt: now,
    }

    const currentBudgets = this._budgets.value
    await this.saveBudgets([...currentBudgets, newBudget])
    await this.updateBudgetSpending(newBudget.id)
  }

  async updateBudget(budget: Budget): Promise<void> {
    const currentBudgets = this._budgets.value
    const index = currentBudgets.findIndex((b) => b.id === budget.id)

    if (index !== -1) {
      const updatedBudget = {
        ...budget,
        updatedAt: new Date().toISOString(),
      }

      const updatedBudgets = [...currentBudgets.slice(0, index), updatedBudget, ...currentBudgets.slice(index + 1)]

      await this.saveBudgets(updatedBudgets)
      await this.updateBudgetSpending(budget.id)
    }
  }

  async deleteBudget(id: string): Promise<void> {
    const currentBudgets = this._budgets.value
    const updatedBudgets = currentBudgets.filter((b) => b.id !== id)
    await this.saveBudgets(updatedBudgets)
  }

  async updateBudgetSpending(budgetId: string): Promise<void> {
    const budget = this._budgets.value.find((b) => b.id === budgetId)
    if (!budget) return

    // Extrair o ano e mês do formato 'YYYY-MM'
    const [year, month] = budget.month.split("-")
    const startDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1).toISOString()
    const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0).toISOString()

    // Obter transações do mês para a categoria específica
    const transactions = await this.transactionService.getFilteredTransactionsPromise({
      startDate,
      endDate,
      categories: [budget.category],
      types: ["expense"],
    })

    // Calcular o total gasto
    const spent = transactions.reduce((sum, t) => sum + t.amount, 0)

    // Atualizar o orçamento
    const currentBudgets = this._budgets.value
    const index = currentBudgets.findIndex((b) => b.id === budgetId)

    if (index !== -1) {
      const updatedBudget = {
        ...currentBudgets[index],
        spent,
        updatedAt: new Date().toISOString(),
      }

      const updatedBudgets = [...currentBudgets.slice(0, index), updatedBudget, ...currentBudgets.slice(index + 1)]

      await this.saveBudgets(updatedBudgets)
    }
  }

  async updateAllBudgetSpending(): Promise<void> {
    const budgets = this._budgets.value
    for (const budget of budgets) {
      await this.updateBudgetSpending(budget.id)
    }
  }

  // Verificar se um orçamento está próximo do limite (retorna a porcentagem usada)
  getBudgetUsagePercent(budget: Budget): number {
    if (budget.amount <= 0) return 0
    return (budget.spent / budget.amount) * 100
  }

  // Verificar se um orçamento está próximo do limite
  isBudgetNearLimit(budget: Budget, threshold = 80): boolean {
    const usagePercent = this.getBudgetUsagePercent(budget)
    return usagePercent >= threshold && usagePercent < 100
  }

  // Verificar se um orçamento excedeu o limite
  isBudgetExceeded(budget: Budget): boolean {
    return budget.spent > budget.amount
  }

  // Obter o mês atual no formato 'YYYY-MM'
  getCurrentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }
}
