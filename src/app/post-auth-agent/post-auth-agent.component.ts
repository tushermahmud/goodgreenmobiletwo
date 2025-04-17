import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { GlobalHeaderObject } from '../models/global-header.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-auth-agent',
  templateUrl: './post-auth-agent.component.html',
  styleUrls: ['./post-auth-agent.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PostAuthAgentComponent implements OnInit {
  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: false,
    isnotificationIconVisible: false,
    isUserProfileVisible: true,
    headerText: `Dashboard`,
  }; 

  constructor() { }

  ngOnInit(): void {
  }

}
