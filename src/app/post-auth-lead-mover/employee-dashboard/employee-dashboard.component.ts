import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import {  Router } from '@angular/router';
import { AlertController, IonModal, ModalController, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil} from 'rxjs/operators';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';;
import { CommonService } from 'src/app/core/services/common/common.service';
import { CurrentJobCardComponent } from 'src/app/shared/components/current-job-card/current-job-card.component';
import { TodaysJob } from 'src/app/models/todays-job.model';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit , OnDestroy {

  @ViewChild(IonModal) modal: IonModal;
  @ViewChild(CurrentJobCardComponent) todaysJob:CurrentJobCardComponent;

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name: string;

  getAuthState: Observable<AuthState>;
  authData: AuthState;
  authMeta: AuthMeta;

  baId: string;
  accountId;

  jobData: TodaysJob = null;
  job = null;
  jobCard = null;

  // isCardLoading: boolean = false;
  isStartJobVisible = true;
  isJobCompleted = false;

  upcomingJobs: any[] = [];
  onGoingJobCard: any[] = [];
  upcomingJobsCard = null;

  lastX: any;
  lastY: any;
  currentColour: any;
  brushSize: any;

  canvas: any;
  startJobMeta = null;
  loginUserRole: string |'lead' | 'helper' = null;
  obj:any;

  //endJob
  alertHandlerMessage;
  private unsubscriber:Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private leadHelperService: LeadHelperService,
    private store: Store<AppState>,
    private navController: NavController,
    private alertController: AlertController,
    private commonService: CommonService
  ) {
    this.getAuthState = this.store.select(selectAuthData);
   }

  ngOnInit() {
    this.getAuthState.subscribe((authState) => {
      this.authData = authState;
      this.authMeta = authState.authMeta;
      this.loginUserRole = this.authMeta?.employee?.role;
      this.baId = this.authMeta?.employee?.businessAccountId;
      this.accountId = this.authMeta?.employee?.accountId;
      console.log('this.authData ', this.baId, this.accountId , this.loginUserRole);
    });

    this.commonService.announceCurrentCardRefresh$.pipe(takeUntil(this.unsubscriber)).subscribe((data:boolean) => {
      if (data) {
        this.getOngoingJobData();
        this.getUpcomingJobData();
      }
      else{
        this.getOngoingJobData();
        this.getUpcomingJobData();
      }
    })
  }

  openJobDetails(selectedJob: any, jobType: 'ongoing' | 'upcoming' ) {
    console.log('selectedJob', selectedJob);
    if (jobType === 'ongoing') {
      this.obj = {
        businessAccountId: this.baId,
        accountId: this.accountId,
        jobCardId: selectedJob?.id,
        jobId: selectedJob?.job?.id,
        jobType: 'ongoing'
      };
    } else if (jobType === 'upcoming') {
      this.obj = {
        businessAccountId: this.baId,
        accountId: this.accountId,
        jobCardId: selectedJob?.jobCard?.id,
        jobId: selectedJob.job.id,
        jobType: 'upcoming'
      };
    }
    
    if(selectedJob) {
      console.log('META INFO', this.obj);
      this.router.navigate(['lead', 'employee-jobs' ,'job-details'],  { state: { meta: this.obj } });
    }
  }

  refreshDashboard() {
    this.todaysJob.getTodaysJobData();
    this.getOngoingJobData();
    this.getUpcomingJobData();
  }

  handleJobCardRefresh(event) {
    console.log('event', event);
    if (event && event.clockInClockOut && !event.jobStartOrEnd) {
      this.todaysJob.getTodaysJobData();
    }
    else if (event && event.jobStartOrEnd && !event.clockInClockOut) {
      this.todaysJob.getTodaysJobData();
      this.getOngoingJobData();
    }
  }

  getOngoingJobData() {
    this.leadHelperService.getOngoingJobs(this.baId,this.accountId).subscribe({
      next:(data: any) => {
        this.onGoingJobCard = [...data];
        console.log('ongoing jobs',this.onGoingJobCard);
      },
      error:err => {
        console.log('error',err);
        this.alertMessage(err);
      }
    });
  }

  getUpcomingJobData() {
    this.leadHelperService.getUpcomingJobs(this.baId, this.accountId).subscribe({
      next : (data: any) => {
        console.log('Data getUpcomingJobs', data);
        this.upcomingJobs = data;
        console.log('Data upcomingJobs', this.upcomingJobs);
        this.upcomingJobs = [...this.upcomingJobs];
      },
      error:err => {
        console.log('error',err);
        this.alertMessage(err);
      }
    });
  }

  goToAllJobs() {
    this.router.navigate(['lead','employee-jobs']);
  }

  handleRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      this.refreshDashboard();
      event.target.complete();
    });
  };

  openJobCard(jobCard){
    if(jobCard) {
      
      let obj = {
        jobCardId:jobCard?.id
      }
      this.router.navigate(['lead','employee-jobs','ongoing'],{state:{meta:obj}})
    }
  }


  async goBack() {
    this.navController.back();
  }

  async alertMessage(message) {
    const alert = await this.alertController.create({
      header: 'Error!',
      message:`${message.error.errorMessage}`,
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


  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }
}

