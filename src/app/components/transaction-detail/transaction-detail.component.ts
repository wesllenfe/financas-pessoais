import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonButtons,
} from "@ionic/angular/standalone";
import { Transaction } from "../../models/transaction.model";
import { closeOutline } from "ionicons/icons";
import { addIcons } from "ionicons";

@Component({
  selector: "app-transaction-detail",
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonButton,
    IonIcon,
    IonButtons,
  ],
})
export class TransactionDetailComponent implements OnInit {
  @Input() transaction!: Transaction;
  @Input() dismiss!: () => void;

  constructor() {
    addIcons({ "close-outline": closeOutline });
  }

  ngOnInit() {}
}
