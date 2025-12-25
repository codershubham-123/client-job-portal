import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppConfig  {
  private config: any;

  loadConfig(): Promise<void> {
    return fetch('/config.json')
      .then(response => response.json())
      .then(data => {
        this.config = data;
      });
  }

  get apiUrl() {
    return this.config?.apiUrl;
  }
}
