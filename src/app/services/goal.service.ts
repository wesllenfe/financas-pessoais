import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { map } from "rxjs/operators"
import { StorageService } from "./storage.service"
import { Goal, GoalProgress } from "../models/goal.model"
import { v4 as uuidv4 } from "uuid"

@Injectable({
  providedIn: "root",
})
export class GoalService {
  private STORAGE_KEY = "goals"
  private _goals = new BehaviorSubject<Goal[]>([])
  goals$ = this._goals.asObservable()

  // Cores para metas
  private goalColors = [
    "#4F46E5", // Indigo
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#14B8A6", // Teal
  ]

  constructor(private storageService: StorageService) {
    this.loadGoals()
  }

  async loadGoals() {
    const storedGoals = (await this.storageService.get(this.STORAGE_KEY)) || []
    this._goals.next(storedGoals)
  }

  private async saveGoals(goals: Goal[]) {
    await this.storageService.set(this.STORAGE_KEY, goals)
    this._goals.next(goals)
  }

  getGoals(): Observable<Goal[]> {
    return this.goals$
  }

  getActiveGoals(): Observable<Goal[]> {
    return this.goals$.pipe(
      map((goals) =>
        goals.filter((g) => {
          const targetDate = new Date(g.targetDate)
          const now = new Date()
          return targetDate >= now && g.currentAmount < g.targetAmount
        }),
      ),
    )
  }

  getGoalById(id: string): Observable<Goal | undefined> {
    return this.goals$.pipe(map((goals) => goals.find((g) => g.id === id)))
  }

  async addGoal(
    goal: Omit<Goal, "id" | "currentAmount" | "color" | "linkedTransactionIds" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    const now = new Date().toISOString()
    const newGoal: Goal = {
      ...goal,
      id: uuidv4(),
      currentAmount: 0,
      color: this.getRandomColor(),
      linkedTransactionIds: [],
      createdAt: now,
      updatedAt: now,
    }

    const currentGoals = this._goals.value
    await this.saveGoals([...currentGoals, newGoal])
  }

  async updateGoal(goal: Goal): Promise<void> {
    const currentGoals = this._goals.value
    const index = currentGoals.findIndex((g) => g.id === goal.id)

    if (index !== -1) {
      const updatedGoal = {
        ...goal,
        updatedAt: new Date().toISOString(),
      }

      const updatedGoals = [...currentGoals.slice(0, index), updatedGoal, ...currentGoals.slice(index + 1)]

      await this.saveGoals(updatedGoals)
    }
  }

  async deleteGoal(id: string): Promise<void> {
    const currentGoals = this._goals.value
    const updatedGoals = currentGoals.filter((g) => g.id !== id)
    await this.saveGoals(updatedGoals)
  }

  async addTransactionToGoal(goalId: string, transactionId: string, amount: number): Promise<void> {
    const currentGoals = this._goals.value
    const index = currentGoals.findIndex((g) => g.id === goalId)

    if (index !== -1) {
      const goal = currentGoals[index]

      // Verificar se a transação já está vinculada
      if (goal.linkedTransactionIds.includes(transactionId)) {
        return
      }

      const updatedGoal = {
        ...goal,
        currentAmount: goal.currentAmount + amount,
        linkedTransactionIds: [...goal.linkedTransactionIds, transactionId],
        updatedAt: new Date().toISOString(),
      }

      const updatedGoals = [...currentGoals.slice(0, index), updatedGoal, ...currentGoals.slice(index + 1)]

      await this.saveGoals(updatedGoals)
    }
  }

  async removeTransactionFromGoal(goalId: string, transactionId: string, amount: number): Promise<void> {
    const currentGoals = this._goals.value
    const index = currentGoals.findIndex((g) => g.id === goalId)

    if (index !== -1) {
      const goal = currentGoals[index]

      // Verificar se a transação está vinculada
      if (!goal.linkedTransactionIds.includes(transactionId)) {
        return
      }

      const updatedGoal = {
        ...goal,
        currentAmount: Math.max(0, goal.currentAmount - amount),
        linkedTransactionIds: goal.linkedTransactionIds.filter((id) => id !== transactionId),
        updatedAt: new Date().toISOString(),
      }

      const updatedGoals = [...currentGoals.slice(0, index), updatedGoal, ...currentGoals.slice(index + 1)]

      await this.saveGoals(updatedGoals)
    }
  }

  calculateGoalProgress(goal: Goal): GoalProgress {
    const now = new Date()
    const startDate = new Date(goal.startDate)
    const targetDate = new Date(goal.targetDate)

    // Calcular dias restantes
    const daysLeft = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    // Calcular valor restante
    const amountLeft = Math.max(0, goal.targetAmount - goal.currentAmount)

    // Calcular porcentagem completa
    const percentComplete = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0

    // Verificar se está no caminho certo
    const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const expectedProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0

    const onTrack = percentComplete >= expectedProgress

    return {
      percentComplete,
      daysLeft,
      amountLeft,
      onTrack,
    }
  }

  private getRandomColor(): string {
    return this.goalColors[Math.floor(Math.random() * this.goalColors.length)]
  }
}
