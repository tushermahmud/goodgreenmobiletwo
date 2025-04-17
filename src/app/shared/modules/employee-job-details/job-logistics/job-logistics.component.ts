import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Location } from 'src/app/models/job-details.model';

@Component({
  standalone: true,
  selector: 'app-job-logistics',
  templateUrl: './job-logistics.component.html',
  styleUrls: ['./job-logistics.component.css'],
  imports: [
    CommonModule,
    IonicModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JobLogisticsComponent implements OnInit {

  @Input() locations: any;
  listOfLocations: any;
  pickup: any[];
  intermediate: any[];
  dropup: any[];
  constructor() { }

  ngOnInit(): void {
    console.log('locations', this.locations);
    this.listOfLocations = [...this.locations];
    this.pickup = this.listOfLocations.filter(location => {
      if((location.pin === 'pickup' || location.pin === 'site') && location.isIntermediate === false){
        return location;
      }
    });

    this.intermediate = this.listOfLocations.filter(location => {
      if(location.pin === 'intermediate' || location.isIntermediate === true){
        return location;
      }
    });

    this.dropup = this.listOfLocations.filter(location => {
      if(location.pin === 'drop' && location.isIntermediate === false){
        return location;
      }
    });
  }
}
