import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { TimeOffStatus } from 'src/app/definitions/time-off-status.enum';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';

@Component({
  selector: 'app-request-timeoff',
  templateUrl: './request-timeoff.component.html',
  styleUrls: ['./request-timeoff.component.css']
})
export class RequestTimeoffComponent implements OnInit {

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Time Off Request`,
    // isModel: true
  };

  timeOffsPayload = [];
  timeOffStatus: TimeOffStatus;
  timeOffsForm: FormGroup
  accountId: any;
  baId: any;
  dateFormat = new Date().toISOString();

  constructor(
    private router:Router,
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private datePipe: DatePipe,
    private navParams: NavParams,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    // let {baId,accountId} = this.router.getCurrentNavigation()?.extras?.state?.meta;

    
    this.baId = this.navParams.get('baId');
		this.accountId = this.navParams.get('accountId');
    console.log('this.authData ', this.baId, this.accountId);

    this.dateFormat = this.dateFormat.split('T')[0]
    console.log('current date', this.dateFormat)

    this.timeOffsForm = this.fb.group({
      note: [''],
      date: ['']
    })
  }

  onDateTimeChanged(event) {
    console.log('date time changed:', this.dateFormat, event);
    console.log(event.detail.value);
    this.dateFormat = event.detail.value;
    this.timeOffsForm.patchValue({
      date: this.dateFormat,
    });
  }

  async onSubmit(formValue) {
    console.log('form-value', formValue);
    let alert = await this.alertController.create({
      header: 'Time Off',
      message: `Requesting for time off on ${this.datePipe.transform(formValue?.date, 'EEEE, MMMM d, y')}. To proceed click on Yes.`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('No clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            this.updateTimeOffs(formValue);
          }
        }
      ]
    });

    alert.present();
  }

 updateTimeOffs(formValue) {
    this.loaderService.createLoading('Creating time-off')
    this.dateFormat = formValue.date.split('T')[0];

    let payload = {
      date: this.dateFormat,
      status: 'new-request',
      notes: formValue.note
    }
    this.timeOffsPayload.push(payload)
    console.log('timeOffsDate', this.timeOffsPayload)

    let finalPayload = {
      timeOffs: this.timeOffsPayload
    }

   this.leadHelperService.updateTimeOff(this.baId, this.accountId, finalPayload).subscribe({
     next: respone => {
       console.log('response', respone);
       this.loaderService.dismissLoading();
       this.onSuccess();
     },
     error: err => {
       console.log('err', err);
       this.loaderService.dismissLoading();
     }
   })
  }


 async onSuccess(){
    let alert = await this.alertController.create({
      header:'Time Off',
      message:'Time-off has been successfully requested. You will be notified once your Lead/Manager approves the same.',
      buttons:[
        {
          text:'Ok',
          handler: () =>{
            // this.router.navigate(['lead','employee-notifications','time-offs'])
            this.modalController.dismiss({shouldRefresh: true})
          }
        }
      ]
    })
    await alert.present();
  }

  ionViewWillLeave() {
    this.dateFormat = new Date().toISOString();
    this.timeOffsForm.controls['note'].patchValue('');
  }
}
