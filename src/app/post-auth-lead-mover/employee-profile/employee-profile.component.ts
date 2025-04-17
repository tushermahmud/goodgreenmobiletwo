import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Camera,CameraOptions} from '@awesome-cordova-plugins/camera/ngx';
import { FileTransfer, FileTransferObject ,FileUploadOptions} from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { CaptureImageOptions, MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { ActionSheetController, AlertController, IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';
import phone from 'phone';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { DevicePlatform } from 'src/app/definitions/device-platform.enum';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';0
import { deleteProfilePic, updateEmployeeProfileInfo, updateProfilePic} from 'src/app/state/auth/auth.actions';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

declare var google;

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmployeeProfileComponent implements OnInit {

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Profile`,
  };

  submitted: boolean = false;
  googleAutocomplete: any;
  address: any;
  lat: string;
  long: string;
  placeid:any;
  profileUrl: string;
  authMeta: AuthMeta;
  selectedImage: any;
  //image
  capturedImage = null;
  handlerMessage = '';

  employee = {
    accountId: 0,
    employeeId: '',
    role: '',
    baName: '',
    baPhoneNumber: ''
  };

  profileForm: FormGroup;
  isEditMode: boolean = false;
  getAuthState: Observable<AuthState>;
  authData: AuthState;
  autocomplete: { input: string };
  autocompleteItems: any[];
  loginUserData: any;

  currAppName = '';
  currAppVersion = '';

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private loaderService: IonLoaderService,
    private leadHelperService: LeadHelperService,
    public zone: NgZone,
    private nativeGeocoder: NativeGeocoder,
    private commonService: CommonService,
    private actionSheetController: ActionSheetController,
    private camera:Camera,
    private permissionService: PermissionManagerService,
    private file: File,
    private mediaCapture: MediaCapture,
    private webview: WebView,
    private authService: AuthService,
    private fileTransfer: FileTransfer,
    private storageService: StorageService,
    private alertController:AlertController,
    private appVersion:AppVersion
  ) {
    this.getAuthState = this.store.select(selectAuthData);
    this.googleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  async ngOnInit() {

    this.getAuthState.subscribe((authData) => {
      this.authData = authData;
      if(this.authData.isAuthenticated) {

        this.loginUserData = this.authData?.authMeta?.employee;
        console.log('this.loginUserData', this.loginUserData);
        this.authMeta = authData.authMeta;
        this.profileUrl = "../../../../assets/images/header/default-user-avatar.svg";
  
        this.employee.accountId = this.loginUserData?.accountId;
        this.employee.role = this.loginUserData?.role;
        this.employee.baName = this.authData.authMeta.business?.name;
        this.employee.baPhoneNumber = this.authData.authMeta.business?.phoneNumber;
      }
    });

    this.profileForm = this.formBuilder.group({
      firstName: [this.loginUserData.firstname, Validators.required],
      lastName: [this.loginUserData.lastname, Validators.required],
      phoneNumber: [this.loginUserData.phoneNumber, Validators.required],
      email: [this.loginUserData.email, [Validators.required, Validators.email]],
      address: [this.loginUserData.address, Validators.required],
      city: [this.loginUserData.city, Validators.required],
      state: [this.loginUserData.state, Validators.required],
      country: [this.loginUserData.country, Validators.required],
      zipCode: [this.loginUserData.zipcode, Validators.required],
    });

    // app and version name
    this.currAppName = await this.appVersion.getAppName() || 'Good Green';
    this.currAppVersion = await this.appVersion.getVersionNumber();
  }

  get profileControls() { return this.profileForm.controls; }


  editPersonalInfo() {
    this.isEditMode = !this.isEditMode;
  }

  cancelEdit() {
    this.isEditMode = false;
  }

  saveUserProfileData(formValue) {
    this.submitted=true;
    if (!this.profileForm.valid) {
      return;
    }

    
    console.log('data', formValue)
    let payload = {
      firstname: formValue.firstName,
      lastname: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      address: formValue.address,
      city: formValue.city,
      state: formValue.state,
      country: formValue.country,
      zipcode: formValue.zipCode
    }

    this.updateUserProfileDetails(payload);
    this.submitted=false;
  }


  updateUserProfileDetails(payload) {
    this.loaderService.createLoading('updating profile info..');
    this.leadHelperService.updateUserProfile(this.loginUserData.userId, payload).subscribe({
      next: data => {
        console.log('profileDataUpdated', data);
        this.store.dispatch(
          updateEmployeeProfileInfo({
            payload: data,
          })
        );
        // this.commonService.showToast('Your profile information has been updated!');
        this.isEditMode = false;
        this.loaderService.dismissLoading();
      },
      error: err => {
        console.log('error', err)
        this.loaderService.dismissLoading();
      }
    })
  }


  updateSearchResults(addrs) {
    this.autocomplete.input = addrs;
    if (this.autocomplete.input === '') {
      this.autocompleteItems = [];
      this.clearAutocomplete();
      return;
    }
    this.googleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }

  selectSearchResult(item) {
    this.placeid = item.place_id;
    this.address = item;
    this.getCoordsFromAddress(item.description);
}

  getCoordsFromAddress(address) {
    const options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.forwardGeocode(address, options).then((result: NativeGeocoderResult[]) => {
      console.log(result, this.address);
      this.zone.run(() => {
        this.lat = result[0].latitude;
        this.long = result[0].longitude;
        /** decoding autocomplete data */
        const addressData = {
          address: this.address?.structured_formatting?.main_text,
          city: result[0].locality,
          state: result[0].administrativeArea,
          zipCode: result[0].postalCode,
          country: result[0].countryName,
        };
        this.profileForm.patchValue(addressData);
        this.clearAutocomplete();
      });
    })
      .catch((error: any) => console.log(error));
  }


  clearAutocomplete() {
    this.autocompleteItems = [];
    this.autocomplete.input = '';
  }


  //numeric validation
  alphanumericValidation(event) {
    if (event && String.fromCharCode(event.charCode).match(/[0-9-( )]/)) {
      return event.charCode
    } else {
      return event.preventDefault();
    }
  }


  //phone number validations
  validateContactPhoneNumber(event) {
    const number = event.target.value;
    let { isValid, phoneNumber } = phone(number, { country: 'USA' })
    if (isValid) {
      this.profileForm.controls["phoneNumber"].patchValue(phoneNumber);
    }
  }


  //zipcode validations
  noDecimal(event) {
    if (event && String.fromCharCode(event.charCode).match(/[0-9]/)) {
      return event.CharCode
    } else {
      return event.preventDefault();
    }
  }


  async presentProfilePicOptions() {
    if(this.profileUrl === '' || this.profileUrl === null ){
      const actionSheet = await this.actionSheetController.create({
        // header: 'Albums',
        cssClass: 'c-action-sheet',
        buttons: [
          {
            text: 'Upload from gallery',
            role: 'destructive',
            icon: 'cloud-upload-outline',
            id: 'delete-button',
            data: {
              type: 'delete',
            },
            handler: () => {
              console.log('Delete clicked');
              this.uploadExistingHandler();
            },
          },
          {
            text: 'Capture',
            role: 'destructive',
            icon: 'camera-outline',
            id: 'delete-button',
            data: {
              type: 'delete',
            },
            handler: () => {
              console.log('Delete clicked');
              this.captureImageHandler();
            },
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            },
          },
        ],
      });
      await actionSheet.present();
  
      const { role, data } = await actionSheet.onDidDismiss();
      console.log('onDidDismiss resolved with role and data', role, data);
    } else {
      const actionSheet = await this.actionSheetController.create({
        // header: 'Albums',
        cssClass: 'c-action-sheet',
        buttons: [
          {
            text: 'Upload from gallery',
            role: 'destructive',
            icon: 'cloud-upload-outline',
            id: 'delete-button',
            data: {
              type: 'delete',
            },
            handler: () => {
              console.log('Delete clicked');
              this.uploadExistingHandler();
            },
          },
          {
            text: 'Capture',
            role: 'destructive',
            icon: 'camera-outline',
            id: 'delete-button',
            data: {
              type: 'delete',
            },
            handler: () => {
              console.log('Delete clicked');
              this.captureImageHandler();
            },
          },
          {
            text: 'Delete',
            icon: 'trash-bin-outline',
            data: 10,
            handler: () => {
              console.log('Share clicked');
              this.presentDeleteProfilePictureAlert()
            },
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            },
          },
        ],
      });
      await actionSheet.present();

      const { role, data } = await actionSheet.onDidDismiss();
      console.log('onDidDismiss resolved with role and data', role, data);
    }
  }


  async uploadExistingHandler() {
    let destinationType = this.camera.DestinationType.FILE_URI; // default to android
    if (this.permissionService.CurrentPlatform == DevicePlatform.IOS) {
      destinationType = this.camera.DestinationType.NATIVE_URI; // for iOS
    }
    const options: CameraOptions = {
      quality: 100,
      destinationType: destinationType,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    };
    console.log('Selected Image Options===>', options);
    
    await this.camera
      .getPicture(options)
      .then(async (selecedImg) => {
        if (!selecedImg) return;
        console.log('seleced Img present ===>',selecedImg);
        console.log('this.selectedImage', this.selectedImage);
        
        const filename = selecedImg.substr(selecedImg.lastIndexOf('/') + 1);
        console.log('seleced Img File name ===>',filename);

        let dirpath = selecedImg.substr(0, selecedImg.lastIndexOf('/') + 1);
        console.log('seleced Img File dirpath ===>',dirpath);
        
        dirpath = dirpath.includes("file://") ? dirpath : "file://" + dirpath;
        console.log('FINAL seleced Img File dirpath ===>',dirpath);

        try {
          const dirUrl = await this.file.resolveDirectoryUrl(dirpath);
          console.log('dirUrl ==>>', dirUrl);
          
          var retrievedFile = await this.file.getFile(dirUrl, filename, {});
          console.log('retrievedFile ==>>', retrievedFile);
          this.selectedImage = retrievedFile;
        } catch (err) {
          console.log('error resolving selected media path from gallery', err);
          throw err;
        }

        retrievedFile.file(async (data: any) => {
          console.log('retrievedFiledata ==>', data);

          if (this.commonService.allowedImageFormats(data.type)) {
            this.capturedImage = null;
            this.capturedImage = data;
            this.capturedImage['fullPath'] = dirpath;
            this.capturedImage['localURL'] = this.sanitizedPathForImage(
              data.localURL
            );
            this.capturedImage['thumbnail'] = this.sanitizedPathForImage(
              data.localURL
            );

            console.log('this.capturedImage', this.capturedImage);
            //get s3 location and upload
            // update store
            // this.uploadUserProfileImage(this.capturedImage);
          }
        });

        console.log('mediaUrl', selecedImg);
        console.log('dirpath', dirpath);
      })
      .catch((err) => {
        console.log('getPicture', err);
      });
  }


  async captureImageHandler() {
    let options: CaptureImageOptions = { limit: 1 };

    await this.mediaCapture.captureImage(options).then(
      (image) => {
        console.log('image', image);
        this.capturedImage = image[0];
        this.capturedImage['fullPath'] = 'file://' + image[0].fullPath;
        this.capturedImage['localURL'] = this.sanitizedPathForImage(
          image[0].fullPath
        );
        this.capturedImage['thumbnail'] = this.sanitizedPathForImage(
          image[0].fullPath
        );

        console.log('this.capturedImage ', this.capturedImage);

        this.uploadUserProfileImage(this.capturedImage);
      },
      (err) => {
        console.error('image capture error:', JSON.stringify(err));
      }
    );
  }


  async uploadUserProfileImage(capturedImage) {
    try {
    	console.log('uploading image file:', capturedImage);
      await this.loaderService.createLoading('Please wait while we change your profile image..')
    	let uploadLocationPayload = {
    		fileTitle: capturedImage.name
    	};
    	const uploadLocations = this.authService.addUserProfileImage(`customers` , this.authData.authMeta.customer.id , uploadLocationPayload);

      uploadLocations.subscribe(async uploadLocationRes => {
        console.log('uploadLocations:',uploadLocationRes);

        const contentType = { 'Content-Type': 'image/jpeg' };
        const ft: FileTransferObject =  this.fileTransfer.create()

        const options: FileUploadOptions = {
          httpMethod: uploadLocationRes[0].httpMethod,
          headers: contentType,
          fileKey: 'image',
          fileName: capturedImage.name,
          mimeType: 'image/jpeg',
          chunkedMode: false
        };

        let upload = await ft.upload(this.selectedImage.nativeURL, uploadLocationRes[0].uploadUrl , options, true);

        if(upload) {
          console.log('UPLOAD SUCCESS FILE RES', upload);
          this.store.dispatch(
            updateProfilePic({
              payload: uploadLocationRes[0]?.accessLink,
            })
          );
          this.profileUrl = uploadLocationRes[0]?.accessLink;
          await this.storageService.updateUserProfileData(uploadLocationRes[0].accessLink);
          this.saveInfoToBE(uploadLocationRes);
          
        }

      }, err => {
        console.log(err);
        this.loaderService.dismissLoading();
      });
    	
    }
    catch (err) {
      if(err) {
        this.loaderService.dismissLoading();
        console.log('image upload to S3 error:', JSON.stringify(err));
        throw err;
      }
    }

  
  }


  saveInfoToBE(locationData) {
    let payload = {
      imageUrl: locationData[0]?.accessLink,
    };
    this.profileUrl = this.authMeta.profileUrl;

    this.authService.saveProfileImage(this.employee?.accountId, payload).subscribe({
      next: (resP) => {
        this.store.dispatch(
          updateProfilePic({
            payload: locationData[0]?.accessLink,
          })
        );
        // this.loaderService.dismissLoading()
        this.storageService.updateUserProfileData(locationData[0].accessLink);
        
        this.loaderService.dismissLoading();
      },
      error: (err: HttpErrorResponse) => {
        console.log('saveProfileImage err', err);
        if(err.status === 200){
          this.store.dispatch(
            updateProfilePic({
              payload:locationData[0].accessLink,
            })
          );
          this.storageService.updateUserProfileData(locationData[0].accessLink);
          console.log('AUTH DATA AFTER UPLOAD ERR', this.authMeta, this.authData)
          // this.loaderService.dismissLoading();
        }
        this.loaderService.dismissLoading();
      },
    });
  }


  async presentDeleteProfilePictureAlert() {
    const alert = await this.alertController.create({
      header: 'Delete Profile Image',
      subHeader: 'Are you sure?',
      message:
        'Your profile image will not be used or shared with any external source. Are you sure, you want to delete it?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.handlerMessage = 'Alert canceled';
            console.log('Cancle!!!');
          },
        },
        {
          text: 'Confirm Delete',
          role: 'destructive',
          handler: () => {
            this.handlerMessage = 'Alert confirmed';
            console.log('Confirm!!!');
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    // this.roleMessage = `Dismissed with role: ${role}`;
    role === 'destructive' ? this.deleteProfileImage(this.authMeta.userId) : null;
  }


  async deleteProfileImage(userId) {
    await this.loaderService.createLoading('deleting profile image')

    this.authService.deleteProfileImage(userId).subscribe({
      next: (res) => {
        // detete from localstorage 
        this.profileUrl = null
        this.store.dispatch(
          deleteProfilePic()
        );
        this.loaderService.dismissLoading()
      },
      error: (err) => {
        console.log('err', err);
        this.loaderService.dismissLoading()
        this.commonService.showToast(`Error while deleting profile image , Please try again!`);
      }
    })
  }


  private sanitizedPathForImage(imagePath: string) {
    return !imagePath ? '' : this.webview.convertFileSrc(imagePath);
  }

  async showComingSoon() {
    const alert = await this.alertController.create({
       header: 'Coming Soon',
       message: 'This feature is coming soon. Stay tuned for updates!!',
       buttons: ['OK'],
     });
     await alert.present();
   }

}
