import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBackButton,
  IonButton,
  IonButtons,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  AlertController,
  IonNote,
  IonCard,
  IonChip,
  IonBadge,
} from "@ionic/angular/standalone";
import { TransactionService } from "../../services/transaction.service";
import { ToastService } from "../../services/toast.service";
import { Transaction } from "../../models/transaction.model";
import { TransactionItemComponent } from "../../components/transaction-item/transaction-item.component";
import { Observable, map } from "rxjs";
import { addOutline, alertCircleOutline, filterOutline, searchOutline } from "ionicons/icons";
import { addIcons } from "ionicons";

@Component({
  selector: "app-transactions",
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonBackButton,
    IonButton,
    IonButtons,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonNote,
    IonCard,
    IonChip,
    IonBadge,
    TransactionItemComponent,
  ],
})
export class TransactionsPage implements OnInit {
  transactions$!: Observable<Transaction[]>;
  filteredTransactions$!: Observable<Transaction[]>;
  selectedFilter: "all" | "income" | "expense" = "all";
  searchTerm = "";

  constructor(
    private transactionService: TransactionService,
    private toastService: ToastService,
    private alertController: AlertController,
    private router: Router,
  ) {
    addIcons({
      "add-outline": addOutline,
      "alert-circle-outline": alertCircleOutline,
      "filter-outline": filterOutline,
      "search-outline": searchOutline,
    });
  }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactions$ = this.transactionService
      .getTransactions()
      .pipe(map((transactions) => transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    this.filterTransactions();
  }

  filterTransactions() {
    this.filteredTransactions$ = this.transactions$.pipe(
      map((transactions) => {
        // Filter by type
        let filtered = transactions;
        if (this.selectedFilter !== "all") {
          filtered = transactions.filter((t) => t.type === this.selectedFilter);
        }

        // Filter by search term
        if (this.searchTerm && this.searchTerm.trim() !== "") {
          const term = this.searchTerm.toLowerCase();
          filtered = filtered.filter(
            (t) => t.description.toLowerCase().includes(term) || t.category.toLowerCase().includes(term),
          );
        }

        return filtered;
      }),
    );
  }

  resetFilters() {
    this.searchTerm = "";
    this.selectedFilter = "all";
    this.filterTransactions();
  }

  editTransaction(transaction: Transaction) {
    this.router.navigate(["/transaction", transaction.id]);
  }

  async confirmDelete(id: string) {
    const alert = await this.alertController.create({
      header: "Confirmar exclusão",
      message: "Tem certeza que deseja excluir esta transação?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary-button",
        },
        {
          text: "Excluir",
          role: "destructive",
          cssClass: "danger-button",
          handler: () => this.deleteTransaction(id),
        },
      ],
      cssClass: "custom-alert",
    });

    await alert.present();
  }

  async deleteTransaction(id: string) {
    try {
      await this.transactionService.deleteTransaction(id);
      this.toastService.showSuccessToast("Transação excluída com sucesso");
    } catch (error) {
      this.toastService.showErrorToast("Erro ao excluir transação");
      console.error(error);
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadTransactions();
      event.target.complete();
    }, 1000);
  }
}
