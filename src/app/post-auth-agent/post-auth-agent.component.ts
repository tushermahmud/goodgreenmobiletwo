import { Component, OnInit } from '@angular/core';
import { GlobalHeaderObject } from '../models/global-header.model';

@Component({
  selector: 'app-post-auth-agent',
  templateUrl: './post-auth-agent.component.html',
  styleUrls: ['./post-auth-agent.component.css']
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
