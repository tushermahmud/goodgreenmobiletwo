import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.css']
})
export class OrderStatusComponent implements OnInit {

  @Input() title: string;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit(): void {
  }

  async closeModel() {
    const close = 'Modal Removed';
    await this.modalController.dismiss(close);
  }

}
