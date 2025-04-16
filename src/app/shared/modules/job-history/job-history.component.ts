import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { AuthMeta } from 'src/app/state/auth/auth-meta.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { AuthState } from 'src/app/state/auth/auth.state';

@Component({
  selector: 'app-job-history',
  templateUrl: './job-history.component.html',
  styleUrls: ['./job-history.component.css']
})
export class JobHistoryComponent implements OnInit {
  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Assigned Job History`,
  };

  getAuthState: Observable<AuthState>;
  authData: AuthState;
  authMeta: AuthMeta;
  accountId: any;
  baId: any;
  loginUserRole: string | 'lead' | 'helper' = null;
  obj: any;
  completedJobs = [];
  

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private formBuilder: FormBuilder,
  ) { this.getAuthState = this.store.select(selectAuthData); }

  ngOnInit(): void {
    this.getAuthState.subscribe((authState) => {
      this.authData = authState;
      this.authMeta = authState?.authMeta;
      this.loginUserRole = this.authMeta?.employee?.role;
      this.baId = this.authMeta?.employee?.businessAccountId;
      this.accountId = this.authMeta?.employee?.accountId;
      console.log('this.authData ', this.baId, this.accountId, this.loginUserRole);
    });
    
    this.getCompletedJobsList();
  }


  openJobdetails(selectedJob: any) {
    console.log('selected', selectedJob);
    this.obj = {
      businessAccountId: this.baId,
      accountId: this.accountId,
      jobCardId: selectedJob?.jobCard?.id,
      jobId: selectedJob?.job?.id,
      jobType:'upcoming'
    };
    this.router.navigate(['lead', 'employee-jobs', 'job-details'], { state: { meta: this.obj } })
  }

  getCompletedJobsList() {
    this.loaderService.createLoading('Loading jobs..');
    this.leadHelperService.getCompletedJobs(this.baId, this.accountId).subscribe({
      next: data => {
        this.completedJobs = [...data]

        console.log('completedJobs', this.completedJobs);
        this.loaderService.dismissLoading();
      },
      error: err => {
        console.log('Error', err);
        this.loaderService.dismissLoading();
      }
    })
  }


  refresh() {
    this.getCompletedJobsList();
  }


  handleRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      this.refresh();
      event.target.complete();
    }, 2000);
  };

}
