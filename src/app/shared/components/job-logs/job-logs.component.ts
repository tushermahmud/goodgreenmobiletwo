import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { JobLogs } from 'src/app/models/job-logs.model';
import { AppState } from 'src/app/state/app.state';
import { SharedModule } from '../../shared.module';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-logs',
  templateUrl: './job-logs.component.html',
  styleUrls: ['./job-logs.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JobLogsComponent implements OnInit {

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Job Logs`,
  };
  metaData:any;
  jobLogs: JobLogs[] = [];
  constructor(
    private leadHelperService: LeadHelperService,
    private store: Store<AppState>,
    private route: Router,
    private loaderService: IonLoaderService
  ) { 
    
   }

  ngOnInit() {
    this.metaData = this.route.getCurrentNavigation().extras.state.meta;
    console.log('this.metaData',this.metaData);
    


    this.getJobLogs(this.metaData.businessAccountId, this.metaData.accountId, this.metaData.jobCardId, this.metaData.jobId)
    
  }

  async getJobLogs(businessAccountId,accountId,jobCardId, jobId) {
    await this.loaderService.createLoading('Loading job logs...')
    this.leadHelperService.getJobLogs(businessAccountId,accountId,jobCardId, jobId).subscribe({
      next: (logsRes:JobLogs[]) => {
        console.log('logsRes',logsRes);
        this.jobLogs = logsRes;
       
        this.loaderService.dismissLoading();
      },
      error: (error) => {
        console.log('err', error);
        this.loaderService.dismissLoading();
        
      }
    })
  }

}
