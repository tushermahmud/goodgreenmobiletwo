import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class IonLoaderService {
  private loading: HTMLIonLoadingElement;


    constructor(
        public loadingController: LoadingController
    ) { }

    async createLoading(message: string = null) {
      this.loading = await this.loadingController.create({
        message: message,
        translucent: true,
        cssClass: 'primary',
        spinner: 'bubbles',
        duration: 8000 
      });
      await this.loading.present();
    }

    async dismissLoading() {
      if (this.loading) {
        await this.loading.dismiss();
      }
    }

    
}
