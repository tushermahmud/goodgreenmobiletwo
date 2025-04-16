import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs } from '@ionic/angular';
import { GlobalHeaderObject } from '../models/global-header.model';

@Component({
  selector: 'app-post-auth-lead-mover',
  templateUrl: './post-auth-lead-mover.component.html',
  styleUrls: ['./post-auth-lead-mover.component.css']
})
export class PostAuthLeadMoverComponent implements OnInit {
  @ViewChild('tabs',{static:false}) tabs: IonTabs;
  selectedTab: string = null;
  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: false,
    isnotificationIconVisible: true,
    isUserProfileVisible: true,
    headerText: `Dashboard`,
  };

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    console.log('FROM PARTNER COMPONENT');
    this.selectedTab = 'employee-dashboard'
  }

  getSelectedTab(){
    this.selectedTab = this.tabs.getSelected();
    console.log('this.selectedTab',this.selectedTab);
    
    if(this.selectedTab === 'employee-dashboard'){
      this.headerInfo.headerText='Dashboard';
    }
    else if(this.selectedTab === 'employee-jobs'){
      this.headerInfo.headerText='Jobs';
      // this.router.url.includes('job-details') ?  this.headerInfo.isBackBtnVisible = true :  this.headerInfo.isBackBtnVisible = false;
   
    }
    else if(this.selectedTab === 'employee-notifications'){
      this.headerInfo.headerText='More';
    }
  }

}
