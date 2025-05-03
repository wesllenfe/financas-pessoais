import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonToggle,
  IonItem,
  IonLabel,
  IonChip,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/angular/standalone"
import { TransactionService } from "../../services/transaction.service"
import { ThemeService } from "../../services/theme.service"
import { CategorySummary, TransactionSummary } from "../../models/transaction.model"
import { ChartComponent } from "../../components/chart/chart.component"
import { Observable } from "rxjs"
import {
  addOutline,
  moonOutline,
  sunnyOutline,
  walletOutline,
  arrowUpOutline,
  arrowDownOutline,
  trendingUpOutline,
} from "ionicons/icons"
import { addIcons } from "ionicons"

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
    IonToggle,
    IonItem,
    IonLabel,
    IonChip,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    ChartComponent,
  ],
})
export class DashboardPage implements OnInit {
  summary$!: Observable<TransactionSummary>
  expenseCategories$!: Observable<CategorySummary[]>
  incomeCategories$!: Observable<CategorySummary[]>
  darkMode$: Observable<boolean>

  constructor(
    private transactionService: TransactionService,
    private themeService: ThemeService,
  ) {
    this.darkMode$ = this.themeService.darkMode$
    addIcons({
      "add-outline": addOutline,
      "moon-outline": moonOutline,
      "sunny-outline": sunnyOutline,
      "wallet-outline": walletOutline,
      "arrow-up-outline": arrowUpOutline,
      "arrow-down-outline": arrowDownOutline,
      "trending-up-outline": trendingUpOutline,
      "pie-chart-outline": trendingUpOutline,
      "list-outline": trendingUpOutline,
      "calculator-outline": trendingUpOutline,
      "flag-outline": trendingUpOutline,
      "repeat-outline": trendingUpOutline,
      "bar-chart-outline": trendingUpOutline,
    })
  }

  ngOnInit() {
    this.loadData()
  }

  loadData() {
    this.summary$ = this.transactionService.getSummary()
    this.expenseCategories$ = this.transactionService.getCategorySummary("expense")
    this.incomeCategories$ = this.transactionService.getCategorySummary("income")
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadData()
      event.target.complete()
    }, 1000)
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode()
  }
}

export default DashboardPage
