import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-employee-notifications',
  templateUrl: './employee-notifications.component.html',
  styleUrls: ['./employee-notifications.component.css'],
  standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmployeeNotificationsComponent implements OnInit {
  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {
    }

  goToTimeOffs(){
    this.router.navigate(['lead','employee-notifications','time-offs'])
  }

  goToJobHistory(){
    this.router.navigate(['lead','employee-notifications','job-history'])
  }
}
