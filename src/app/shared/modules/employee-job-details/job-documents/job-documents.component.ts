import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Document, JobCard } from 'src/app/models/job-details.model';
import { JdDocViewerComponent } from 'src/app/shared/components/jd-doc-viewer/jd-doc-viewer.component';

@Component({
  standalone: true,
  selector: 'app-job-documents',
  templateUrl: './job-documents.component.html',
  styleUrls: ['./job-documents.component.css'],
  imports: [
    JdDocViewerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class JobDocumentsComponent implements OnInit {

  @Input() documents: Document[];

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
    console.log('docs', this.documents);
  }

  async presentDocViewer(document: Document) {

    console.log('current document:', document);
    // send id of whatever the item user selects, and call the api related to that document in document viewer component
    const modal = await this.modalController.create({
        component: JdDocViewerComponent,
        cssClass: 'my-custom-class',
        canDismiss: true,
        breakpoints: [0, 0.25, 0.5, 1],
        componentProps: {
            doc: document
        }
    });
    return await modal.present();
  }

}
