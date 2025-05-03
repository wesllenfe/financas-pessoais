import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { map } from "rxjs/operators"
import { StorageService } from "./storage.service"
import { TransactionService } from "./transaction.service"
import { RecurringTransaction } from "../models/recurring-transaction.model"
import { v4 as uuidv4 } from "uuid"

@Injectable({
  providedIn: "root",
})
export class RecurringTransactionService {
  private STORAGE_KEY = "recurring-transactions"
  private _recurringTransactions = new BehaviorSubject<RecurringTransaction[]>([])
  recurringTransactions$ = this._recurringTransactions.asObservable()

  constructor(
    private storageService: StorageService,
    private transactionService: TransactionService,
  ) {
    this.loadRecurringTransactions()
  }

  async loadRecurringTransactions() {
    const storedTransactions = (await this.storageService.get(this.STORAGE_KEY)) || []
    this._recurringTransactions.next(storedTransactions)
  }

  private async saveRecurringTransactions(transactions: RecurringTransaction[]) {
    await this.storageService.set(this.STORAGE_KEY, transactions)
    this._recurringTransactions.next(transactions)
  }

  getRecurringTransactions(): Observable<RecurringTransaction[]> {
    return this.recurringTransactions$
  }

  getActiveRecurringTransactions(): Observable<RecurringTransaction[]> {
    return this.recurringTransactions$.pipe(map((transactions) => transactions.filter((t) => t.active)))
  }

  getRecurringTransactionById(id: string): Observable<RecurringTransaction | undefined> {
    return this.recurringTransactions$.pipe(map((transactions) => transactions.find((t) => t.id === id)))
  }

  async addRecurringTransaction(
    transaction: Omit<RecurringTransaction, "id" | "lastGenerated" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    const now = new Date().toISOString()
    const newTransaction: RecurringTransaction = {
      ...transaction,
      id: uuidv4(),
      lastGenerated: undefined,
      createdAt: now,
      updatedAt: now,
    }

    const currentTransactions = this._recurringTransactions.value
    await this.saveRecurringTransactions([...currentTransactions, newTransaction])
  }

  async updateRecurringTransaction(transaction: RecurringTransaction): Promise<void> {
    const currentTransactions = this._recurringTransactions.value
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

      await this.saveRecurringTransactions(updatedTransactions)
    }
  }

  async deleteRecurringTransaction(id: string): Promise<void> {
    const currentTransactions = this._recurringTransactions.value
    const updatedTransactions = currentTransactions.filter((t) => t.id !== id)
    await this.saveRecurringTransactions(updatedTransactions)
  }

  async toggleRecurringTransactionActive(id: string): Promise<void> {
    const currentTransactions = this._recurringTransactions.value
    const index = currentTransactions.findIndex((t) => t.id === id)

    if (index !== -1) {
      const transaction = currentTransactions[index]
      const updatedTransaction = {
        ...transaction,
        active: !transaction.active,
        updatedAt: new Date().toISOString(),
      }

      const updatedTransactions = [
        ...currentTransactions.slice(0, index),
        updatedTransaction,
        ...currentTransactions.slice(index + 1),
      ]

      await this.saveRecurringTransactions(updatedTransactions)
    }
  }

  async processRecurringTransactions(): Promise<number> {
    const activeTransactions = this._recurringTransactions.value.filter((t) => t.active)
    let generatedCount = 0

    for (const transaction of activeTransactions) {
      const shouldGenerate = await this.shouldGenerateTransaction(transaction)
      if (shouldGenerate) {
        await this.generateTransaction(transaction)
        generatedCount++
      }
    }

    return generatedCount
  }

  private async shouldGenerateTransaction(transaction: RecurringTransaction): Promise<boolean> {
    const now = new Date()
    const startDate = new Date(transaction.startDate)

    // Verificar se já passou da data de início
    if (now < startDate) {
      return false
    }

    // Verificar se já passou da data de término (se existir)
    if (transaction.endDate && now > new Date(transaction.endDate)) {
      return false
    }

    // Se nunca foi gerada, deve gerar
    if (!transaction.lastGenerated) {
      return true
    }

    const lastGenerated = new Date(transaction.lastGenerated)

    // Verificar com base no tipo de recorrência
    switch (transaction.recurrenceType) {
      case "daily":
        // Verificar se já passou um dia desde a última geração
        return this.daysDifference(lastGenerated, now) >= 1

      case "weekly":
        // Verificar se já passou uma semana desde a última geração
        return this.daysDifference(lastGenerated, now) >= 7

      case "monthly":
        // Verificar se já passou um mês desde a última geração
        return (
          (now.getMonth() > lastGenerated.getMonth() || now.getFullYear() > lastGenerated.getFullYear()) &&
          now.getDate() >= lastGenerated.getDate()
        )

      case "yearly":
        // Verificar se já passou um ano desde a última geração
        return (
          now.getFullYear() > lastGenerated.getFullYear() &&
          now.getMonth() >= lastGenerated.getMonth() &&
          now.getDate() >= lastGenerated.getDate()
        )

      default:
        return false
    }
  }

  private async generateTransaction(recurringTransaction: RecurringTransaction): Promise<void> {
    // Criar uma nova transação baseada na recorrente
    await this.transactionService.addTransaction({
      description: recurringTransaction.description,
      amount: recurringTransaction.amount,
      type: recurringTransaction.type,
      category: recurringTransaction.category,
      date: new Date().toISOString(),
    })

    // Atualizar a data da última geração
    const currentTransactions = this._recurringTransactions.value
    const index = currentTransactions.findIndex((t) => t.id === recurringTransaction.id)

    if (index !== -1) {
      const updatedTransaction = {
        ...currentTransactions[index],
        lastGenerated: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedTransactions = [
        ...currentTransactions.slice(0, index),
        updatedTransaction,
        ...currentTransactions.slice(index + 1),
      ]

      await this.saveRecurringTransactions(updatedTransactions)
    }
  }

  private daysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }
}
