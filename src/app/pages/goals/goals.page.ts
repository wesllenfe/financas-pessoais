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
  ModalController,
  AlertController,
} from "@ionic/angular/standalone"
import { GoalService } from "../../services/goal.service"
import { Goal, GoalProgress } from "../../models/goal.model"
import { Observable } from "rxjs"
import { addOutline, flagOutline, addCircleOutline, listOutline } from "ionicons/icons"
import { addIcons } from "ionicons"
import { GoalFormComponent } from "src/app/components/goal-form/goal-form.component"
import { GoalTransactionComponent } from "src/app/components/goal-transaction/goal-transaction.component"
import { RouterLink } from "@angular/router"

@Component({
  selector: "app-goals",
  templateUrl: "./goals.page.html",
  styleUrls: ["./goals.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  ],
})
export class GoalsPage implements OnInit {
  goals$!: Observable<Goal[]>

  constructor(
    private goalService: GoalService,
    private modalController: ModalController,
    private alertController: AlertController,
  ) {
    addIcons({addOutline,flagOutline,addCircleOutline,listOutline});
  }

  ngOnInit() {
    this.loadGoals()
  }

  loadGoals() {
    this.goals$ = this.goalService.getGoals()
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadGoals()
      event.target.complete()
    }, 1000)
  }

  async openGoalForm(goal?: Goal) {
    const modal = await this.modalController.create({
      component: GoalFormComponent,
      componentProps: {
        goal: goal,
      },
      cssClass: "goal-form-modal",
    })

    await modal.present()

    const { data } = await modal.onWillDismiss()
    if (data && data.refresh) {
      this.loadGoals()
    }
  }

  getGoalProgress(goal: Goal): GoalProgress {
    return this.goalService.calculateGoalProgress(goal)
  }

  async addTransaction(goal: Goal, event: Event) {
    event.stopPropagation()

    const modal = await this.modalController.create({
      component: GoalTransactionComponent,
      componentProps: {
        goal: goal,
        mode: "add",
      },
      cssClass: "goal-transaction-modal",
    })

    await modal.present()

    const { data } = await modal.onWillDismiss()
    if (data && data.refresh) {
      this.loadGoals()
    }
  }

  async viewTransactions(goal: Goal, event: Event) {
    event.stopPropagation()

    const modal = await this.modalController.create({
      component: GoalTransactionComponent,
      componentProps: {
        goal: goal,
        mode: "view",
      },
      cssClass: "goal-transaction-modal",
    })

    await modal.present()
  }
}

export default GoalsPage
