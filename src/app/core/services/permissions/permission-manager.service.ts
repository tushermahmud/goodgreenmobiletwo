import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Platform } from '@ionic/angular';
import { DevicePlatform } from 'src/app/definitions/device-platform.enum';

@Injectable({
  providedIn: 'root'
})
export class PermissionManagerService {

  private _currentPlatform: DevicePlatform;
  permissionStatus;

  get CurrentPlatform() { return this._currentPlatform; }

  constructor(
    private androidPermissions: AndroidPermissions,
    private platform: Platform) {

  }


  async checkDevicePermission() {
    let permissionRes;
    await this.waitTillReady();
    if (this._currentPlatform === DevicePlatform.ANDROID) {

      console.log(`checking device permissions for: Android`);
      await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then((result) => {
        console.log('result===>>', result);
        permissionRes = result;
      });

      await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);
      return permissionRes; // need to refactor

    } 
    else if (this._currentPlatform === DevicePlatform.IOS) {
      // handle IOS permission flow
      console.log(`checking device permissions for: iOS`);

    }
  }

  async arePermissionsGranted() {
    await this.waitTillReady();
    if (this._currentPlatform === DevicePlatform.ANDROID) {
      this.permissionStatus = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA)
      console.log('this.permissionStatus', this.permissionStatus);
      console.log('this.permissionStatus 258',  this.androidPermissions.PERMISSION);
      
    }
    if (this._currentPlatform === DevicePlatform.IOS) {
      // handle IOS
    }
  }

  //camera
  async requestPermission() {
    await this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA).then((permissionStatus) => {
      console.log('permissionStatus', permissionStatus);
    });
  }

  // request different permissions .. refer google android permissions for types
  async requestForPermissions() {

    await this.androidPermissions.requestPermissions([
      this.androidPermissions.PERMISSION.CAMERA,
      this.androidPermissions.PERMISSION.GET_ACCOUNTS,
      this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES,
      this.androidPermissions.PERMISSION.READ_MEDIA_VIDEO
    ])
  }

  async waitTillReady() {
    // check if native platform is ready
    await this.platform.ready().then((readySource) => {
      console.log('Platform ready from', readySource);

      const isIos = this.platform.is('ios') || this.platform.is('iphone') || this.platform.is('ipad');
      const isAndroid = this.platform.is('android') || 'cordova' || 'desktop' || 'mobile' || ('mobileweb');

      // Platform now ready, check for os type
      if (isAndroid) {

        console.log('Platform detected: Android');
        this._currentPlatform = DevicePlatform.ANDROID;

      } else if (isIos) {

        console.log('Platform detected: iOS');
        this._currentPlatform = DevicePlatform.IOS;

      } else {
        //its not ios or android
        console.log('This platform is not supported');
        this._currentPlatform = DevicePlatform.UNSUPPORTED;
      }
    });
  }

  isLocationPermissionAvailable() {
    this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
    ).then(result => {
      let res: boolean = false;
      if (result.hasPermission) {
        res = true;
        console.log('PERMISSION EXIST', result.hasPermission);
        // Location permission granted, do something here
      } else {
        // Location permission not granted, show a prompt to the user
        console.log('PERMISSION NOT EXIST');
        res = false;
      }
      return res;
    });
  }


  requestLocationPermission () {
    this.androidPermissions.requestPermission(
      this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
    ).then(result => {
      let res: boolean = false;
      if (result.hasPermission) {
        // Location permission granted, do something here
        res = true;
        console.log('PERMISSION GRANTED');
        
      } else {
        // Location permission not granted, show a message to the user
        res = false;
        console.log('PERMISSION DENIED');
      }
    });
  }
}
