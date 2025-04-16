import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Storage } from '@ionic/storage-angular';
import { AccountStatus } from 'src/app/definitions/account-status.enum';
import { TokenResponse } from 'src/app/models/chat.model';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storageInitialised = false;

  constructor(
    private storage: Storage,
    private nativeStorage: NativeStorage, //use this for better performance
  ) { }


  async saveAuthData(data: AuthMeta) {
    if (!this.storageInitialised) {
      await this.storage.create();
    }

    return this.storage.set('authData', data);
  }
  async saveChatAuthData(tokenResp: TokenResponse) {
    if (!this.storageInitialised) {
      await this.storage.create();
    }
    await this.storage.get('authData').then((aData) => {

      aData.chatToken  = tokenResp;

      return this.storage.set('authData', aData);

    });
  }

  async deleteAuthData() {
    if (!this.storageInitialised) {
      await this.storage.create();
    }

    return this.storage.remove('authData');
  }

  async getAuthData() {

    if (!this.storageInitialised) {
      await this.storage.create();
    }

    return await this.storage.get('authData');
  }

  async updateUserProfileData (img: string) {
    if (!this.storageInitialised) {
      await this.storage.create();
    }
    let aData =  await this.storage.get('authData');
    if(aData) {
      aData.profileUrl = img
      return await this.storage.set('authData', aData);
    }
  }

  async updateAccountStatus () {
    if (!this.storageInitialised) {
      await this.storage.create();
    }
    let aData: AuthMeta =  await this.storage.get('authData');
    if(aData) {
      aData.accountStatus = AccountStatus.ACTIVE;
      aData.customer.accountStatus =  AccountStatus.ACTIVE;

      return await this.storage.set('authData', aData);
    }
  }

  // async updateUserProfileData () {
  //   if (!this.storageInitialised) {
  //     await this.storage.create();
  //   }
  //   return  this.storage.
  // }

  async setGetStartedMeta () {
    return await this.storage.set('getStartedViewed', true);
  }

  async getGetStartedState() {
    return await this.storage.get('getStartedViewed');
  }

  async saveJobDetailsMeta(meta) {
    return await this.storage.set('job-details-meta', meta);
  }

  async getJobDetailsMeta() {
    return await this.storage.get('job-details-meta')
  }

  async removeJobDetailsMeta() {
    return this.storage.remove('job-details-meta');
  }
}
