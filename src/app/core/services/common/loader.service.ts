import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';


/**
 * Service to manager loaders with appropriate messages anywhere with the
 * application components.
 */
@Injectable({
	providedIn: 'root'
})
export class LoaderService {

	constructor(
		public loadingController: LoadingController,
	) { }


	/**
	 * Shows the loader with message and optional css styling
	 *
	 * @param message
	 * @param cssClass
	 */
	showLoader(message?: string,
		cssClass?: string | string[]) {

		this.loadingController.create({
			message,
			cssClass
		}).then((res) => {
			res.present();
		});
	}

	hideLoader() {

		this.loadingController.dismiss().then((res) => {
			console.log('Loading dismissed!', res);
		}).catch((error) => {
			console.log('error', error);
		});
	}

}
