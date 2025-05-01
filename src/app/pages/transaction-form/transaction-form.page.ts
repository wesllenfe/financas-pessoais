import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonBackButton,
  IonButtons,
  IonDatetime,
  IonModal,
  IonDatetimeButton,
  IonIcon,
  IonCard,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/angular/standalone";
import { TransactionService } from "../../services/transaction.service";
import { ToastService } from "../../services/toast.service";
import { Transaction } from "../../models/transaction.model";
import { Observable, firstValueFrom } from "rxjs";
import {
  calendarOutline,
  saveOutline,
  cashOutline,
  walletOutline,
  cardOutline,
  cartOutline,
  arrowUpOutline,
  arrowDownOutline,
} from "ionicons/icons";
import { addIcons } from "ionicons";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";

@Component({
  selector: "app-transaction-form",
  templateUrl: './transaction-form.page.html',
  styleUrls: ['./transaction-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonBackButton,
    IonButtons,
    IonDatetime,
    IonModal,
    IonDatetimeButton,
    IonIcon,
    IonCard,
    IonChip,
    IonGrid,
    IonRow,
    IonCol,
    NgxMaskDirective,
  ],
  providers: [provideNgxMask()],
})
export class TransactionFormPage implements OnInit {
  transaction: Partial<Transaction> = {
    description: "",
    amount: 0,
    type: "expense",
    category: "",
    date: new Date().toISOString(),
  };

  displayAmount = "";
  categories$!: Observable<string[]>;
  isEditing = false;

  constructor(
    private transactionService: TransactionService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    addIcons({
      "calendar-outline": calendarOutline,
      "save-outline": saveOutline,
      "cash-outline": cashOutline,
      "wallet-outline": walletOutline,
      "card-outline": cardOutline,
      "cart-outline": cartOutline,
      "arrow-up-outline": arrowUpOutline,
      "arrow-down-outline": arrowDownOutline,
    });
  }

  async ngOnInit() {
    this.categories$ = this.transactionService.getCategories();

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditing = true;
      const transactionData = await firstValueFrom(this.transactionService.getTransactionById(id));
      if (transactionData) {
        this.transaction = { ...transactionData };
        // Formata o valor para exibição
        if (this.transaction.amount) {
          this.displayAmount = this.transaction.amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
        }
      } else {
        this.toastService.showErrorToast("Transação não encontrada");
        this.router.navigate(["/transactions"]);
      }
    }
  }

  formatCurrency(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = (Number(value) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    this.displayAmount = value;
  }

  updateAmount() {
    if (this.displayAmount) {
      const value = this.displayAmount.replace('R$', '').trim().replace('.', '').replace(',', '.');
      this.transaction.amount = parseFloat(value) || 0;
    } else {
      this.transaction.amount = 0;
    }
  }

  async saveTransaction() {
    try {
      if (this.isEditing && this.transaction.id) {
        await this.transactionService.updateTransaction(this.transaction as Transaction);
        this.toastService.showSuccessToast("Transação atualizada com sucesso");
      } else {
        await this.transactionService.addTransaction(
          this.transaction as Omit<Transaction, "id" | "createdAt" | "updatedAt">,
        );
        this.toastService.showSuccessToast("Transação adicionada com sucesso");
      }
      this.router.navigate(["/transactions"]);
    } catch (error) {
      this.toastService.showErrorToast("Erro ao salvar transação");
      console.error(error);
    }
  }
}
