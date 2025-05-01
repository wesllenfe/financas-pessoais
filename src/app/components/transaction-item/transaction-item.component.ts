import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Transaction } from "../../models/transaction.model";
import {
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAvatar,
  IonChip,
  IonButton
} from "@ionic/angular/standalone";
import { RouterLink } from "@angular/router";
import { DatePipe, CurrencyPipe, NgClass } from "@angular/common";
import {
  pencilOutline,
  trashOutline,
  cartOutline,
  walletOutline,
  cardOutline,
  homeOutline,
  medicalOutline,
  schoolOutline,
  fastFoodOutline,
  carOutline,
  cashOutline,
} from "ionicons/icons";
import { addIcons } from "ionicons";

@Component({
  selector: "app-transaction-item",
  templateUrl: './transaction-item.component.html',
  styleUrls: ['./transaction-item.component.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonButton,
    IonLabel,
    IonNote,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonAvatar,
    IonChip,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    NgClass,
  ],
})
export class TransactionItemComponent {
  @Input() transaction!: Transaction;
  @Output() edit = new EventEmitter<Transaction>();
  @Output() delete = new EventEmitter<string>();

  constructor() {
    addIcons({
      "pencil-outline": pencilOutline,
      "trash-outline": trashOutline,
      "cart-outline": cartOutline,
      "wallet-outline": walletOutline,
      "card-outline": cardOutline,
      "home-outline": homeOutline,
      "medical-outline": medicalOutline,
      "school-outline": schoolOutline,
      "fast-food-outline": fastFoodOutline,
      "car-outline": carOutline,
      "cash-outline": cashOutline,
    });
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
    };

    return categoryIcons[category] || "cart-outline";
  }
}
