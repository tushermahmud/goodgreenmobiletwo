import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { AlertController, IonAccordion, IonAccordionGroup, IonRadio, ModalController, NavController, ToastController, ToastOptions } from '@ionic/angular';
import { CommonService } from 'src/app/core/services/common/common.service';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { AddendumForm, FormTypes } from 'src/app/models/addendum.model';
import { CreateAddendum } from 'src/app/models/create-addendum';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AddendumBuilderComponent } from '../addendum-builder/addendum-builder.component';
import { KeyValue } from '@angular/common';

type SortNullFn = (a: KeyValue<string, any>, b: KeyValue<string, any>) => number;

@Component({
  selector: 'app-add-addendum',
  templateUrl: './add-addendum.component.html',
  styleUrls: ['./add-addendum.component.css']
})
export class AddAddendumComponent implements OnInit {
 
  addendumForm: FormGroup;

  selectedselectedCard:any = null;

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: true,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: `Addendum`,
  };

  addendumFormsData = {
    schedules: {
      isChecked: false,
      formData: null // will hold data we get from the form builder popup  
    },
    trucks:{
      isChecked: false,
      formData: null,
      totalCost: null
    },
    supplies:{
      isChecked: false,
      formData: null,
      totalCost: null
    },
    notes: {
      isChecked: false,
      formData: null
    }
  }
  metaData: any; // holds routs meta info like baid, account-id 

  totalTruksCost;
  totalSuppliesCost;


  constructor(
    private navController: NavController,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController,
    private commonService: CommonService,
    private leadHelperService: LeadHelperService,
    private loaderService: IonLoaderService,
    private ionRouterService: NavController
    ) { }

 
  ngOnInit(): void {
    this.metaData = this.router.getCurrentNavigation().extras?.state?.meta;
    //listen to update form FormData stream 
    this.commonService.shouldUpdateFormData$.subscribe((data: any) => {
      if(!data) return;
      const keyToUpdate = Object.keys(data)[0];
      console.log('keyToUpdate',keyToUpdate);
      console.log('keyToUpdate data',data);
      
      
      if(keyToUpdate === 'notes') {
        this.addendumFormsData[`${keyToUpdate}`].formData = {...data[`${keyToUpdate}`]};
      } else {
        this.addendumFormsData[`${keyToUpdate}`].formData = data[`${keyToUpdate}`];

        /**
         * temp fix need to change this 
         */
        if(keyToUpdate==='supplies'){
          this.addendumFormsData.supplies.totalCost = data.totalSuppliesCost;
        }
        if(keyToUpdate==='trucks'){
          this.addendumFormsData.trucks.totalCost = data.totalTrucksCost;
        }

      }
      this.addendumFormsData[`${keyToUpdate}`].isChecked = true;
      this.commonService.sendFormData(null);
      console.log('keyToUpdate',this.addendumFormsData);
    })
    
  }

  async openAddendumFormBuilder(type: FormTypes, mode: 'add' | 'edit' ) {
    console.log('type', type , this.addendumFormsData[`${type}`].formData);
    const modal = await this.modalController.create({
      component: AddendumBuilderComponent,
      componentProps: {
        baId:this.metaData?.businessAccountId,
        formType: type,
        formMode: mode ,
        existingFormData: this.addendumFormsData[`${type}`].formData ||  null,
        totalCost: type === 'trucks' || type === 'supplies' ? this.addendumFormsData[`${type}`].totalCost : null
      },
    });
    
    await modal.present();
    // on dismiss
    return await modal.onWillDismiss();
   
  }


  
  onCardClick(e: any, key) {
    if (key) {
      console.log('ADD ADDENDUM onCardClick', key);
      // return; 
      this.selectedselectedCard = key;
      if(!this.addendumFormsData[`${this.selectedselectedCard}`].formData) {
        console.log('ADD ADDENDUM');
        
        this.openAddendumFormBuilder(this.selectedselectedCard, 'add');
      } else {
        console.log('EDIT ADDENDUM');
        console.log('this.addendumFormsData EXISTING', this.addendumFormsData);
        
        this.editForm(this.selectedselectedCard)
      }
    }
  }


  onToggle(e, key) {
    e.stopPropagation();
    console.log('EVENT', e);
    let isChecked: boolean = e.detail.checked;
    let selectedAccordionKey = null;

    if(isChecked === false) return;

    selectedAccordionKey = e.detail.value;
    console.log('selectedAccordionKey', selectedAccordionKey, key ,this.addendumFormsData);
    let CheckedFormValue = this.addendumFormsData[`${selectedAccordionKey}`];
    let CheckedFormValuea = this.addendumFormsData[`${key}`];
    console.log('CheckedFormValue', CheckedFormValuea);
    
    if(!CheckedFormValue) {
      this.openAddendumFormBuilder(selectedAccordionKey, 'add');
    }
     else if (this.addendumFormsData[`${e.detail.value}`] !== null) { // refactor here
      this.addendumFormsData[`${e.detail.value}`] = null;
    }
  
  }

  editForm(key: FormTypes) {
    this.openAddendumFormBuilder(key, 'edit');
  }

  hasFormData = () => {
    return Object.values(this.addendumFormsData).some(nestedObj => nestedObj.formData !== null);
  }

  onResetForm() {

    for (let key in this.addendumFormsData) {
      if (this.addendumFormsData.hasOwnProperty(key)) {
        this.addendumFormsData[key].formData = null;
        this.addendumFormsData[key].isChecked = false;
      }
    }

  }

  checkboxClicked(event: any) {
    console.log('CHECK BOX EVENT ', event)
    let isChecked = event.detail.checked;
    let selectedKey = event.detail.value;
    if(isChecked && !this.addendumFormsData[`${selectedKey}`].formData) {
      this.openAddendumFormBuilder(selectedKey, 'add');
    }
  }

  async onSubmitAddendum() {
    
    await this.loaderService.createLoading(`Creating change order...`);
    let addendumPayload  = this.generateAddendumPayload();
    console.log('addendumPayload', addendumPayload);
    
    // return;
    this.leadHelperService.createAddendum(addendumPayload).subscribe({

      next: async (createdRes) => {
        console.log('createdRes',createdRes);
        await this.loaderService.dismissLoading();
        await this.commonService.showToast('Change order created successfully!');
        // trigger jd refresh event
        this.commonService.refreshJobDetails.next(true);
        this.ionRouterService.back()
      },
      error: async (err) => {
        console.log('err', err);
        if(err) {
       
          await this.loaderService.dismissLoading();
          await this.commonService.showToast(`We encountered an issue and couldn't load the list of services. To try again click Retry`);
        }
      }
    })
    
  }

  private generateAddendumPayload() {
    const payload: CreateAddendum = {
      serviceItemId: this.metaData.serviceItemId,
      businessAccountId: this.metaData.businessAccountId,
      itemsToBeMoved: "",
      itemsToBePacked: "",
      itemsToBeDisposed: "",
      createdByAccId: this.metaData.createdByAccId,
      totalSuppliesCost: 0,
      totalTrucksCost: 0,
      schedules: [],
      trucks:[],
      supplies:[]
    };

    for (const key in this.addendumFormsData) {
      const element = this.addendumFormsData[key];
      console.log('key',key);
      console.log('element ===>>', element);

      if(element.isChecked) {
        switch (key) {
          case 'schedules': {
            let schedulePayload = element.formData;
            schedulePayload.forEach(sch => {
                
              sch.datetime = (new Date(sch.datetime)).toISOString();
              sch['timezoneOffset'] = (new Date()).getTimezoneOffset();
              if(sch.hasOwnProperty('leads')) {
                sch['leadHelpers'] = sch['leads'];
                delete sch['leads'];
              }
              payload.schedules.push(sch);
            });
          }
          break;

          case 'trucks': {
            let trucksPayload = element.formData;
            trucksPayload.forEach(truck => {
                truck.datetime = (new Date(truck.datetime)).toISOString();
                truck['timezoneOffset'] = (new Date()).getTimezoneOffset();
                payload.trucks.push(truck);
            })
            payload.totalTrucksCost = element.totalCost;
          }
          break;

          case 'supplies': {
            const suppliesPayload = element.formData;
            suppliesPayload.forEach(supply => {
              payload.supplies.push(supply);
            });
            payload.totalSuppliesCost = element.totalCost;
          }
          break;

          case 'notes': {
            const notesPayload = element.formData;
            payload.itemsToBeMoved = notesPayload.itemsToBeMoved;
            payload.itemsToBePacked = notesPayload.itemsToBePacked;
            payload.itemsToBeDisposed = notesPayload.itemsToBeDisposed;
          }
          break;
        
          default:
            break;
        }

      }
    }

    return payload;
  }

  async showSubmitAddendumAlert() {

    const message = 'You are about to create a new addendum for this service. Once the addendum is generated, an email will be sent to the Customer and the Lead (for this service) for signature. ' +
    'Click on Cancel if you want to verify the sections added. If addendum sections are confirmed, please click on OK to submit.';

    const alert = await this.alertController.create({
      header: 'Confirm Submission',
      subHeader: 'Add new addendum?',
      message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Alert canceled');
            
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.onSubmitAddendum();
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

    console.log('role', role);
    
    // this.roleMessage = `Dismissed with role: ${role}`;
  }
  
  /**
   * @description: need this dummy function to prevent ngFor | keyValue from changing 
   * the order of iteration
   */
  sortNull: SortNullFn = (a, b) => 0;
}
