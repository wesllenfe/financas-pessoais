import { Routes } from "@angular/router"

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    loadComponent: () => import("./pages/dashboard/dashboard.page").then((m) => m.DashboardPage),
  },
  {
    path: "transactions",
    loadComponent: () => import("./pages/transactions/transactions.page").then((m) => m.TransactionsPage),
  },
  {
    path: "transaction",
    loadComponent: () => import("./pages/transaction-form/transaction-form.page").then((m) => m.TransactionFormPage),
  },
  {
    path: "transaction/:id",
    loadComponent: () => import("./pages/transaction-form/transaction-form.page").then((m) => m.TransactionFormPage),
  },
  {
    path: "budgets",
    loadComponent: () => import("./pages/budgets/budgets.page").then((m) => m.BudgetsPage),
  },
  {
    path: "goals",
    loadComponent: () => import("./pages/goals/goals.page").then((m) => m.GoalsPage),
  },
  {
    path: "recurring",
    loadComponent: () =>
      import("./pages/recurring-transactions/recurring-transactions.page").then((m) => m.RecurringTransactionsPage),
  },
  {
    path: "reports",
    loadComponent: () => import("./pages/reports/reports.page").then((m) => m.ReportsPage),
  },
]
