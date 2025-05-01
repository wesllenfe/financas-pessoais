import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import { StorageService } from "./storage.service"

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private THEME_KEY = "dark-mode"
  private _darkMode = new BehaviorSubject<boolean>(false)
  darkMode$ = this._darkMode.asObservable()

  constructor(private storageService: StorageService) {
    this.loadTheme()
  }

  async loadTheme() {
    const isDarkMode = (await this.storageService.get(this.THEME_KEY)) || false
    this._darkMode.next(isDarkMode)
    this.applyTheme(isDarkMode)
  }

  async toggleDarkMode() {
    const newValue = !this._darkMode.value
    await this.storageService.set(this.THEME_KEY, newValue)
    this._darkMode.next(newValue)
    this.applyTheme(newValue)
  }

  private applyTheme(isDark: boolean) {
    document.body.classList.toggle("dark", isDark)
  }
}
