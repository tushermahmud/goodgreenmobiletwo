import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonicModule, ModalController, NavController, RefresherCustomEvent } from '@ionic/angular';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { StorageService } from 'src/app/core/services/storage/storage-service.service';
import { Employee } from 'src/app/models/employee.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { Document, JobDetailsRes, JobMedia, Location } from 'src/app/models/job-details.model';
import { AddAddendumComponent } from 'src/app/shared/components/add-addendum/add-addendum.component';
import { JdAddMediaComponent } from 'src/app/shared/components/jd-add-media/jd-add-media.component';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { UNDEFINED_GEO_LAT, UNDEFINED_GEO_LONG } from 'src/app/utils/constants';
import { MediaUploadService } from 'src/app/core/services/media-upload/media-upload.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { JobHistoryRoutingModule } from '../job-history/job-history-routing.module';
import { NotFoundComponent } from '../../components/not-found/not-found.component';
import { OrderStatusComponent } from '../../components/order-status/order-status.component';
import { ServiceDocumentsComponent } from '../../components/service-documents/service-documents.component';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';
import { JobLogsComponent } from '../../components/job-logs/job-logs.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-employee-job-details',
  templateUrl: './employee-job-details.component.html',
  styleUrls: ['./employee-job-details.component.css'],
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    JobHistoryRoutingModule,
    HeaderComponent,
    SignaturePadComponent,
    NotFoundComponent,
    OrderStatusComponent,
    ServiceDocumentsComponent,
    DocumentViewerComponent,
    AddAddendumComponent,
    JdAddMediaComponent,
    JobLogsComponent
  ]
})
export class EmployeeJobDetailsComponent implements OnInit {
  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Job Details`,
  };
  isStartJobVisible: boolean;
  message: string;
  refreshEvent: RefresherCustomEvent = null;
  refreshUi = false;
  metaData;
  jobDetailsData: JobDetailsRes;
  isLoading:boolean =false;
  jobLocations: Location[];
  documents: Document[];
  jobMedia: JobMedia;
  jobCardMetaData: any;
  isJobDetailRefresh:boolean = false;
  loginUser: Employee;
  startJobMeta: any;
  isLead=false;
  isHelper=false;
  mode:'start' | 'end';

  constructor(
    private navController: NavController,
    private router: Router,
    private modalController: ModalController,
    private route: Router,
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private storageService: StorageService,
    private commonService: CommonService,
    private alertController: AlertController,
    private cd: ChangeDetectorRef,
    private mediaService: MediaUploadService

  ) { }

  async ngOnInit() {
    this.metaData = this.route.getCurrentNavigation().extras?.state?.meta;
    await this.storageService.saveJobDetailsMeta(this.metaData)
    console.log('this.metaData',this.metaData, this.loginUser);
    
    this.storageService.getAuthData().then(data => {
      console.log('then(data', data);
      this.loginUser = data.employee;
    });

  
    this.commonService.announceJdRefreshObs$.subscribe((data: boolean) => {
      if (data) {
        this.refreshDetailsPage(true);
      }
    });
    this.refreshDetailsPage(false);
  }

 

  async getJobDetails(businessAccountId, accountId, jobCardId, jobId , loaderMsg?: string) {
    let loadingMsg = 'Loading job details..';
    if(loaderMsg){
      loadingMsg = loaderMsg;
    }
    await this.loaderService.dismissLoading();

    await this.loaderService.createLoading(loadingMsg);
    this.leadHelperService.getJobDetails(businessAccountId, accountId, jobCardId, jobId).subscribe({
      next: async (data: JobDetailsRes) => {
        console.log('getJobDetails data', data);
        
        this.jobDetailsData = { ...data };
        this.jobCardMetaData = data?.jobDetails;
        if (this.jobCardMetaData.job.role === 'lead') {
          this.isLead = true;
        }
        else {
          this.isHelper = true;
        }

        this.jobLocations = this.jobDetailsData.jobRequestDetails.locations;
        this.documents = this.jobDetailsData.jobRequestDetails.documents;
        this.jobMedia = this.jobDetailsData.jobMedia;
        console.log('this.jobCardMetaData', this.jobCardMetaData);
        // this.jobCardMetaData.job.currentStatus = 'clock-in';
        await this.loaderService.dismissLoading();
        this.closeRefreshUi()
        // this.cd.detectChanges();
        //  this.c
      },
      error:async (error) => {
        console.log('error', error);
        this.closeRefreshUi();
        await this.loaderService.dismissLoading();
        this.alertMessage(error);
      }
    });
  }

  async goBack() {
    await this.storageService.removeJobDetailsMeta();
    this.navController.back();
  }

  openAddendumModal() {
    const navData = {
      businessAccountId: this.metaData.businessAccountId,
      createdByAccId: this.metaData.accountId,
      serviceItemId: this.jobCardMetaData?.jobCard?.serviceItemId
    };
    this.router.navigate(['lead', 'employee-jobs' , 'job-details', 'addendum'], { state: { meta: navData } });
  }

  openJobLogs() {

    this.router.navigate(['lead', 'employee-jobs' , 'job-details', 'logs'], { state: { meta: this.metaData } });
  }

  async addMedia() {
    const modal = await this.modalController.create({
      component: JdAddMediaComponent,
      componentProps: {
        baId: this.loginUser?.businessAccountId,
        accountId: this.loginUser?.accountId,
        jobId:this.jobDetailsData?.jobDetails?.job?.id
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    console.log('openAddMediaModal', data);
    console.log('openAddMediaModal', role);
    if(data && data.upload) {
      console.log('data', data);

      this.mediaService.triggerUpload.next({
        upload: true,
        tag: data?.tag,
        componentName: 'JobMediaComponent'
      });
      
    }

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    }

  }

  openMenu() {

  }

  async presentStartJobModal(mode:"start" | "end") {
    const modal = await this.modalController.create({
      component: SignaturePadComponent,
      componentProps: {
        baId: this.loginUser.businessAccountId,
        accountId: this.loginUser.accountId,
        jobCardId: this.jobCardMetaData.jobCard.id,
        mode: mode,
        parentMeta: this.metaData
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    this.startJobMeta = data;

    if(data && data.isJobStarted) {
      this.isStartJobVisible = false;
      this.startJob(mode, data);
    } else {
      return false;
    }

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    }
  }

  async startJob(mode: "start" | "end", refreshMeta?: any ) {
    console.log('mode', mode)
    
    let loaderMsg: string = null;
    mode === 'start' ?  loaderMsg = 'Starting job...' : loaderMsg = 'Ending job...';
    await this.loaderService.createLoading(loaderMsg);

    const payload = this.commonService.getStartOrEndJobPaload(this.startJobMeta);
    console.log('startJobPayload',payload, 'mode', mode , refreshMeta);
    // this.loaderService.dismissLoading();
    // return;

    this.leadHelperService.startOrEndJob(this.loginUser.businessAccountId,
      this.loginUser.accountId ,this.jobCardMetaData.jobCard.id, mode , payload).subscribe({
      next: async (startJobRes) => {
        startJobRes?.jobCard?.status === 'completed' && startJobRes?.job?.currentStatus === 'clock-in' ? this.clockInOrOut('clock-out') : null;
        await this.loaderService.dismissLoading();
        this.refreshDetailsPage(true);
        console.log('startJobRes From job Details', startJobRes);
      },
      error: async (error) => {
        console.log('error', error);
        await this.loaderService.dismissLoading();
        this.alertMessage(error);
      }
    });
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

  clockInOrOut(action: 'clock-in' | 'clock-out') {
    const payload = {
      geoLat: UNDEFINED_GEO_LAT,
      geoLng: UNDEFINED_GEO_LONG,
      remarks: action,
      time: new Date()
    };
    // return;this.loginUser.businessAccountId, this.loginUser.accountId ,this.jobCardMetaData.jobCard.id
    this.leadHelperService.clockInOrOut(this.loginUser.businessAccountId, this.loginUser.accountId,
      this.jobCardMetaData.job.id, action, payload).subscribe({
        next: async data => {
          console.log('date ===>>', data);
          await this.refreshDetailsPage(true);
        },
        error: err => {
          console.log('error', err)
        }
      });
  }

  goToPayments() {
    let data = {
      accountId:this.loginUser?.accountId,
      bussinessAccountId:this.loginUser?.businessAccountId,
      jobCardId:this.jobCardMetaData?.jobCard?.id,
      jobId:this.jobDetailsData?.jobDetails?.job?.id,
      customerId:this.jobDetailsData?.jobRequestDetails?.customerId,
      baseQuoteId:this.jobDetailsData?.jobRequestDetails?.baseQuoteId,
      serviceRequestId: this.jobDetailsData?.jobRequestDetails?.serviceRequestId,
      serviceItemId: this.jobCardMetaData?.jobCard?.serviceItemId
    }
    this.router.navigate(['lead', 'employee-jobs', 'job-details', 'payments'], { state: { meta: data } });
  }

  async refreshDetailsPage(meta?: any) {
    if(meta) {
      let availableMeta = await this.storageService.getJobDetailsMeta();
      console.log('availableMeta', availableMeta);
      if(availableMeta) {
        await this.getJobDetails(availableMeta.businessAccountId, availableMeta.accountId, availableMeta.jobCardId, availableMeta.jobId);
      }
      
    } else {

      await this.getJobDetails(this.metaData.businessAccountId, this.metaData.accountId, this.metaData.jobCardId, this.metaData.jobId);
    }
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

  doRefresh(event) {
    console.log('Begin async operation', event);
    this.refreshEvent = event;
    this.isLoading = true;
    this.refreshDetailsPage();

  }

  private closeRefreshUi() {
    if (this.refreshEvent) {
      this.refreshEvent.target.complete();
      this.isLoading = false;
    }
    // else {
    //   this.loaderService.dismissLoading();
    // }
  }
}
