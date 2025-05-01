import { Component } from "@angular/core"
import { IonApp, IonRouterOutlet, Platform } from "@ionic/angular/standalone"
import { StatusBar } from "@capacitor/status-bar"

@Component({
  selector: "app-root",
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp()
  }

  async initializeApp() {
    await this.platform.ready()
    if (this.platform.is("capacitor")) {
      StatusBar.setBackgroundColor({ color: "#3880ff" })
    }
  }
}
