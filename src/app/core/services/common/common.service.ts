import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;
const ALLOWED_VIDEO_MIME_TYPE_3GPP = 'video/3gpp';
const ALLOWED_VIDEO_MIME_TYPE_MP4 = 'video/mp4';
const ALLOWED_VIDEO_MIME_TYPE_MOV = 'video/quicktime';
const ALLOWED_IMAGE_MIME_TYPE_JPEG = 'image/jpeg';
const ALLOWED_IMAGE_MIME_TYPE_JPG = 'image/jpg';
const ALLOWED_IMAGE_MIME_TYPE_PNG = 'image/png';
@Injectable({
	providedIn: 'root'
})
export class CommonService {

	
	orderItemData = new BehaviorSubject<any>({});
	serviceRequestInfo: BehaviorSubject<any> = new BehaviorSubject<any>({});
	refreshMedia: BehaviorSubject<boolean> = new BehaviorSubject(false);

    refreshMediaObs$ = this.refreshMedia.asObservable()
	serviceRequestInfo$ = this.serviceRequestInfo.asObservable();


	shouldUpdateFormData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	// announceUploadDone: BehaviorSubject<any> = new BehaviorSubject(null);
	// public announceUploadDoneObs$ = this.announceUploadDone.asObservable();
	shouldUpdateFormData$ = this.shouldUpdateFormData.asObservable();

	refreshJobDetails: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	announceJdRefreshObs$ = this.refreshJobDetails.asObservable();


	refreshCurrentJobCard: BehaviorSubject<any> = new BehaviorSubject<any>(false);
	announceCurrentCardRefresh$ = this.refreshCurrentJobCard.asObservable()

	constructor(
		public loadingController: LoadingController,
		private toastController: ToastController,
	) { }

	setServiceRequestInfo(data: any) {
		this.serviceRequestInfo.next(data);
	}

	setOrderItemData(data) {
		this.orderItemData.next(data);
	}

	sendFormData(formData) {
		this.shouldUpdateFormData.next(formData)
	}

	getOrderItemData() {
		return this.orderItemData.asObservable();
	}

	refreshCurrentJob(data:boolean) {
		this.refreshCurrentJobCard.next(data)
	}

	refreshJobDetail(date) {
		this.refreshJobDetails.next(date)
	}

	async showLoader(msg: string) {
		await this.loadingController.create({
			message: msg,
		}).then(res => {
			res.present();
		});

	}

	async hideLoader() {
		await this.loadingController.dismiss();
	}

	// toast message
	async showToast(msg: string, duration = 2000) {
		const toast = await this.toastController.create({
			message: msg,
			duration,
		});

		await toast.present();
	}

	 /**
     * checks for allowed image formats by the codova-media-capture plugin
     *
     * @param type
     * @returns
     */
	  allowedImageFormats(type: any) {

        return (type === ALLOWED_IMAGE_MIME_TYPE_PNG || type === ALLOWED_IMAGE_MIME_TYPE_JPG || type === ALLOWED_IMAGE_MIME_TYPE_JPEG);
    }

	announceMediaRefresh(){
		this.refreshMedia.next(true)
	}


  /**
   * - when lead or helper clicks on start job open a popup and 
   *  take signature and convert it to base 64 and return a payload with all the details 
   */
   getStartOrEndJobPaload(meta:any) {
    let data = {
      customerSignature: meta.customerSIgnature,
      geoLat: meta.geoLat,
      geoLng: meta.geoLng,
      remarks: meta.remarks,
      media: [],
      time: meta.time
    }

    meta.media.forEach(media => {
      let newMedia = { 
        accessLink: media.accessLink ,
        fileType: media.fileType,
        thumbnailUrl: media.thumbnail,
        tag: null
      }
      data.media.push(newMedia)

    })

    return data;
  }

}
