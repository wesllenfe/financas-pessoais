import { Component, Input, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonToggle,
  IonItem,
  ModalController,
  AlertController,
} from "@ionic/angular/standalone"
import { RecurringTransactionService } from "../../services/recurring-transaction.service"
import { TransactionService } from "../../services/transaction.service"
import { ToastService } from "../../services/toast.service"
import { RecurringTransaction } from "../../models/recurring-transaction.model"
import { Observable } from "rxjs"
import { closeOutline, textOutline, cashOutline, arrowUpOutline, arrowDownOutline, repeatOutline } from "ionicons/icons"
import { addIcons } from "ionicons"

@Component({
  selector: "app-recurring-form",
  templateUrl: "./recurring-form.component.html",
  styleUrls: ["./recurring-form.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonToggle,
    IonItem,
  ],
})
export class RecurringFormComponent implements OnInit {
  @Input() transaction!: RecurringTransaction

  isEditing = false
  displayAmount = ""
  categories$!: Observable<string[]>

  constructor(
    private recurringTransactionService: RecurringTransactionService,
    private transactionService: TransactionService,
    private toastService: ToastService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    addIcons({
      "close-outline": closeOutline,
      "text-outline": textOutline,
      "cash-outline": cashOutline,
      "arrow-up-outline": arrowUpOutline,
      "arrow-down-outline": arrowDownOutline,
      "repeat-outline": repeatOutline,
    })
  }

  ngOnInit() {
    this.categories$ = this.transactionService.getCategories()

    if (this.transaction) {
      this.isEditing = true
      this.displayAmount = this.transaction.amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    } else {
      const now = new Date()

      // Inicializar com valores padrão para garantir que nunca seja undefined
      this.transaction = {
        id: "",
        description: "",
        amount: 0,
        type: "expense",
        category: "",
        recurrenceType: "monthly",
        startDate: now.toISOString(),
        endDate: undefined,
        lastGenerated: undefined,
        active: true,
        createdAt: "",
        updatedAt: "",
      }
    }
  }

  formatCurrency(event: any) {
    let value = event.target.value.replace(/\D/g, "")
    value = (Number(value) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    this.displayAmount = value
  }

  updateAmount() {
    if (this.displayAmount) {
      const value = this.displayAmount.replace("R$", "").trim().replace(".", "").replace(",", ".")
      this.transaction!.amount = Number.parseFloat(value) || 0
    } else {
      this.transaction!.amount = 0
    }
  }

  async saveTransaction() {
    try {
      if (this.isEditing) {
        await this.recurringTransactionService.updateRecurringTransaction(this.transaction!)
        this.toastService.showSuccessToast("Transação recorrente atualizada com sucesso")
      } else {
        await this.recurringTransactionService.addRecurringTransaction({
          description: this.transaction!.description,
          amount: this.transaction!.amount,
          type: this.transaction!.type,
          category: this.transaction!.category,
          recurrenceType: this.transaction!.recurrenceType,
          startDate: this.transaction!.startDate,
          endDate: this.transaction!.endDate,
          active: this.transaction!.active,
        })
        this.toastService.showSuccessToast("Transação recorrente adicionada com sucesso")
      }
      this.modalController.dismiss({ refresh: true })
    } catch (error) {
      this.toastService.showErrorToast("Erro ao salvar transação recorrente")
      console.error(error)
    }
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: "Confirmar exclusão",
      message: "Tem certeza que deseja excluir esta transação recorrente?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Excluir",
          role: "destructive",
          handler: () => this.deleteTransaction(),
        },
      ],
    })

    await alert.present()
  }

  async deleteTransaction() {
    try {
      await this.recurringTransactionService.deleteRecurringTransaction(this.transaction!.id)
      this.toastService.showSuccessToast("Transação recorrente excluída com sucesso")
      this.modalController.dismiss({ refresh: true })
    } catch (error) {
      this.toastService.showErrorToast("Erro ao excluir transação recorrente")
      console.error(error)
    }
  }

  dismiss() {
    this.modalController.dismiss()
  }
}
