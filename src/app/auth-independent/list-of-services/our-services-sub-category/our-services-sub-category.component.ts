import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-our-services-sub-category',
  templateUrl: './our-services-sub-category.component.html',
  styleUrls: ['./our-services-sub-category.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OurServicesSubCategoryComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
