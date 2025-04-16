import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import {
  FileTransfer,
  FileTransferObject,
  FileUploadOptions,
} from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import {
  CaptureImageOptions,
  MediaCapture,
} from '@awesome-cordova-plugins/media-capture/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import {
  NativeGeocoder,
  NativeGeocoderOptions,
  NativeGeocoderResult,
} from '@ionic-native/native-geocoder/ngx';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { CommonService } from 'src/app/core/services/common/common.service';
import { PermissionManagerService } from 'src/app/core/services/permissions/permission-manager.service';
import { DevicePlatform } from 'src/app/definitions/device-platform.enum';
import { MediaUploadLocation } from 'src/app/definitions/media-upload-location.interface';
import { Customer } from 'src/app/models/customer.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import {
  deleteProfilePic,
  signOut,
  updateProfileInfo,
  updateProfilePic,
} from 'src/app/state/auth/auth.actions';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AlertController } from '@ionic/angular';
import { AuthState } from 'src/app/state/auth/auth.state';
import { changeGetStarted } from 'src/app/state/order/order.actions';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import phone from 'phone';

// eslint-disable-next-line no-var
declare var google;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  providers: [Camera],
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {

  currAppVersion = '';
  currAppName = 'Good Green';
  autocomplete: { input: string };
  autocompleteItems: any[];
  placeid: any;
  googleAutocomplete: any;

  address: any;
  lat: string;
  long: string;

  getAuthState: Observable<AuthState>;
  authData: AuthState;
  authMeta: AuthMeta;
  customer: Customer;
  profileUrl: string;
  accountStatus: string;

  heraderInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: true,
    isUserProfileVisible: false,
    headerText: `Account Details`,
  };

  userProfileForm: FormGroup;

  isProfileDatEdited = false;
  isSubmitted = false;
  isEditable = false;

  //image
  capturedImage = null;

  // alert
  handlerMessage = '';
  roleMessage = '';
  selectedImage: any;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private store: Store<AppState>,
    private permissionService: PermissionManagerService,
    private nativeGeocoder: NativeGeocoder,
    public zone: NgZone,
    private fileTransfer: FileTransfer,
    private file: File,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private commonService: CommonService,
    private webview: WebView,
    private actionSheetController: ActionSheetController,
    private mediaCapture: MediaCapture,
    private camera: Camera,
    private storageService: StorageService,
    private loaderService: IonLoaderService,
    private appVersion: AppVersion,
    private loadingController: LoadingController,
    // private ionRouter: 
  ) {
    this.getAuthState = this.store.select(selectAuthData);
    this.googleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  async ngOnInit() {

    this.buildUserProfileForm();

    this.getAuthState.subscribe((authState) => {
      console.log('authData =====>', authState);
      if (!authState.isAuthenticated) {
        return;
      }
      this.authData = authState;
      this.authMeta = authState.authMeta;
      // this.buildUserProfileForm();
      this.customer = authState?.authMeta?.customer;
      this.profileUrl = this.authMeta?.profileUrl;

      this.accountStatus = authState?.authMeta?.customer?.accountStatus;

      this.userProfileForm.patchValue({
        firstname: this.customer.firstname,
        lastname: this.customer.lastname,
        phonenumber: this.customer.phoneNumber,
        email: this.customer.email,

        //billing
        address: this.customer.address,
        city: this.customer.city,
        state: this.customer.state,
        country: this.customer.country,
        zipCode: this.customer.zipcode,
      });

      this.userProfileForm.disable();
      // this.profileUrl = this.profileUrl
      
    });
    
    this.userProfileForm.valueChanges.subscribe({
      next: (changedData) => {
        console.log('changedData', changedData);
        this.isProfileDatEdited = true;
      },
    });

    await this.permissionService.waitTillReady();

    // app and version name
    this.currAppName = await this.appVersion.getAppName() || 'Good Green';
    this.currAppVersion = await this.appVersion.getVersionNumber();
    console.log(`app:${this.currAppName} version: ${this.currAppVersion}`);

  }

  ionViewWillEnter() {
    this.getAuthState.subscribe((authState) => {
      if (!authState.isAuthenticated) {
        return;
      }
      this.authData = authState;
      this.authMeta = authState.authMeta;
      // this.buildUserProfileForm();
      this.customer = authState.authMeta?.customer;
      this.profileUrl = this.authMeta?.profileUrl;

      this.accountStatus = authState.authMeta.customer?.accountStatus;

    })
  }

  get f() {
    return this.userProfileForm.controls;
  }

  buildUserProfileForm() {
    this.userProfileForm = this.formBuilder.group({
      // contact info
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      phonenumber: ['', [Validators.required]],
      email: ['', [Validators.required]],

      //billing
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: [''],
      zipCode: ['', [Validators.required]],
    });
  }

  // ionViewDidEnter() {
  //   this.userProfileForm.valueChanges.subscribe({
  //     next: (changedData) => {
  //       console.log('changedData', changedData);
  //       this.isProfileDatEdited = true;
  //     },
  //   });
  // }

  ionViewWillLeave() {
    this.authData = null;
    this.authMeta = null;
    this.customer = null;
    this.profileUrl = null;
    this.accountStatus = null;
  }

  saveInfo() {

    this.isSubmitted = true;
    if (!this.userProfileForm.valid) return;

    const formvalues = this.userProfileForm.value;
    const updatePayload = {
      firstname: formvalues.firstname,
      lastname: formvalues.lastname,
      address: formvalues.address,
      city: formvalues.city,
      state: formvalues.state,
      country: formvalues.country,
      zipcode: formvalues.zipCode,
      phonenumber: formvalues.phonenumber,
    };
    console.log('updatePayload ===>>>', updatePayload);
    // return
    this.authService
      .updateProfileInfo(this.customer.id, updatePayload)
      .subscribe({
        next: (updatedRes) => {
          this.store.dispatch(
            updateProfileInfo({
              payload: updatedRes,
            })
          );
          this.commonService.showToast('Your profile information has been updated!');
          this.isProfileDatEdited = false;
        },
        error: (err) => {
          console.log('err===>>>', err);
        },
      });
  }

  searchAddress(address) {
    this.autocomplete.input = address;
    console.log('address', address.value);

    if (this.autocomplete.input === '') {
      this.clearAutocomplete();
      return;
    }
    this.googleAutocomplete.getPlacePredictions(
      { input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      }
    );

    console.log('this.autocompleteItems', this.autocompleteItems);
  }

  clearAutocomplete() {
    this.autocompleteItems = [];
    this.autocomplete.input = '';
  }

  selectSearchResult(item) {
    // console.log(item.getPlace());
    // alert(JSON.stringify(item));
    this.placeid = item.place_id;
    this.address = item;
    this.getCoordsFromAddress(item.description);
  }

  getCoordsFromAddress(address) {
    const options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5,
    };

    this.nativeGeocoder
      .forwardGeocode(address, options)
      .then((result: NativeGeocoderResult[]) => {
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
          this.userProfileForm.patchValue(addressData);
          this.clearAutocomplete();
        });
      })
      .catch((error: any) => console.log(error));
  }

  cancleEdit() {
    this.isProfileDatEdited = false;
    this.enableEdit();
  }

  enableEdit() {
    this.isEditable = !this.isEditable;
    if (this.isEditable) {
      this.userProfileForm.enable();
    } else {
      this.userProfileForm.disable();
    }
  }

  async presentProfilePicOptions() {
    
    
    if(this.authMeta.profileUrl === '' || this.authMeta.profileUrl === null ){
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

  async presentDeleteAccountAlert() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      subHeader: 'Are you sure?',
      message:
        'Deleting your account will clear all your data with Good Green. You will not be able to login with same credentials again.',
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
    this.roleMessage = `Dismissed with role: ${role}`;
    console.log('this.roleMessage', this.roleMessage);
    role === 'destructive' ? this.deleteAccount(this.customer.id) : null;
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
            this.uploadUserProfileImage(this.capturedImage);
          }
        });

        console.log('mediaUrl', selecedImg);
        console.log('dirpath', dirpath);
      })
      .catch((err) => {
        console.log('getPicture', err);
      });
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

  saveInfoToBE(locationData) {
    let payload = {
      imageUrl: locationData[0]?.accessLink,
    };
    this.profileUrl = this.authMeta.profileUrl;

    this.authService.saveProfileImage(this.customer.id, payload).subscribe({
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


  /**
   * Formats an image path on the device to be displayed in a thumbnail.
   *
   * @param imagePath
   * @returns
   */
  private sanitizedPathForImage(imagePath: string) {
    return !imagePath ? '' : this.webview.convertFileSrc(imagePath);
  }

  async deleteAccount(customerId) {
    await this.loaderService.createLoading(
      'Please wait while we are working on your request...'
    );
    this.authService.deleteAccount(customerId).subscribe({
      next: async (deletRes) => {
        console.log('deletRes', deletRes);
        if (deletRes) {
          await this.storageService.deleteAuthData();
          this.store.dispatch(signOut());
          this.loaderService.dismissLoading();
          this.router.navigate(['']);
        }
      },
      error: async (err) => {
        console.log(err);
        this.loaderService.dismissLoading();
      },
    });
  }


  //numeric validation
  alphanumericValidation(event){
    if (event && String.fromCharCode(event.charCode).match(/[0-9-( )]/)) {
        return event.charCode
    } else {
        return event.preventDefault();
    }
}


//phone number validations
validateContactPhoneNumber(event) {
    const number = event.target.value;
    let {isValid,phoneNumber} = phone(number, { country: 'USA' })
    if (isValid) {
        this.userProfileForm.controls["phonenumber"].patchValue(phoneNumber)
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

validateEmail(email) {
  console.log(`navigating to verify-email validation screen`,email)
  this.router.navigate(['user','profile', 'verify-email', this.customer.email]);
}


}
