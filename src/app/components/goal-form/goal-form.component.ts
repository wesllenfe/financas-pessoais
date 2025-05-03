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
  IonTextarea,
  ModalController,
  AlertController,
} from "@ionic/angular/standalone"
import { GoalService } from "../../services/goal.service"
import { TransactionService } from "../../services/transaction.service"
import { ToastService } from "../../services/toast.service"
import { Goal } from "../../models/goal.model"
import { Observable } from "rxjs"
import { closeOutline, flagOutline, cashOutline, walletOutline } from "ionicons/icons"
import { addIcons } from "ionicons"

@Component({
  selector: "app-goal-form",
  templateUrl: "./goal-form.component.html",
  styleUrls: ["./goal-form.component.scss"],
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
    IonTextarea,
  ],
})
export class GoalFormComponent implements OnInit {
  @Input() goal!: Goal

  isEditing = false
  displayTargetAmount = ""
  displayCurrentAmount = ""
  categories$!: Observable<string[]>

  constructor(
    private goalService: GoalService,
    private transactionService: TransactionService,
    private toastService: ToastService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    addIcons({closeOutline, flagOutline, cashOutline, walletOutline});
  }

  ngOnInit() {
    this.categories$ = this.transactionService.getCategories()

    if (this.goal) {
      this.isEditing = true
      this.displayTargetAmount = this.goal.targetAmount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
      this.displayCurrentAmount = this.goal.currentAmount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    } else {
      const now = new Date()
      const sixMonthsLater = new Date()
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)

      this.goal = {
        id: "",
        name: "",
        targetAmount: 0,
        currentAmount: 0,
        startDate: now.toISOString(),
        targetDate: sixMonthsLater.toISOString(),
        category: "",
        color: "",
        notes: "",
        linkedTransactionIds: [],
        createdAt: "",
        updatedAt: "",
      }
    }
  }

  formatCurrency(event: any, type: "target" | "current") {
    let value = event.target.value.replace(/\D/g, "")
    value = (Number(value) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

    if (type === "target") {
      this.displayTargetAmount = value
    } else {
      this.displayCurrentAmount = value
    }
  }

  updateAmount(type: "target" | "current") {
    if (type === "target") {
      if (this.displayTargetAmount) {
        const value = this.displayTargetAmount.replace("R$", "").trim().replace(".", "").replace(",", ".")
        this.goal!.targetAmount = Number.parseFloat(value) || 0
      } else {
        this.goal!.targetAmount = 0
      }
    } else {
      if (this.displayCurrentAmount) {
        const value = this.displayCurrentAmount.replace("R$", "").trim().replace(".", "").replace(",", ".")
        this.goal!.currentAmount = Number.parseFloat(value) || 0
      } else {
        this.goal!.currentAmount = 0
      }
    }
  }

  async saveGoal() {
    try {
      if (this.isEditing) {
        await this.goalService.updateGoal(this.goal!)
        this.toastService.showSuccessToast("Meta atualizada com sucesso")
      } else {
        await this.goalService.addGoal({
          name: this.goal!.name,
          targetAmount: this.goal!.targetAmount,
          startDate: this.goal!.startDate,
          targetDate: this.goal!.targetDate,
          category: this.goal!.category,
          notes: this.goal!.notes,
        })
        this.toastService.showSuccessToast("Meta adicionada com sucesso")
      }
      this.modalController.dismiss({ refresh: true })
    } catch (error) {
      this.toastService.showErrorToast("Erro ao salvar meta")
      console.error(error)
    }
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: "Confirmar exclusão",
      message: "Tem certeza que deseja excluir esta meta?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Excluir",
          role: "destructive",
          handler: () => this.deleteGoal(),
        },
      ],
    })

    await alert.present()
  }

  async deleteGoal() {
    try {
      await this.goalService.deleteGoal(this.goal!.id)
      this.toastService.showSuccessToast("Meta excluída com sucesso")
      this.modalController.dismiss({ refresh: true })
    } catch (error) {
      this.toastService.showErrorToast("Erro ao excluir meta")
      console.error(error)
    }
  }

  dismiss() {
    this.modalController.dismiss()
  }
}
