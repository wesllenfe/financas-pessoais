import { Component } from "@angular/core"
import { IonApp, IonRouterOutlet, Platform } from "@ionic/angular/standalone"
import { StatusBar } from "@capacitor/status-bar"
import { BudgetService } from "./services/budget.service"
import { RecurringTransactionService } from "./services/recurring-transaction.service"
import { ToastService } from "./services/toast.service"

@Component({
  selector: "app-root",
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private budgetService: BudgetService,
    private recurringTransactionService: RecurringTransactionService,
    private toastService: ToastService,
  ) {
    this.initializeApp()
  }

  async initializeApp() {
    await this.platform.ready()
    if (this.platform.is("capacitor")) {
      StatusBar.setBackgroundColor({ color: "#3880ff" })
    }

    // Atualizar gastos dos orçamentos
    await this.budgetService.updateAllBudgetSpending()

    // Verificar transações recorrentes
    const generatedCount = await this.recurringTransactionService.processRecurringTransactions()
    if (generatedCount > 0) {
      this.toastService.showSuccessToast(`${generatedCount} transações recorrentes foram geradas`)
    }

    // Verificar orçamentos excedidos
    const currentMonth = this.budgetService.getCurrentMonth()
    const budgets = await this.budgetService.getBudgetsByMonth(currentMonth).toPromise()

    if (budgets) {
      const exceededBudgets = budgets.filter((b) => this.budgetService.isBudgetExceeded(b))

      if (exceededBudgets.length > 0) {
        this.toastService.showErrorToast(`Atenção: ${exceededBudgets.length} orçamentos excedidos!`)
      }
    }
  }
}
