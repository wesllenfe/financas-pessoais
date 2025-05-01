import { Injectable } from "@angular/core"
import { ToastController } from "@ionic/angular/standalone"

@Injectable({
  providedIn: "root",
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async showToast(message: string, duration = 2000, position: "top" | "middle" | "bottom" = "bottom") {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      cssClass: "toast-message",
    })
    await toast.present()
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: "bottom",
      color: "success",
      cssClass: "toast-success",
    })
    await toast.present()
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: "bottom",
      color: "danger",
      cssClass: "toast-error",
    })
    await toast.present()
  }
}
