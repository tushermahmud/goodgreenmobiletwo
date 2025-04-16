import { Component, OnInit } from '@angular/core';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';

@Component({
  selector: 'app-agent-affiliations',
  templateUrl: './agent-affiliations.component.html',
  styleUrls: ['./agent-affiliations.component.css']
})
export class AgentAffiliationsComponent implements OnInit {

  
  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Affiliations`
  }; 

  selectedTab: 'affiliations' | 'invites' = 'affiliations';

  constructor() { }

  ngOnInit(): void {

  }

  changeTab(type: 'affiliations' | 'invites') {
    this.selectedTab = type;
  }

}
