import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { addActivityName } from 'src/app/state/order/order.actions';
import { selectSelectedService } from 'src/app/state/order/order.selectors';

@Component({
    selector: 'app-add-activity',
    templateUrl: './add-activity.component.html',
    styleUrls: ['./add-activity.component.css']
})
export class AddActivityComponent implements OnInit {

    activityForm: FormGroup;
    getOrderState: Observable<any>;
    userAuthStatus: Observable<any>;
    authData;
    submitted = false;
    submitBtnLoader = false;
    errorCode = null;
    statusCode = null;
    selectedService;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: false,
        isUserProfileVisible: false,
        headerText: `New Project`
    };

    constructor(private navCtrl: NavController,
        private store: Store<AppState>,
        private navController: NavController,
        private formBuilder: FormBuilder,

    ) {
        this.getOrderState = this.store.select(selectSelectedService);
        this.userAuthStatus = this.store.select(selectAuthData);
    }

    get f() { return this.activityForm.controls; }

    ngOnInit(): void {


        this.userAuthStatus.subscribe((data) => {
            this.authData = data;
            if (this.authData.isAuthenticated) {
                this.heraderInfo.isUserProfileVisible = true;
            }
            console.log('this.authData', this.authData);
        });

        this.getOrderState.subscribe((selectedService) => {
            this.selectedService = selectedService;
            console.log('current-selectedService ====> ', selectedService);

            let projectName = 'My Home Moving';
            switch (selectedService?.category) {
                case 'moving_long_distance':
                case 'moving_short_distance':
                    projectName = 'My Home Moving';
                    break;
          
                case 'organizing':
                    projectName = 'My Home Organizing';
                    break;
          
                case 'cleaning':
                    projectName = 'My Home Cleaning';
                  break;
          
                case 'hauling':
                    projectName = 'My Home Hauling';
                  break;
          
                case 'demolition':
                    projectName = 'Destructive Endeavors: Demolition Project';
                  break;
          
                case 'general_contractor':
                    projectName = 'PrimeBuild: Crafting Your Vision';
                  break;
          
                case 'handyman':
                    projectName = 'HandyHome Solutions: Your Repair Specialists';
                  break;
          
                case 'painting':
                    projectName = 'Colorful Canvases: Brushing Life Canvas';
                  break;
          
                case 'tiles':
                    projectName = 'TileCrafters: Precision Perfection';
                  break;
          
                case 'electrical':
                    projectName = 'ElectroPulse: Energizing Tomorrow';
                  break;
          
                case 'plumbing':
                    projectName = 'Liquid Logic: Innovative Plumbing';
                  break;
          
                case 'leak_detection':
                    projectName = 'DripAlert: Precision Leak Detection';
                  break;
          
                case 'landscape':
                    projectName = 'Landscaping Wonders: Earthly Transformations';
                  break;
                
                case 'solar_panels':
                    projectName = 'Solar Solutions: Empowering Tomorrow with Photovoltaics';
                    break;

                case 'flooring':
                    projectName = 'The Art of Flooring: A Home Enhancement Project';
                    break;
                
                case 'bin_rental':
                    projectName = 'GreenGuard Bins: Protecting the Environment, One Rental at a Time';
                    break;

                case 'truck_rental':
                    projectName = 'TruckMaster Rentals: On the Move';
                    break;

                case 'secure_storage':
                    projectName = 'SafeHaven Solutions: Reliable Secure Storage';
                    break;
              }

            this.activityForm = this.formBuilder.group({
                name: [projectName, [Validators.required]],
            });

        });
    }

    onSubmit() {
        this.submitted = true;

        // console.log(this.signinForm);
        if (!this.activityForm.valid) {
            return;
        }
        this.store.dispatch(addActivityName({
            name: this.activityForm.value.name
        }));

        this.navController.navigateForward(['iauth', 'video-upload', 'capture']);
    }

    goBack() {
        this.navCtrl.back();
    }


}
