import type { Routes } from "@angular/router"

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
]
