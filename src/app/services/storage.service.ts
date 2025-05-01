import { Injectable } from "@angular/core"
import { Storage } from "@ionic/storage-angular"

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private _storage: Storage | null = null

  constructor(private storage: Storage) {
    this.init()
  }

  async init() {
    if (this._storage === null) {
      const storage = await this.storage.create()
      this._storage = storage
    }
  }

  async set(key: string, value: any): Promise<any> {
    await this.init()
    return this._storage?.set(key, value)
  }

  async get(key: string): Promise<any> {
    await this.init()
    return this._storage?.get(key)
  }

  async remove(key: string): Promise<any> {
    await this.init()
    return this._storage?.remove(key)
  }

  async clear(): Promise<void> {
    await this.init()
    return this._storage?.clear()
  }

  async keys(): Promise<string[]> {
    await this.init()
    return this._storage?.keys() || []
  }
}
