import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ModalController, NavController } from '@ionic/angular';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { Employee } from 'src/app/models/employee.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { Document, JobDetailsRes, JobMedia } from 'src/app/models/job-details.model';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { UNDEFINED_GEO_LAT, UNDEFINED_GEO_LONG } from 'src/app/utils/constants';
import { CommonModule, DatePipe } from '@angular/common';
import * as moment from 'moment';
import { SharedModule } from '../../shared.module';
import { EmployeeJobDetailsModule } from '../employee-job-details/employee-job-details.module';

@Component({
  standalone: true,
  selector: 'app-ongoing-jobs',
  templateUrl: './ongoing-jobs.component.html',
  styleUrls: ['./ongoing-jobs.component.css'],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    EmployeeJobDetailsModule,
    DatePipe
  ]
})
export class OngoingJobsComponent implements OnInit {
  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: '',
  };

  jobLocations: Location[];
  documents: Document[]
  jobMedia: JobMedia;
  loginUser: Employee;
  metaData;
  jobDetailsData: JobDetailsRes;
  jobCardData: any;
  message: string;
  startJobMeta: any;
  jobs = [];
  todayDate = new Date();
  isDueDate: boolean = false;
  crew=[];
  isLead: boolean = false;
  isHelper: boolean = false;
  crewInfo:any
  scheduledDay:any;
  filteredCrew:any


  constructor(
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private navController: NavController,
    private router: Router,
    private storageService: StorageService,
    private commonService: CommonService,
    private alertController: AlertController,
    private modalController: ModalController,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.metaData = this.router.getCurrentNavigation().extras?.state?.meta;

    this.storageService.getAuthData().then(data => {
      console.log('data', data);
      this.loginUser = data.employee;
    });


    this.getOnGoingJobCard(this.metaData?.jobCardId);
  }


  getOnGoingJobCard(jobCardId) {
    this.loaderService.createLoading('Loading job card details..')
    this.leadHelperService.getOngoingJobCard(jobCardId).subscribe({
      next: async data => {
        this.jobCardData = { ...data };
        console.log('jobCardData', data);
        this.headerInfo.headerText = this.jobCardData?.projectDetails?.name;
        this.jobLocations = [...this.jobCardData?.locations];
        this.documents = [...this.jobCardData?.documents];
        this.checkScheduledJobs()
        await this.loaderService.dismissLoading();
      },
      error: async err => {
        console.log('err', err);
        await this.loaderService.dismissLoading();
        this.alertMessage(err);
      }
    })
  }


  goToJobDetail(job) {
    const obj = {
      businessAccountId: this.loginUser?.businessAccountId,
      accountId: this.loginUser?.accountId,
      jobCardId: this.jobCardData?.id,
      jobId: job?.id,
      jobType: 'ongoing'
    };
    console.log('META INFO', obj);
    this.router.navigate(['lead', 'employee-jobs', 'job-details'], { state: { meta: obj } });
  }


  goToPayments() {
    let data = {
      accountId: this.loginUser?.accountId,
      bussinessAccountId: this.loginUser?.businessAccountId,
      jobCardId: this.jobCardData?.id,
      // jobId:this.jobDetailsData?.jobDetails?.job?.id,
      customerId: this.jobCardData?.customerId,
      baseQuoteId: this.jobCardData?.baseQuoteId,
      serviceRequestId: this.jobCardData?.serviceRequestId,
      serviceItemId: this.jobCardData?.serviceItemId
    }
    this.router.navigate(['lead', 'employee-jobs', 'job-details', 'payments'], { state: { meta: data } });
  }


  async endJob(mode: "start" | "end") {
    const alert = await this.alertController.create({
      header: 'End Job',
      subHeader: 'Are you sure to end the job?',
      message: `You are about to end the current active job. Once a job is ended, it can not be made active again.
      Please review everything first to ensure all job tasks are done, media files are uploaded and signatures are collected for sign off.
      If everything is fine then please tap on “Yes End Job” button to end the job.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Alert canceled');
          },
        },
        {
          text: 'Yes End Job',
          role: 'confirm',
          handler: () => {
            console.log('Alert confirmed');
            // this.isStartJobVisible = true;
            // this.isJobCompleted = true;
            this.presentStartJobModal(mode);
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('role', role);

    // this.roleMessage = `Dismissed with role: ${role}`;
  }


  async presentStartJobModal(mode: "start" | "end") {
    const modal = await this.modalController.create({
      component: SignaturePadComponent,
      componentProps: {
        baId: this.loginUser.businessAccountId,
        accountId: this.loginUser.accountId,
        jobCardId: this.jobCardData?.id,
        mode: mode,
        parentMeta: this.metaData
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    this.startJobMeta = data;

    if (data && data.isJobStarted) {
      // this.isStartJobVisible = false;
      this.startJob(mode, data);
    } else {
      return false;
    }

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    }
  }


  async startJob(mode: "start" | "end", refreshMeta?: any) {
    console.log('mode', mode)

    let loaderMsg: string = null;
    mode === 'start' ? loaderMsg = 'Starting job...' : loaderMsg = 'Ending job...';
    await this.loaderService.createLoading(loaderMsg);

    const payload = this.commonService.getStartOrEndJobPaload(this.startJobMeta);
    console.log('startJobPayload', payload, 'mode', mode, refreshMeta);
    // this.loaderService.dismissLoading();
    // return;

    this.leadHelperService.startOrEndJob(this.loginUser.businessAccountId,
      this.loginUser.accountId, this.jobCardData?.id, mode, payload).subscribe({
        next: async (startJobRes) => {
          startJobRes?.jobCard?.status === 'completed' && startJobRes?.job?.currentStatus === 'clock-in' ? this.clockInOrOut('clock-out') : null;
          await this.loaderService.dismissLoading();
          console.log('startJobRes From job Details', startJobRes);
          this.commonService.refreshCurrentJob(true);
          this.router.navigate(['lead', 'employee-dashboard']);
        },
        error: async (error) => {
          console.log('error', error);
          await this.loaderService.dismissLoading();
          this.alertMessage(error);
        }
      });
  }


  async alertMessage(message) {
    const alert = await this.alertController.create({
      header: 'Error!',
      message: message?.error?.errorCode === 10001 ? 'You are not part of this job.' : `${message.error.errorMessage}`,
      buttons:[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () =>{
            this.goBack();
          }
        }
      ]
    })

   await alert.present();
  }

  async goBack() {
    this.navController.back();
  }


  clockInOrOut(action: 'clock-in' | 'clock-out') {
    const payload = {
      geoLat: UNDEFINED_GEO_LAT,
      geoLng: UNDEFINED_GEO_LONG,
      remarks: action,
      time: new Date()
    };
    // return;this.loginUser.businessAccountId, this.loginUser.accountId ,this.jobCardMetaData.jobCard.id
    this.leadHelperService.clockInOrOut(this.loginUser.businessAccountId, this.loginUser.accountId,
      this.filteredCrew[0]?.jobId, action, payload).subscribe({
        next: async data => {
          console.log('date ===>>', data);
          // await this.refreshDetailsPage(true);
        },
        error: err => {
          console.log('error', err)
        }
      });
  }


  checkScheduledJobs() {
    const today = moment();
    this.jobs = [...this.jobCardData?.jobs]
    this.crew = [...this.jobCardData?.crew]
    let lastScheduleDate = this.jobs[this.jobs.length - 1];
    console.log('last',lastScheduleDate)
    
    const givenDate = moment(lastScheduleDate);
    this.isDueDate = today.isAfter(givenDate);
    // let date = new Date(lastScheduleDate?.scheduledDateTime).getTime();
    // let diffDate = this.todayDate.getTime() - date;
    
    // if (diffDate >= 1) {
    //   this.isDueDate = true;
    // }

    if (!this.isDueDate) {
      this.crewInfo = this.crew.filter(item => {
        return item?.accountId === this.loginUser?.accountId
      })
      console.log('data', this.crewInfo, this.jobs)

      this.scheduledDay = this.jobs.filter(item => {
        let date = new Date(item?.scheduledDateTime).getDate();
        if (date === this.todayDate.getDate()) {
          return item;
        }
      })
      console.log('scheduleDay', this.scheduledDay)

      //with schedule date filetering crew data
      this.filteredCrew = this.crewInfo.filter(item => {
        return item?.jobId === this.scheduledDay[0]?.id
      })
      console.log('crewData', this.filteredCrew)

      //checking login employee lead or helper for this day
      if (this.filteredCrew[0]?.jobRole === 'lead') {
        this.isLead = true;
      }
      else if (this.filteredCrew[0]?.jobRole === 'helper') {
        this.isHelper = true;
      }
    }
    else {
      this.crewInfo = this.crew.filter(item => {
        return item?.accountId === this.loginUser?.accountId
      })
      console.log('data', this.crewInfo, this.jobs)

      //with schedule date filetering crew data
      this.filteredCrew = this.crewInfo.filter(item => {
        return item?.jobId === lastScheduleDate?.id
      })
      console.log('crewData', this.filteredCrew)

      // checking login employee lead or helper for this day
      if (this.filteredCrew[0]?.jobRole === 'lead') {
        this.isLead = true;
      }
      else if (this.filteredCrew[0]?.jobRole === 'helper') {
        this.isHelper = true;
      }
    }

  }


  handleRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      this.getOnGoingJobCard(this.metaData?.jobCardId);
      event.target.complete();
    }, 2000);
  };

}
