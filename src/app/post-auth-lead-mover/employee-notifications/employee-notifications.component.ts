import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-notifications',
  templateUrl: './employee-notifications.component.html',
  styleUrls: ['./employee-notifications.component.css']
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
