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
  IonSegment,
  IonSegmentButton,
  IonList,
  IonItem,
  ModalController,
  AlertController,
} from "@ionic/angular/standalone"
import { GoalService } from "../../services/goal.service"
import { TransactionService } from "../../services/transaction.service"
import { ToastService } from "../../services/toast.service"
import { Goal, GoalProgress } from "../../models/goal.model"
import { Transaction } from "../../models/transaction.model"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { closeOutline, cashOutline, trashOutline, alertCircleOutline } from "ionicons/icons"
import { addIcons } from "ionicons"

@Component({
  selector: "app-goal-transaction",
  templateUrl: "./goal-transaction.component.html",
  styleUrls: ["./goal-transaction.component.scss"],
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
    IonSegment,
    IonSegmentButton,
    IonList,
    IonItem,
  ],
})
export class GoalTransactionComponent implements OnInit {
  @Input() goal!: Goal
  @Input() mode: "add" | "view" = "add"

  progress!: GoalProgress
  displayAmount = ""
  amount = 0
  addMethod: "manual" | "transaction" = "manual"
  selectedTransactionId = ""
  incomeTransactions$!: Observable<Transaction[]>
  linkedTransactions$!: Observable<Transaction[]>

  constructor(
    private goalService: GoalService,
    private transactionService: TransactionService,
    private toastService: ToastService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    addIcons({
      "close-outline": closeOutline,
      "cash-outline": cashOutline,
      "trash-outline": trashOutline,
      "alert-circle-outline": alertCircleOutline,
    })
  }

  ngOnInit() {
    this.progress = this.goalService.calculateGoalProgress(this.goal)

    // Obter transações de entrada que não estão vinculadas a nenhuma meta
    this.incomeTransactions$ = this.transactionService
      .getTransactions()
      .pipe(
        map((transactions) =>
          transactions.filter((t) => t.type === "income" && !this.goal.linkedTransactionIds.includes(t.id)),
        ),
      )

    // Obter transações vinculadas a esta meta
    this.linkedTransactions$ = this.transactionService
      .getTransactions()
      .pipe(map((transactions) => transactions.filter((t) => this.goal.linkedTransactionIds.includes(t.id))))
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
      this.amount = Number.parseFloat(value) || 0
    } else {
      this.amount = 0
    }
  }

  async addValueToGoal() {
    try {
      if (this.addMethod === "manual") {
        // Atualizar o valor atual da meta
        const updatedGoal = {
          ...this.goal,
          currentAmount: this.goal.currentAmount + this.amount,
        }

        await this.goalService.updateGoal(updatedGoal)
        this.toastService.showSuccessToast("Valor adicionado com sucesso")
      } else {
        // Vincular transação à meta
        const transaction = await this.transactionService.getTransactionById(this.selectedTransactionId).toPromise()

        if (transaction) {
          await this.goalService.addTransactionToGoal(this.goal.id, transaction.id, transaction.amount)
          this.toastService.showSuccessToast("Transação vinculada com sucesso")
        }
      }

      this.modalController.dismiss({ refresh: true })
    } catch (error) {
      this.toastService.showErrorToast("Erro ao adicionar valor")
      console.error(error)
    }
  }

  async confirmRemoveTransaction(transaction: Transaction) {
    const alert = await this.alertController.create({
      header: "Confirmar remoção",
      message: "Deseja remover esta transação da meta?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Remover",
          role: "destructive",
          handler: () => this.removeTransaction(transaction),
        },
      ],
    })

    await alert.present()
  }

  async removeTransaction(transaction: Transaction) {
    try {
      await this.goalService.removeTransactionFromGoal(this.goal.id, transaction.id, transaction.amount)
      this.toastService.showSuccessToast("Transação removida com sucesso")

      // Atualizar a lista de transações
      this.linkedTransactions$ = this.transactionService
        .getTransactions()
        .pipe(map((transactions) => transactions.filter((t) => this.goal.linkedTransactionIds.includes(t.id))))

      // Atualizar a meta
      this.goal = (await this.goalService.getGoalById(this.goal.id).toPromise()) as Goal
      this.progress = this.goalService.calculateGoalProgress(this.goal)
    } catch (error) {
      this.toastService.showErrorToast("Erro ao remover transação")
      console.error(error)
    }
  }

  dismiss() {
    this.modalController.dismiss()
  }
}
