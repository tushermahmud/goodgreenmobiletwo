import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { TodaysJob } from 'src/app/models/todays-job.model';
import { SignaturePadComponent } from '../../modules/signature-pad/signature-pad.component';
import { UNDEFINED_GEO_LAT, UNDEFINED_GEO_LONG } from 'src/app/utils/constants';

interface Status {
  clockInClockOut: boolean;
  jobStartOrEnd: boolean;
}

@Component({
  selector: 'app-current-job-card',
  templateUrl: './current-job-card.component.html',
  styleUrls: ['./current-job-card.component.css']
})
export class CurrentJobCardComponent implements OnInit {
  @Input() authMeta: any;

  @Output() handleJobCardRefresh: EventEmitter<any> = new EventEmitter();


  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  checkdInValue=false;
  loginUserRole: any;
  baId: any;
  accountId: any;
  jobData: any;
  job: any;
  jobCard: any;

  // isCardLoading: boolean = false;
  isStartJobVisible = true;
  isJobCompleted = false;

  upcomingJobs: any[] = [];
  upcomingJobsCard = null;
  lastX: any;
  lastY: any;
  currentColour: any;
  brushSize: any;

  canvas: any;
  startJobMeta = null;
 
  alertHandlerMessage;

  constructor(
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private modalController: ModalController,
    private commonService: CommonService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('authMeta',this.authMeta);
    this.loginUserRole = this.authMeta?.employee?.role;
    this.baId = this.authMeta?.employee?.businessAccountId;
    this.accountId = this.authMeta?.employee?.accountId;

    this.commonService.announceCurrentCardRefresh$.subscribe((data:boolean) => {
      if(data) {
        this.getTodaysJobData();
      }
      else{
        this.getTodaysJobData();
      }
    })


    // this.getTodaysJobData();
  }

  async getTodaysJobData() {
    await this.loaderService.dismissLoading();


    await this.loaderService.createLoading('updating job card..');
    this.leadHelperService.getTodaysJob(this.baId, this.accountId).subscribe({
      next:async (data: TodaysJob) => {
        console.log('Data getTodaysJob', data);
        this.jobData = data;

        if (!this.jobData) {
          await this.loaderService.dismissLoading();
          return;
        }

        this.job = this.jobData.job;
        this.jobCard = this.jobData.jobCard;
        await this.loaderService.dismissLoading();
      },
      error: async err => {
        console.log('err', err);
        await this.loaderService.dismissLoading();
        this.commonService.showToast(`${err?.error?.errorMessage}`);
      }
    });
  }

  openDetails(event, jobData) {
    event.preventDefault();
    this.openJobDetails(jobData);
  }

  private openJobDetails(selectedJob: any){
    
    console.log('selectedJob',selectedJob);

    const obj = {
      businessAccountId: this.baId,
      accountId:this.accountId,
      jobCardId: selectedJob.jobCard.id,
      jobId: selectedJob.job.id,
      jobType:'ongoing'
    };
    console.log('META INFO', obj);
    this.router.navigate(['lead', 'employee-jobs' ,'job-details'],  { state: { meta: obj } });
  }

  async presentModal(mode:string) {
    const modal = await this.modalController.create({
      component: SignaturePadComponent,
      componentProps: {
        baId: this.baId,
        accountId: this.accountId,
        jobCardId: this.jobCard?.id,
        mode: mode
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    console.log('datadatadatadatadatadatadata', data, role);
    this.startJobMeta = data;

    if(data && data.isJobStarted) {
      await this.startJob(mode);
    } else {
      return false;
    }
    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    }
  }

  checkIn() {
    this.checkdInValue = true;
    this.leadHelperService.jobCheckIn(this.baId, this.accountId,this.job?.id).subscribe(data => {
      console.log('data', data);
      this.refresh('check-in');
    },
    error => {
      console.log('error', error);
      this.commonService.showToast(`${error?.error?.errorMessage}`);
    });
  }

  clockInOrOut(action: 'clock-in' | 'clock-out') {
    const payload = {
      geoLat: UNDEFINED_GEO_LAT,
      geoLng: UNDEFINED_GEO_LONG,
    remarks: action,
      time: new Date()
    };
    // return;
    this.leadHelperService.clockInOrOut(this.baId, this.accountId, this.job?.id, action, payload).subscribe({
      next: async data => {
        console.log('date ===>>', data);
        await this.refresh(action)
      },
      error: err => {
        console.log('error', err)
      }
    })
  }

  async endJob(mode:string) {
    console.log('mode',mode)
    const alert = await this.alertController.create({
      header: 'End Job',
      subHeader: 'Are you sure to end the job?',
      message: `
      You are about to end the current active job. Once a job is ended, it can not be made active again.
      Please review everything first to ensure all job tasks are done, media files are uploaded and signatures are collected for sign off.
      If everything is fine then please tap on “Yes End Job” button to end the job.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.alertHandlerMessage = 'Alert canceled';
          },
        },
        {
          text: 'Yes End Job',
          role: 'confirm',
          handler: () => {
            this.alertHandlerMessage = 'Alert confirmed';
            this.presentModal(mode);
            // this.isJobCompleted = true;
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('role', role);

  }

  async startJob(mode) {
    console.log('mode', mode)
    await this.loaderService.dismissLoading();

    let loadingMsg: string = null;
    mode === 'start' ? loadingMsg = 'Starting job...' : loadingMsg = 'Ending job...';
    await this.loaderService.createLoading(loadingMsg);

    const payload = this.commonService.getStartOrEndJobPaload(this.startJobMeta);

    this.leadHelperService.startOrEndJob(this.baId, this.accountId,this.jobCard?.id, mode, payload).subscribe({
      next: async (startJobRes) => {
        console.log('startJobRes', startJobRes);
        await this.loaderService.dismissLoading();
        if (startJobRes?.jobCard?.status === 'completed' && startJobRes?.job?.currentStatus === 'clock-in') {
          this.clockInOrOut('clock-out');
          await this.refresh(mode);
        }
        else {
          await this.refresh(mode);
        }
      },
      error: async (error) => {
        console.log('error', error);
        await this.loaderService.dismissLoading();
        this.alertMessage(error);
      }
    });
  }

  async refresh(action: string) {
    let setStatus: Status = {
      clockInClockOut: false,
      jobStartOrEnd: false
    }
  
    switch (action) {
      case 'check-in':
      case 'clock-in':
      case 'clock-out':
        setStatus.clockInClockOut = true;
        break;

      case 'start':
      case 'end':
        setStatus.jobStartOrEnd = true;
        break;

      default:
        setStatus;
        break;
    }
    this.handleJobCardRefresh.emit(setStatus)
  }

  async alertMessage(message) {
    const alert = await this.alertController.create({
      header: 'Error!',
      message: `${message.error.errorMessage}`,
      buttons:[
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    })

   await alert.present();
  }

}
