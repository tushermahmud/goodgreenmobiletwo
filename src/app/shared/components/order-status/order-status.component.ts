import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { SharedModule } from '../../shared.module';

@Component({
  standalone: true,
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.css'],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
