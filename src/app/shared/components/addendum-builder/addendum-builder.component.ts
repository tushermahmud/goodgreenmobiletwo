import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonDatetime, ModalController, PopoverController } from '@ionic/angular';
import { CommonService } from 'src/app/core/services/common/common.service';
import { LeadHelperService } from 'src/app/core/services/lead-helper/lead-helper.service';
import { FormTypes } from 'src/app/models/addendum.model';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';

@Component({
  selector: 'app-addendum-builder',
  templateUrl: './addendum-builder.component.html',
  styleUrls: ['./addendum-builder.component.css']
})
export class AddendumBuilderComponent implements OnInit {

  @Input() formType: FormTypes;
  @Input() formMode: 'add' | 'edit';
  @Input() totalCost?: any;
  @Input() existingFormData: any;
  @Input() baId:any;
  @Output() formData: EventEmitter<any> = new EventEmitter<FormGroup>();

  schedulePickupDate: any;
  suppliesList = [];
  filteredSupplies=[];

  headerInfo: GlobalHeaderObject = {
    isBackBtnVisible: false,
    isnotificationIconVisible: false,
    isUserProfileVisible: false,
    headerText: '',
  };
  supplyItem:any;
  addendumForm: FormGroup;
  isAddendumSubmitted: boolean = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private commonService: CommonService,
    private datePipe: DatePipe,
    private popoverController: PopoverController,
    private leadHelperService:LeadHelperService
  ) { }

  ngOnInit() {
    console.log('formType', this.formType);
    console.log('existingFormData ===+++>>>', this.existingFormData);
    console.log('formMode===>>', this.formMode);
    this.headerInfo.headerText = this.setHeaderText(this.formType);

    this.inIt(this.formType, this.existingFormData);
    this.getSuppliesList();
  }


  inIt(formType: FormTypes, existingFormData: any) {

    if(this.existingFormData && this.formMode === 'edit') {
      this.buildOrPatchForms(formType, true, existingFormData)
    } else {
      this.buildOrPatchForms(formType, false, existingFormData)
    }
    if(formType === 'trucks' || formType === 'supplies') {
      this.changeListeners();
    }
  }

  close() {
    this.modalController.dismiss()
  }


  get schedulesControls(): FormArray {
    return this.addendumForm.get('schedules') as FormArray;
  }
  get suppliesControls(): FormArray {
    return this.addendumForm.get('supplies') as FormArray;
  }
  get trucksControls(): FormArray {
    return this.addendumForm.get('trucks') as FormArray;
  }
  get noteControls(): FormGroup {
    return this.addendumForm.get('notes') as FormGroup;
  }

  calcTotalTruckCost(trucksData) {
    const result = trucksData?.reduce((acc, curr) => {

      return acc + Number(curr.vans) + Number(curr.shuttles) +
        Number(curr.pickupTrucks) + Number(curr.fourteenTrucks) + Number(curr.sixteenTrucks) +
        Number(curr.twentyTrucks) + Number(curr.twentyFourTrucks) + Number(curr.twentySixTrucks);

    }, 0);

    let  totalTruckCost = result * 100;

    return totalTruckCost;
  }

  buildOrPatchForms(formType: FormTypes , shouldPatch: boolean, formData: any) {
    console.log('this.addendumForm patchForms', this.addendumForm, formData);

    switch (formType) {
      case 'schedules':
        this.addendumForm = this.fb.group({
          schedules: this.fb.array([this.buildSchedulesForm()]),
        });

        if(shouldPatch) {
          this.schedulesControls.clear();
          formData.forEach((schedule: any, i) => {
            const forms = this.fb.group({
              datetime: [this.datePipe.transform(schedule.datetime, 'MMM d, y, h:mm a')],
              time: [schedule.time],
              duration: [schedule.duration,Validators.required],
              leads: [schedule.leads,Validators.required],
              helpers: [schedule.helpers,Validators.required],
              planOfAction: [schedule.notes],
              timezoneOffset: (new Date()).getTimezoneOffset()
            })
            this.schedulesControls.push(forms);
          })
        }

        break;
      case 'supplies':
        this.addendumForm = this.fb.group({
          supplies: this.fb.array([this.buildSuppliesForm()]),
          totalSuppliesCost:[0, Validators.required]
        });

        if(shouldPatch) {
          console.log('supplies', this.addendumForm);
          this.suppliesControls.clear();
          formData.forEach((supplies: any) => {
            const forms = this.fb.group({
              name: [supplies.name],
              quantity: [supplies.quantity],
              price: [supplies.price]
            })
            this.suppliesControls.push(forms);
          })

          this.addendumForm.controls['totalSuppliesCost'].setValue(this.totalCost)
        }
        break;
      case 'trucks':
        this.addendumForm = this.fb.group({
          trucks: this.fb.array([this.buildTruckForm()]),
          totalTrucksCost:[0, Validators.required]
        });

        if(shouldPatch) {
          this.trucksControls.clear();
          formData.forEach((truck: any) => {
            const forms = this.fb.group({
              datetime:[this.datePipe.transform(truck.datetime, 'MMM d, y, h:mm a')],
              vans: [truck.vans],
              shuttles: [truck.shuttles],
              pickupTrucks: [truck.pickupTrucks],
              fourteenTrucks: [truck.fourteenTrucks],
              sixteenTrucks: [truck.sixteenTrucks],
              twentyTrucks: [truck.twentyTrucks],
              twentyFourTrucks: [truck.twentyFourTrucks],
              twentySixTrucks: [truck.twentySixTrucks],
              timezoneOffset: (new Date()).getTimezoneOffset()
            })
            this.trucksControls.push(forms);
          })

          this.addendumForm.controls['totalTrucksCost'].setValue(this.totalCost)
        }
        break;
      case 'notes':
        this.addendumForm = this.buildNotesForm();
        console.log('notes PATCH this.addendumForm ', this.addendumForm);
        // this.addendumForm.cl
        if(shouldPatch) {

          this.addendumForm.patchValue({
            itemsToBeMoved: formData.itemsToBeMoved,
            itemsToBePacked: formData.itemsToBePacked,
            itemsToBeDisposed: formData.itemsToBeDisposed
          })
          console.log('team', this.addendumForm);
        }
        break;
      default:
        this.addendumForm = this.fb.group({});
    }
    
  }

  changeListeners() {
    if(this.formType === 'trucks') {
      this.addendumForm.controls['trucks'].valueChanges.subscribe(data => {
        console.log('trucks CHANGES ===>>', data);
        let tCost  = this.calcTotalTruckCost(data)
        this.addendumForm.controls['totalTrucksCost'].setValue(tCost);
      })

    } else if(this.formType === 'supplies') {
      this.addendumForm.controls['supplies'].valueChanges.subscribe(data => {
        console.log('supplies CHANGES ===>>', data);
        // this.setSupplyItem(data);
        let tSupplyCost = this.calcSupplyCost(data);
        this.addendumForm.controls['totalSuppliesCost'].setValue(tSupplyCost)
      })
    }
  }

  calcSupplyCost(suppliesData: any) {
    let supplies = suppliesData;
    let totalsupplyItemscost = 0;
    supplies.forEach((supply) => {
      if (supply.name) {
        let cost = Number(supply.price);
        let noOfItems = Number(supply.quantity);
        totalsupplyItemscost += cost * noOfItems;
      }

    });
    return totalsupplyItemscost;
  }

  buildSchedulesForm(): FormGroup {
    let date = new Date().toISOString()
    return this.fb.group({
      datetime: [this.datePipe.transform(date, 'MMM d, y, h:mm a')],
      time: [date],
      duration: [0,Validators.required],
      leads: [0,Validators.required],
      helpers: [0,Validators.required],
      planOfAction: [''],
    });
  }

  buildSuppliesForm(): FormGroup {
    return this.fb.group({
      name: [''],
      quantity: [0],
      price: [0],
    });
  }

  buildNotesForm(): FormGroup {
    return this.fb.group({
      itemsToBeMoved: [''],
      itemsToBePacked: [''],
      itemsToBeDisposed: [''],
    });
  }

  buildTruckForm(): FormGroup {
    // next date manipulation for the newly added row
    let currDate = new Date();

    return this.fb.group({
      datetime: [ this.datePipe.transform(currDate, 'MMM d, y, h:mm a')],
      vans: [0],
      shuttles: [0],
      pickupTrucks: [0],
      fourteenTrucks: [0],
      sixteenTrucks: [0],
      twentyTrucks: [0],
      twentyFourTrucks: [0],
      twentySixTrucks: [0],
    });
  }

  addSchedulesForm() {
    const control = <FormArray>this.addendumForm.controls.schedules;
    control.push(this.buildSchedulesForm());
  }

  addTruckForm() {
    const control = <FormArray>this.addendumForm.controls.trucks;
    control.push(this.buildTruckForm());
  }

  addSuppliesForm() {
    const control = <FormArray>this.addendumForm.controls.supplies;
    control.push(this.buildSuppliesForm());
  }

  removeSupplyBlock(i: number){
    this.suppliesControls.removeAt(i)
  }
  removeTruckBlock(i: number){
    this.trucksControls.removeAt(i)
  }
  removeScheduleBlock(i: number){
    this.schedulesControls.removeAt(i)
  }


  async addOrUpdateForm(formData) {
    if (!formData || !this.addendumForm.valid) return;

    if (this.formType === 'notes') {
      let newFomData = {
        notes: { ...formData }
      }
      formData = newFomData;
      console.log('newFomData', formData);

    }
    this.commonService.sendFormData(formData)
    await this.modalController.dismiss(formData)

  }

  
  setHeaderText(formType: FormTypes): string {
    if(!formType) return;

    let txt: string;
    if (formType === 'schedules') {
      txt = 'Add schedules'
    } else if(formType === 'trucks'){
      txt = 'Add trucks'
    } else if(formType === 'supplies') {
      txt = 'Add supplies'
    } else if(formType === 'notes') {
      txt = 'Add notes'
    } else {
      txt = 'Add'
    }
    
    return txt;
  }
  
  async presentTimeStartsPicker(selectedform: FormGroup) {
    const popover = await this.popoverController.create({
      component: IonDatetime,
    });
  
    await popover.present();
  
    popover.firstChild.addEventListener('ionChange', (e: any) => {
      console.log('e', e);
      selectedform.controls['datetime'].setValue(this.datePipe.transform(e.detail.value, 'MMM d, y, h:mm a') );
    });
  }


  noDecimal(event) { // [0-9] this regEx will specfy the input to take only numbers
    console.log('event',event)
    if (event && String.fromCharCode(event.charCode).match(/[0-9]/)) {
      return event.CharCode
    } else {
      return event.preventDefault();
    }
  }


  getSuppliesList() {
		this.leadHelperService.getDefaultSupplyItems(this.baId).subscribe({
			next: (res) => {
				this.suppliesList =[...res];
			},
			error: (err) => {
				console.log('err', err);
			},
		});
	}


  // filterSupply(event) {
  //   const filtered: any[] = [];
  //   const query = event.query;

  //   for (let i = 0; i < this.suppliesList.length; i++) {
  //     const supplyItem = this.suppliesList[i];
  //     if (supplyItem.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
  //       filtered.push(supplyItem);
  //     }
  //   }

  //   this.filteredSupplies = filtered;
  // }

  handleChange(e) {
    console.log('e.detail.value',e.detail.value)
    this.supplyItem =  e?.detail?.value;
  }

}
