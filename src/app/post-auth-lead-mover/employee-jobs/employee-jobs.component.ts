import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

@Component({
  selector: 'app-employee-jobs',
  templateUrl: './employee-jobs.component.html',
  styleUrls: ['./employee-jobs.component.css']
})
export class EmployeeJobsComponent implements OnInit {
  getAuthState: Observable<AuthState>;
  authData: AuthState;
  authMeta: AuthMeta;
  upComingJobs: any;
  onGoingJobCard: any;
  accountId: any;
  baId: any;
  loginUserRole: string |'lead' | 'helper' = null;
  obj:any;

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private alertController: AlertController,
    private navController: NavController,
  ) { this.getAuthState = this.store.select(selectAuthData);}

  ngOnInit(): void {
    console.log('EmployeeJobsComponent');
    this.getAuthState.subscribe((authState) => {
      this.authData = authState;
      this.authMeta = authState?.authMeta;
      this.loginUserRole = this.authMeta?.employee?.role;
      this.baId = this.authMeta?.employee?.businessAccountId;
      this.accountId = this.authMeta?.employee?.accountId;
      console.log('this.authData ', this.baId, this.accountId , this.loginUserRole);
    });

    this.getOngoingJobData();
    this.getUpcomingJobData();
  }



  async getOngoingJobData(){
    this.leadHelperService.getOngoingJobs(this.baId,this.accountId).subscribe({
      next : (data: any) => {
        this.onGoingJobCard = [...data];
        console.log('ongoing jobs',this.onGoingJobCard);
      },
      error: err => {
        console.log('error',err);
        this.alertMessage(err);
      }
    });
  }



  async getUpcomingJobData() {
    await this.loaderService.createLoading('updating jobs..');
    this.leadHelperService.getUpcomingJobs(this.baId, this.accountId).subscribe({
      next : (data: any) => {
        console.log('Data getUpcomingJobs', data);
        this.upComingJobs = data;
        console.log('Data upcomingJobs', this.upComingJobs);
        this.upComingJobs = [...this.upComingJobs];
        this.loaderService.dismissLoading();
      },
      error: err => {
        console.log('error',err);
        this.loaderService.dismissLoading();
        this.alertMessage(err);
      }
    });
  }

  openJobDetails(selectedJob,jobType){
    console.log('selectedJob',selectedJob);
    if(jobType === 'ongoing'){
      this.obj = {
        businessAccountId: this.baId,
        accountId:this.accountId,
        jobCardId:selectedJob?.id,
        jobId: selectedJob?.job?.id,
        jobType:'ongoing'
      };
    }
    else if(jobType === 'upcoming'){
      this.obj = {
        businessAccountId: this.baId,
        accountId:this.accountId,
        jobCardId:selectedJob?.jobCard?.id,
        jobId: selectedJob?.job?.id,
        jobType:'upcoming'
      };
    }
  
    console.log('META INFO', this.obj);
    this.router.navigate(['lead', 'employee-jobs' ,'job-details'],  { state: { meta: this.obj } });
  }

  refreshDashboard() {
    this.getOngoingJobData();
    this.getUpcomingJobData();
  }

  handleRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      this.refreshDashboard();
      event.target.complete();
    }, 2000);
  };



  
  openJobCard(jobCard){
    let obj = {
      jobCardId:jobCard?.id
    }
    this.router.navigate(['lead','employee-jobs','ongoing'],{state:{meta:obj}})
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

  async goBack() {
    this.navController.back();
  }
}
