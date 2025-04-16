import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StreamingMedia, StreamingVideoOptions } from '@awesome-cordova-plugins/streaming-media/ngx';
import { ActionSheetController, AlertController, NavController, RefresherCustomEvent } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { ServiceItemState } from 'src/app/definitions/service-item-state.enum';
import { CustomerServiceItem } from 'src/app/models/customer-service-item.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { MediaStreamingService } from 'src/app/core/services/media-streaming/media-streaming.service';

@Component({
  selector: 'app-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.css']
})
export class OrderViewComponent implements OnInit {
  requestId: any;
  itemId: any;
  getAuthState: Observable<AuthState>;
  authData: AuthState;
  item: CustomerServiceItem;
  contactData:any;
  contactEmail: string;
  contactFullName: string;
  contactPhone: string;
  quotesPresent: boolean = false;
  orderMedie = [];
  locationData = [];
  listOfLocations = [];
  pickUp = [];
  dropOff = [];
  intermediate = [];
  refreshEvent: RefresherCustomEvent = null;
  accountId: number

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: true,
    isUserProfileVisible: false,
    headerText: `Order Details`
  };


  private streamingMediaOptions: StreamingVideoOptions = {
    successCallback: () => {
      console.log('Video played');
    },
    errorCallback: (e) => {
      console.log(JSON.stringify(e));
    },
    // orientation: 'landscape',
    shouldAutoClose: false,
    controls: true,
  };

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private mediaStreaming: MediaStreamingService
  ) { this.getAuthState = this.store.select(selectAuthData); }

  async ngOnInit() {
    this.getAuthState.subscribe((authState) => {
      this.authData = authState;
      console.log('authData:', this.authData);
      this.accountId = this.authData?.authMeta?.employee?.accountId
    });

    this.route.paramMap.subscribe(paramMap => {
      this.requestId = paramMap.get('requestId');
      this.itemId = paramMap.get('itemId');
      console.log('ids', typeof this.requestId, typeof this.itemId)

      if(this.requestId !== undefined && this.itemId !== undefined){
        this.getOrderDetails(this.accountId, this.requestId, this.itemId);
      }
    });
  }

  async getOrderDetails(accountId, requestId, itemId) {
    await this.loaderService.createLoading('Loading order details.')
    this.leadHelperService.getOrderDetails(accountId, requestId, itemId).subscribe({
      next: async (data) => {
        this.item = await {...data};
        console.log('order-data', this.item)
        this.contactData = {...this.item?.contact}
        this.headerInfo.headerText = this.item?.projectName;
        this.locationData = this.item?.serviceLocations;
        this.orderMedie = this.item?.media
        this.contactFullName = `${this.contactData?.firstname} ${this.contactData?.lastName}`;
        this.contactEmail = this.contactData?.email;
        this.contactPhone = this.contactData?.phoneNumber
        // quotes
        this.quotesPresent = this.item.status.state !== ServiceItemState.NEW_REQUEST || this.item.status.newQuoteReceived;
        this.getLocations(this.locationData);
        await this.loaderService.dismissLoading()
      },
      error: async err => {
        console.log('error', err);
        await this.loaderService.dismissLoading()
      },
      complete: () => {
        this.closeRefreshUi();
      }
    });
  }


  async presentActionSheet(i) {
    const actionSheet = await this.actionSheetCtrl.create({
      // header: 'Example header',
      // subHeader: 'Example subheader',
      cssClass: 'c-action-sheet',
      buttons: [
        {
          text: `${this.orderMedie[i].fileType.includes('image') ? 'View' : 'Play'
            }`,
          role: 'open',
          data: {
            action: 'open',
          },
          handler: () => {
            console.log('Open clicked');
            this.playMedia(i);
          },
        },
        // {
        //   text: 'Delete',
        //   icon: 'trash-bin-outline',
        //   role: 'destructive',
        //   data: {
        //     action: 'delete',
        //   },
        //   handler: () => {
        //     console.log('Delete clicked');
        //     this.deleteMedia(i);
        //   },
        // },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();

    const result = await actionSheet.onDidDismiss();
    // this.result = JSON.stringify(result, null, 2);
    console.log('result', result);
  }


  getLocations(locations) {
    console.log('locations', locations);
    this.listOfLocations = [...locations];
    this.pickUp = this.listOfLocations.filter(location => {
      if (location.pin === 'pickup' && location.isIntermediate === false) {
        return location;
      }
    });

    this.intermediate = this.listOfLocations.filter(location => {
      if (location.pin === 'intermediate' || location.isIntermediate === true) {
        return location;
      }
    });

    this.dropOff = this.listOfLocations.filter(location => {
      if (location.pin === 'drop' && location.isIntermediate === false) {
        return location;
      }
    });
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.refreshEvent = event;
    this.refreshOrderDetails();
  }

  private refreshOrderDetails() {
    this.getOrderDetails(this.accountId,this.requestId, this.itemId);
  }

  private closeRefreshUi() {
    if (this.refreshEvent) {
      this.refreshEvent.target.complete();
    }
    else {
      this.loaderService.dismissLoading();
    }
  }

  playMedia(mediaIndex: number) {

		this.mediaStreaming.playMedia(this.orderMedie, mediaIndex)
	}


 

}

