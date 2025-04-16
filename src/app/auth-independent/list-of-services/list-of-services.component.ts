import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import SwiperCore, { Pagination, SwiperOptions } from 'swiper';
SwiperCore.use([Pagination]);

@Component({
  selector: 'app-list-of-services',
  templateUrl: './list-of-services.component.html',
  styleUrls: ['./list-of-services.component.css']
})
export class ListOfServicesComponent implements OnInit {

  index = 0;
  finalButton = false;

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  toOurServices() {
    this.router.navigate(['iauth', 'list-of-services', 'our-services']);
  }

  onSwiper(swiper) {
    console.log(swiper);
  }
  onSlideChange(e) {
    this.index = e.realIndex;
    if(this.index === 3) {
      this.finalButton = true;
    } else {
      this.finalButton = false;
    }
    // console.log(this.index, this.finalButton);
    this.cd.detectChanges();
  }

}
