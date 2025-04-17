import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';

@Component({
  selector: 'app-video-instructions',
  templateUrl: './video-instructions.component.html',
  styleUrls: ['./video-instructions.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideoInstructionsComponent implements OnInit {

  heraderInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Media Instructions`
  };

  constructor(
    private navController: NavController
  ) { }

  ngOnInit(): void {
  }

  goBack() {
    this.navController.navigateBack('');
  }
}
