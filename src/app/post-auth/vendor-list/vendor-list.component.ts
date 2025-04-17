import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VendorListComponent implements OnInit {

  heraderInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: true,
    isUserProfileVisible: true,
    headerText: `Vendor List`
 };

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  toDashboard() {
    this.router.navigate(['user', 'dashboard']);
  }

}
