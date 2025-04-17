import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';

@Component({
  selector: 'app-agent-affiliations',
  templateUrl: './agent-affiliations.component.html',
  styleUrls: ['./agent-affiliations.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
