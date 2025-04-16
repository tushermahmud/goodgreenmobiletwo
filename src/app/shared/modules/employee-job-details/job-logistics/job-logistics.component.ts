import { Component, Input, OnInit } from '@angular/core';
import { Location } from 'src/app/models/job-details.model';

@Component({
  selector: 'app-job-logistics',
  templateUrl: './job-logistics.component.html',
  styleUrls: ['./job-logistics.component.css']
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
