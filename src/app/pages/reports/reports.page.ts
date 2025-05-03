import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
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
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonList,
  IonItem,
  IonNote,
} from "@ionic/angular/standalone"
import { ReportService } from "../../services/report.service"
import { TransactionService } from "../../services/transaction.service"
import { ToastService } from "../../services/toast.service"
import { ReportFilter, TrendData, CategoryTrend } from "../../models/report.model"
import { Observable } from "rxjs"
import { Chart, registerables } from "chart.js"
import { documentOutline, downloadOutline, barChartOutline, pieChartOutline, statsChartOutline } from "ionicons/icons"
import { addIcons } from "ionicons"

Chart.register(...registerables)

// Tipo personalizado para o filtro da UI
interface UIFilter {
  startDate: string
  endDate: string
  categories: string[]
  filterType: "all" | "income" | "expense" // Renomeado para evitar conflito
}

@Component({
  selector: "app-reports",
  templateUrl: "./reports.page.html",
  styleUrls: ["./reports.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSegment,
    IonSegmentButton,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonList,
    IonItem,
    IonNote,
  ],
})
export class ReportsPage implements OnInit, AfterViewInit {
  @ViewChild("trendChart") trendChartCanvas!: ElementRef<HTMLCanvasElement>
  @ViewChild("categoryChart") categoryChartCanvas!: ElementRef<HTMLCanvasElement>

  // Usando o tipo personalizado para o filtro da UI
  filter: UIFilter = {
    startDate: "",
    endDate: "",
    categories: [],
    filterType: "all", // Renomeado para evitar conflito
  }

  categories$!: Observable<string[]>
  summary = { income: 0, expense: 0, balance: 0 }
  averageDailyExpense = 0
  categoryAverages: { category: string; average: number }[] = []

  private trendChart: Chart | null = null
  private categoryChart: Chart | null = null

  constructor(
    private reportService: ReportService,
    private transactionService: TransactionService,
    private toastService: ToastService,
  ) {
    addIcons({
      "document-outline": documentOutline,
      "download-outline": downloadOutline,
      "bar-chart-outline": barChartOutline,
      "pie-chart-outline": pieChartOutline,
      "stats-chart-outline": statsChartOutline,
    })

    // Inicializar datas para o último mês
    const now = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    this.filter.startDate = oneMonthAgo.toISOString()
    this.filter.endDate = now.toISOString()
  }

  ngOnInit() {
    this.categories$ = this.transactionService.getCategories()
  }

  ngAfterViewInit() {
    this.loadReportData()
  }

  async loadReportData() {
    try {
      // Converter o filtro da UI para o formato esperado pelo serviço
      const reportFilter: ReportFilter = {
        startDate: this.filter.startDate,
        endDate: this.filter.endDate,
        categories: this.filter.categories.length > 0 ? this.filter.categories : undefined,
      }

      // Adicionar tipos apenas se não for "all"
      if (this.filter.filterType !== "all") {
        reportFilter.types = [this.filter.filterType]
      }

      // Carregar transações e calcular resumo
      const transactions = await this.reportService.getTransactionsByPeriod(reportFilter)

      // Calcular resumo
      this.summary.income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      this.summary.expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      this.summary.balance = this.summary.income - this.summary.expense

      // Carregar tendências mensais
      const trends = await this.reportService.generateMonthlyTrends(6)
      this.renderTrendChart(trends)

      // Carregar tendências de categorias
      const categoryTrends = await this.reportService.generateCategoryTrends(6, "expense")
      this.renderCategoryChart(categoryTrends)

      // Carregar estatísticas
      this.averageDailyExpense = await this.reportService.calculateAverageDailyExpense(30)
      this.categoryAverages = await this.reportService.calculateCategoryAverages(3, "expense")
    } catch (error) {
      this.toastService.showErrorToast("Erro ao carregar dados do relatório")
      console.error(error)
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadReportData()
      event.target.complete()
    }, 1000)
  }

  async exportToPDF() {
    try {
      const reportFilter: ReportFilter = {
        startDate: this.filter.startDate,
        endDate: this.filter.endDate,
        categories: this.filter.categories.length > 0 ? this.filter.categories : undefined,
      }

      if (this.filter.filterType !== "all") {
        reportFilter.types = [this.filter.filterType]
      }

      await this.reportService.exportToPDF(reportFilter)
      this.toastService.showSuccessToast("Relatório exportado com sucesso")
    } catch (error) {
      this.toastService.showErrorToast("Erro ao exportar relatório")
      console.error(error)
    }
  }

  async exportToCSV() {
    try {
      const reportFilter: ReportFilter = {
        startDate: this.filter.startDate,
        endDate: this.filter.endDate,
        categories: this.filter.categories.length > 0 ? this.filter.categories : undefined,
      }

      if (this.filter.filterType !== "all") {
        reportFilter.types = [this.filter.filterType]
      }

      await this.reportService.exportToCSV(reportFilter)
      this.toastService.showSuccessToast("Dados exportados com sucesso")
    } catch (error) {
      this.toastService.showErrorToast("Erro ao exportar dados")
      console.error(error)
    }
  }

  private renderTrendChart(trends: TrendData[]) {
    if (this.trendChart) {
      this.trendChart.destroy()
    }

    if (!this.trendChartCanvas) return

    const ctx = this.trendChartCanvas.nativeElement.getContext("2d")
    if (!ctx) return

    this.trendChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: trends.map((t) => t.label),
        datasets: [
          {
            label: "Entradas",
            data: trends.map((t) => t.income),
            backgroundColor: "rgba(16, 185, 129, 0.7)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
          },
          {
            label: "Saídas",
            data: trends.map((t) => t.expense),
            backgroundColor: "rgba(239, 68, 68, 0.7)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 1,
          },
          {
            label: "Saldo",
            data: trends.map((t) => t.balance),
            type: "line",
            backgroundColor: "rgba(79, 70, 229, 0.2)",
            borderColor: "rgba(79, 70, 229, 1)",
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || ""
                const value = context.raw as number
                return `${label}: ${value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
              },
            },
          },
        },
      },
    })
  }

  private renderCategoryChart(categoryTrends: CategoryTrend[]) {
    if (this.categoryChart) {
      this.categoryChart.destroy()
    }

    if (!this.categoryChartCanvas) return

    const ctx = this.categoryChartCanvas.nativeElement.getContext("2d")
    if (!ctx) return

    // Preparar dados para o gráfico de pizza
    const totalExpenses = categoryTrends.reduce((sum, category) => {
      return sum + category.values.reduce((catSum, val) => catSum + val, 0)
    }, 0)

    // Calcular o total para cada categoria
    const categoryTotals = categoryTrends.map((category) => ({
      category: category.category,
      total: category.values.reduce((sum, val) => sum + val, 0),
      color: category.color,
    }))

    // Ordenar por valor total (maior para menor)
    categoryTotals.sort((a, b) => b.total - a.total)

    this.categoryChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categoryTotals.map((c) => c.category),
        datasets: [
          {
            data: categoryTotals.map((c) => c.total),
            backgroundColor: categoryTotals.map((c) => c.color),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                const percentage = totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : "0.0"
                return `${label}: ${value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${percentage}%)`
              },
            },
          },
        },
      },
    })
  }
}

export default ReportsPage
