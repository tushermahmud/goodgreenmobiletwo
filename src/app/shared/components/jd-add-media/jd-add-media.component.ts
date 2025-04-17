import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonicModule, ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/core/services/common/common.service';
import { LoaderService } from 'src/app/core/services/common/loader.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { SharedModule } from '../../shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jd-add-media',
  templateUrl: './jd-add-media.component.html',
  styleUrls: ['./jd-add-media.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JdAddMediaComponent implements OnInit {

  searchTag: string = null;// ngModel
  selectedRadioButton: string = null;// ngModel
  selectedTag: string = null;

  showNotFoundUi: boolean = false;
  searchQuery: string = null;

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: false,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Tag and Upload`,
  };

  public data = ['Living_Room',' Furniture', 'Decor', 'Lighting',
    'Bed', 'Dresser', 'Nightstand',
    'Bedroom', 'Bed', 'Dresser', 'Nightstand',
    'Kitchen', 'Cabinets', 'Countertops', 'Appliances',
    'Bathroom', 'Shower', 'Tub', 'Sink',
    'Dining_Room', 'Table', 'Chairs', 'Lighting',
    'Office', 'Desk', 'Chair', 'Bookshelves',
    'Storage', 'Closet', 'Shelving', 'Boxes',
    'Garage', 'Cars', 'Tools', 'Storage',
    'Outdoor', 'Patio', 'Deck', 'Yard',
    'Entryway', 'Door', 'Foyer', 'Lighting'];
  public results = [...this.data];

  constructor(
    private modalController: ModalController,
    private commonService: CommonService,
    private mediaService: MediaUploadService,
    private loaderServie: IonLoaderService,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {  

    this.mediaService.triggerUploadObs$.subscribe(async (data) => {
      if(data.upload ) {
       this.onClose(data);
      }
    })

  }

  onClose(data?: any) {
    if(data) {
      data['tag'] = this.selectedTag;
      this.modalController.dismiss(data);
    } else {
      this.modalController.dismiss();
    }
  }

  handleChange(event) {
    console.log('this.searchBar.nativeElement',this.searchTag)
    if(this.searchTag === '' || this.searchTag === null) {
      this.results = [...this.data];
      return false;
    }
    const query = event.target.value.toLowerCase();
    this.results = this.data.filter(d => d.toLowerCase().indexOf(query) > -1);
    console.log('this.results', this.results, query)
    if(this.results.length === 0 && !this.results.length) {
      this.results = [...this.data]
      this.showNotFoundUi = true;
      this.searchQuery = query;
    }    
  }

  addTag() {
    this.data.unshift(this.searchTag);
    this.selectedRadioButton = this.searchTag;
    this.data = [...this.data];

    this.searchTag = null;
    this.showNotFoundUi = false;
  }

  onSelectedTag(event) {
    console.log('tag', event.detail.value);
    this.selectedTag = event.detail.value;
  }

  async uploadMedia(){
    console.log('this.constructor.name', this.constructor.name);
    // await this.loaderServie.createLoading('loading media..')
    await this.mediaService.selectAndUploadMediaFromGallery( 'JobMediaComponent' , true , null);
  }

  async mediaUploadActionSheet() {
		const actionSheet = await this.actionSheetCtrl.create({
		  header: 'Choose how to upload media',
		  subHeader: `Add media`,
		  buttons: [
			
			{
			 	text: 'Upload',
				handler: () => {
					this.uploadMedia();
				}
				
			},
			{
			  	text: 'Capture image',
				handler: () => {
					console.log('trigger capture image');
					this.mediaService.captureImage(this.constructor.name).then(() => {
						console.log('Sent to upload');
						
					});;
				}
		
			},
			{
				text: 'Capture video',
				handler: () => {
					console.log('trigger capture video');
					this.mediaService.captureVideo(this.constructor.name).then(() => {
						console.log('Sent to upload');
						
					});
				}
			},
			{
			  text: 'Cancel',
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
		// console.log('result',result);
		
	}
}
