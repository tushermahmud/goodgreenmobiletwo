import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServiceItemDocument } from 'src/app/models/service-item-document.model';
import { DocumentViewerComponent } from 'src/app/shared/components/document-viewer/document-viewer.component';

@Component({
  standalone: true,
  selector: 'app-agent-service-documets',
  templateUrl: './agent-service-documets.component.html',
  styleUrls: ['./agent-service-documets.component.css'],
  imports: [
    DocumentViewerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AgentServiceDocumetsComponent implements OnInit {
  @Input() documents: any[] = null;
  @Input() agentId: string;
  @Input() contractId: number;
  @Input() customerId: any;

  constructor(public modalController: ModalController) { }

  ngOnInit(): void {
      console.log('ServiceDocumentsComponent:', this.documents);
  }

  async presentDocViewer(document: ServiceItemDocument) {

      console.log('current document:', document);
      // send id of whatever the item user selects, and call the api related to that document in document viewer component
      const modal = await this.modalController.create({
          component: DocumentViewerComponent,
          cssClass: 'my-custom-class',
          canDismiss: true,
          breakpoints: [0, 0.25, 0.5, 1],
          componentProps: {
              doc: document,
              customerId: this.agentId,
              contractId: this.contractId
          }
      });
      return await modal.present();
  }

}
