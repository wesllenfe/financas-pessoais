import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable, map } from "rxjs"
import { StorageService } from "./storage.service"
import { Transaction, TransactionSummary, CategorySummary } from "../models/transaction.model"
import { v4 as uuidv4 } from "uuid"

@Injectable({
  providedIn: "root",
})
export class TransactionService {
  private STORAGE_KEY = "transactions"
  private _transactions = new BehaviorSubject<Transaction[]>([])
  private _categories = new BehaviorSubject<string[]>([
    "Alimentação",
    "Transporte",
    "Lazer",
    "Saúde",
    "Educação",
    "Moradia",
    "Salário",
    "Investimentos",
    "Outros",
  ])
  private colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8AC249", "#EA80FC", "#607D8B"]

  transactions$ = this._transactions.asObservable()
  categories$ = this._categories.asObservable()

  constructor(private storageService: StorageService) {
    this.loadTransactions()
  }

  async loadTransactions() {
    const storedTransactions = (await this.storageService.get(this.STORAGE_KEY)) || []
    this._transactions.next(storedTransactions)
  }

  private async saveTransactions(transactions: Transaction[]) {
    await this.storageService.set(this.STORAGE_KEY, transactions)
    this._transactions.next(transactions)
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$
  }

  getTransactionById(id: string): Observable<Transaction | undefined> {
    return this.transactions$.pipe(map((transactions) => transactions.find((t) => t.id === id)))
  }

  async addTransaction(transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<void> {
    const now = new Date().toISOString()
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }

    const currentTransactions = this._transactions.value
    await this.saveTransactions([...currentTransactions, newTransaction])
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    const currentTransactions = this._transactions.value
    const index = currentTransactions.findIndex((t) => t.id === transaction.id)

    if (index !== -1) {
      const updatedTransaction = {
        ...transaction,
        updatedAt: new Date().toISOString(),
      }

      const updatedTransactions = [
        ...currentTransactions.slice(0, index),
        updatedTransaction,
        ...currentTransactions.slice(index + 1),
      ]

      await this.saveTransactions(updatedTransactions)
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    const currentTransactions = this._transactions.value
    const updatedTransactions = currentTransactions.filter((t) => t.id !== id)
    await this.saveTransactions(updatedTransactions)
  }

  getSummary(): Observable<TransactionSummary> {
    return this.transactions$.pipe(
      map((transactions) => {
        const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

        const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

        return {
          income,
          expense,
          balance: income - expense,
        }
      }),
    )
  }

  getCategorySummary(type: "income" | "expense"): Observable<CategorySummary[]> {
    return this.transactions$.pipe(
      map((transactions) => {
        const filteredTransactions = transactions.filter((t) => t.type === type)
        const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

        if (total === 0) return []

        const categoriesMap = new Map<string, number>()

        filteredTransactions.forEach((transaction) => {
          const currentAmount = categoriesMap.get(transaction.category) || 0
          categoriesMap.set(transaction.category, currentAmount + transaction.amount)
        })

        const categories: CategorySummary[] = Array.from(categoriesMap.entries())
          .map(([category, amount], index) => ({
            category,
            amount,
            percentage: (amount / total) * 100,
            color: this.colors[index % this.colors.length],
          }))
          .sort((a, b) => b.amount - a.amount)

        return categories
      }),
    )
  }

  getCategories(): Observable<string[]> {
    return this.categories$
  }

  async addCategory(category: string): Promise<void> {
    if (!this._categories.value.includes(category)) {
      const updatedCategories = [...this._categories.value, category]
      this._categories.next(updatedCategories)
    }
  }

  // Adicionar este método ao TransactionService para suportar filtros avançados
  async getFilteredTransactionsPromise(filter: any): Promise<Transaction[]> {
    const transactions = this._transactions.value

    return transactions.filter((t) => {
      // Filtrar por data
      if (filter.startDate && new Date(t.date) < new Date(filter.startDate)) {
        return false
      }

      if (filter.endDate && new Date(t.date) > new Date(filter.endDate)) {
        return false
      }

      // Filtrar por categorias
      if (filter.categories && filter.categories.length > 0 && !filter.categories.includes(t.category)) {
        return false
      }

      // Filtrar por tipo
      if (filter.types && filter.types.length > 0 && !filter.types.includes(t.type)) {
        return false
      }

      return true
    })
  }
}
