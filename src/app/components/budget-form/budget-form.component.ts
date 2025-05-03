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
  ModalController,
  AlertController,
} from "@ionic/angular/standalone"
import { BudgetService } from "../../services/budget.service"
import { TransactionService } from "../../services/transaction.service"
import { ToastService } from "../../services/toast.service"
import { Budget } from "../../models/budget.model"
import { Observable } from "rxjs"
import { closeOutline, calendarOutline, cashOutline } from "ionicons/icons"
import { addIcons } from "ionicons"

@Component({
  selector: "app-budget-form",
  templateUrl: "./budget-form.component.html",
  styleUrls: ["./budget-form.component.scss"],
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
  ],
})
export class BudgetFormComponent implements OnInit {
  @Input() budget: Budget | undefined
  @Input() selectedMonth = ""

  isEditing = false
  displayAmount = ""
  categories$!: Observable<string[]>
  monthLabel = ""

  constructor(
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private toastService: ToastService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    addIcons({
      closeOutline,
      cashOutline,
      calendarOutline,
    });
  }

  ngOnInit() {
    this.categories$ = this.transactionService.getCategories()

    // Inicializar 'budget' com valores padrão se não houver um valor recebido via @Input
    if (this.budget) {
      this.isEditing = true
      this.displayAmount = this.budget.amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    } else {
      this.budget = {
        id: "",
        category: "",
        amount: 0,
        spent: 0,
        month: this.selectedMonth,
        createdAt: "",
        updatedAt: "",
      }
    }

    this.updateMonthLabel()
  }

  updateMonthLabel() {
    if (this.budget) {
      const [year, month] = this.budget.month.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
      this.monthLabel = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      // Capitalize first letter
      this.monthLabel = this.monthLabel.charAt(0).toUpperCase() + this.monthLabel.slice(1)
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
      if (this.budget) {
        this.budget.amount = Number.parseFloat(value) || 0
      }
    } else {
      if (this.budget) {
        this.budget.amount = 0
      }
    }
  }

  async saveBudget() {
    try {
      if (this.isEditing && this.budget) {
        await this.budgetService.updateBudget(this.budget)
        this.toastService.showSuccessToast("Orçamento atualizado com sucesso")
      } else if (this.budget) {
        await this.budgetService.addBudget({
          category: this.budget.category,
          amount: this.budget.amount,
          month: this.budget.month,
        })
        this.toastService.showSuccessToast("Orçamento adicionado com sucesso")
      }
      this.modalController.dismiss({ refresh: true })
    } catch (error) {
      this.toastService.showErrorToast("Erro ao salvar orçamento")
      console.error(error)
    }
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: "Confirmar exclusão",
      message: "Tem certeza que deseja excluir este orçamento?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Excluir",
          role: "destructive",
          handler: () => this.deleteBudget(),
        },
      ],
    })

    await alert.present()
  }

  async deleteBudget() {
    if (this.budget) {
      try {
        await this.budgetService.deleteBudget(this.budget.id)
        this.toastService.showSuccessToast("Orçamento excluído com sucesso")
        this.modalController.dismiss({ refresh: true })
      } catch (error) {
        this.toastService.showErrorToast("Erro ao excluir orçamento")
        console.error(error)
      }
    }
  }

  dismiss() {
    this.modalController.dismiss()
  }
}
