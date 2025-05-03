import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  ModalController,
  AlertController,
} from "@ionic/angular/standalone"
import { BudgetService } from "../../services/budget.service"
import { Budget, BudgetSummary } from "../../models/budget.model"
import { Observable } from "rxjs"
import {
  addOutline,
  walletOutline,
  alertCircleOutline,
  warningOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from "ionicons/icons"
import { addIcons } from "ionicons"
import { BudgetFormComponent } from "../../components/budget-form/budget-form.component"
import {
  cartOutline,
  walletOutline as walletIcon,
  cardOutline,
  homeOutline,
  medicalOutline,
  schoolOutline,
  fastFoodOutline,
  carOutline,
  cashOutline,
} from "ionicons/icons"

@Component({
  selector: "app-budgets",
  templateUrl: "./budgets.page.html",
  styleUrls: ["./budgets.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
  ],
})
export class BudgetsPage implements OnInit {
  budgets$!: Observable<Budget[]>
  budgetSummary$!: Observable<BudgetSummary>
  selectedMonth: string
  selectedMonthLabel = ""

  constructor(
    private budgetService: BudgetService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    this.selectedMonth = this.budgetService.getCurrentMonth()
    this.updateMonthLabel()

    addIcons({
      addOutline,
      chevronBackOutline,
      chevronForwardOutline,
      alertCircleOutline,
      warningOutline,
      walletOutline,
      "cartOutline": cartOutline,
      "cardOutline": cardOutline,
      "homeOutline": homeOutline,
      "medicalOutline": medicalOutline,
      "schoolOutline": schoolOutline,
      "fastFoodOutline": fastFoodOutline,
      "carOutline": carOutline,
      "cashOutline": cashOutline,
    });
  }

  ngOnInit() {
    this.loadBudgets()
  }

  loadBudgets() {
    this.budgets$ = this.budgetService.getBudgetsByMonth(this.selectedMonth)
    this.budgetSummary$ = this.budgetService.getBudgetSummary(this.selectedMonth)
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.budgetService.updateAllBudgetSpending().then(() => {
        this.loadBudgets()
        event.target.complete()
      })
    }, 1000)
  }

  async openBudgetForm(budget?: Budget) {
    const modal = await this.modalController.create({
      component: BudgetFormComponent,
      componentProps: {
        budget: budget,
        selectedMonth: this.selectedMonth,
      },
      cssClass: "budget-form-modal",
    })

    await modal.present()

    const { data } = await modal.onWillDismiss()
    if (data && data.refresh) {
      this.loadBudgets()
    }
  }

  getBudgetUsagePercent(budget: Budget): number {
    return this.budgetService.getBudgetUsagePercent(budget)
  }

  previousMonth() {
    const [year, month] = this.selectedMonth.split("-").map(Number)
    let newMonth = month - 1
    let newYear = year

    if (newMonth < 1) {
      newMonth = 12
      newYear--
    }

    this.selectedMonth = `${newYear}-${String(newMonth).padStart(2, "0")}`
    this.updateMonthLabel()
    this.loadBudgets()
  }

  nextMonth() {
    const [year, month] = this.selectedMonth.split("-").map(Number)
    let newMonth = month + 1
    let newYear = year

    if (newMonth > 12) {
      newMonth = 1
      newYear++
    }

    this.selectedMonth = `${newYear}-${String(newMonth).padStart(2, "0")}`
    this.updateMonthLabel()
    this.loadBudgets()
  }

  updateMonthLabel() {
    const [year, month] = this.selectedMonth.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    this.selectedMonthLabel = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    // Capitalize first letter
    this.selectedMonthLabel = this.selectedMonthLabel.charAt(0).toUpperCase() + this.selectedMonthLabel.slice(1)
  }

  getCategoryIcon(category: string): string {
    const categoryIcons: { [key: string]: string } = {
      Alimentação: "fast-food-outline",
      Transporte: "car-outline",
      Lazer: "wallet-outline",
      Saúde: "medical-outline",
      Educação: "school-outline",
      Moradia: "home-outline",
      Salário: "cash-outline",
      Investimentos: "card-outline",
      Outros: "cart-outline",
    }

    return categoryIcons[category] || "cart-outline"
  }
}

export default BudgetsPage
