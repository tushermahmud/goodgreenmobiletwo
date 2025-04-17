import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule,
	],
})
export class VideoUploadComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
