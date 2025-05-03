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
  IonToggle,
  IonChip,
 ModalController,
 AlertController,
} from "@ionic/angular/standalone"
import { RecurringTransactionService } from "../../services/recurring-transaction.service"
import { ToastService } from "../../services/toast.service"
import { RecurringTransaction, RecurrenceType } from "../../models/recurring-transaction.model"
import { Observable } from "rxjs"
import {
  addOutline,
  repeatOutline,
  cartOutline,
  walletOutline,
  cardOutline,
  homeOutline,
  medicalOutline,
  schoolOutline,
  fastFoodOutline,
  carOutline,
  cashOutline,
} from "ionicons/icons"
import { addIcons } from "ionicons"
import { RecurringFormComponent } from "src/app/components/recurring-form/recurring-form.component"

@Component({
  selector: "app-recurring-transactions",
  templateUrl: "./recurring-transactions.page.html",
  styleUrls: ["./recurring-transactions.page.scss"],
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
    IonToggle,
    IonChip,
  ],
})
export class RecurringTransactionsPage implements OnInit {
  recurringTransactions$!: Observable<RecurringTransaction[]>

  constructor(
    private recurringTransactionService: RecurringTransactionService,
    private toastService: ToastService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    addIcons({addOutline,repeatOutline,"cartOutline":cartOutline,"walletOutline":walletOutline,"cardOutline":cardOutline,"homeOutline":homeOutline,"medicalOutline":medicalOutline,"schoolOutline":schoolOutline,"fastFoodOutline":fastFoodOutline,"carOutline":carOutline,"cashOutline":cashOutline,});
  }

  ngOnInit() {
    this.loadRecurringTransactions()
  }

  loadRecurringTransactions() {
    this.recurringTransactions$ = this.recurringTransactionService.getRecurringTransactions()
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadRecurringTransactions()
      event.target.complete()
    }, 1000)
  }

  async openRecurringForm(transaction?: RecurringTransaction) {
    const modal = await this.modalController.create({
      component: RecurringFormComponent,
      componentProps: {
        transaction: transaction,
      },
      cssClass: "recurring-form-modal",
    })

    await modal.present()

    const { data } = await modal.onWillDismiss()
    if (data && data.refresh) {
      this.loadRecurringTransactions()
    }
  }

  async toggleActive(transaction: RecurringTransaction) {
    try {
      await this.recurringTransactionService.toggleRecurringTransactionActive(transaction.id)
      this.toastService.showSuccessToast(`Transação ${transaction.active ? "desativada" : "ativada"} com sucesso`)
      this.loadRecurringTransactions()
    } catch (error) {
      this.toastService.showErrorToast("Erro ao alterar status da transação")
      console.error(error)
    }
  }

  getFrequencyLabel(recurrenceType: RecurrenceType): string {
    const labels = {
      daily: "Diária",
      weekly: "Semanal",
      monthly: "Mensal",
      yearly: "Anual",
    }
    return labels[recurrenceType]
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

export default RecurringTransactionsPage
