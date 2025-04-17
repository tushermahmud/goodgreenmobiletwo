import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { OrderService } from 'src/app/core/services/order/order.service';
import { AppState } from 'src/app/state/app.state';
import { selectAuthData } from 'src/app/state/auth/auth.selectors';
import { addAdditionalServices, changeGetStarted } from 'src/app/state/order/order.actions';
import { getOrderData } from 'src/app/state/order/order.selectors';
import { AlertController, IonicModule, NavController } from '@ionic/angular';
import { ServiceOffering } from 'src/app/models/service-offering.model';
import { ServiceCategory } from 'src/app/definitions/service-category.enum';
import { DEFAULT_SERVICE_LABEL } from 'src/app/auth-independent/video-upload/video-upload-constants';
import { MediaUploadLocation } from 'src/app/definitions/media-upload-location.interface';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { AuthState } from 'src/app/state/auth/auth.state';
import { OrderState } from 'src/app/state/order/order.reducers';
import { GlobalHeaderObject } from 'src/app/models/global-header.model';
import { IonLoaderService } from 'src/app/core/services/ion-loader/ion-loader.service';
import { CreateNewRequest } from 'src/app/models/agent-createSR.model';
import { AgentService } from 'src/app/core/services/agent/agent.service';
import { CommonModule } from '@angular/common';


type MediaType = 'video' | 'image';

@Component({
    selector: 'app-additional-services',
    templateUrl: './additional-services.component.html',
    styleUrls: ['./additional-services.component.css'],
    standalone: true,
	imports: [
		CommonModule,
		IonicModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdditionalServicesComponent implements OnInit {

    services: ServiceOffering[] = [];
    selectedServiceIds: number[] = [];

    getAuthState: Observable<AuthState>;
    getOrderState: Observable<OrderState>;
    authData: AuthState;
    orderData: OrderState;
    addtnlServices: any = null;

    uploadCounter = 0;
    private serviceRequestData = null;

    // view data model
    serviceLabel: string = DEFAULT_SERVICE_LABEL;
    isRequestInProcess = false;

    heraderInfo: GlobalHeaderObject = {
        isBackBtnVisible: true,
        isnotificationIconVisible: true,
        isUserProfileVisible: true,
        headerText: this.serviceLabel
    };

    loginUser = null;
    locations : any;


    constructor(private alertController: AlertController,
        private router: Router,
        private fileTransfer: FileTransfer,
        private cd: ChangeDetectorRef,
        private orderService: OrderService,
        private store: Store<AppState>,
        private loaderService: IonLoaderService,
        private navCtrl: NavController,
        private agentService: AgentService
    ) {
        console.log('inside AdditionalServicesComponent=========>');
        this.getAuthState = this.store.select(selectAuthData);
        this.getOrderState = this.store.select(getOrderData);
    }

    ngOnInit(): void {

        this.getAuthState.subscribe((authData) => {
            this.authData = authData;
            this.loginUser = this.authData?.authMeta?.type;
        });

        this.getOrderState.subscribe((service) => {
            console.log('service getOrderState', service);
            this.orderData = service;
            if (this.orderData?.dropAddress !== null && this.orderData?.intermediateAddress?.length > 0) {
                this.locations = [this.orderData.pickupAddress, ...this.orderData?.intermediateAddress, this.orderData.dropAddress];
            }
            else if (this.orderData?.dropAddress === null && this.orderData?.intermediateAddress?.length > 0) {
                this.locations = [this.orderData.pickupAddress, ...this.orderData?.intermediateAddress];
            }
            else if (this.orderData?.dropAddress !== null && this.orderData?.intermediateAddress?.length === 0) {
                this.locations = [this.orderData.pickupAddress, this.orderData.dropAddress];
            }
            else {
                this.locations = [this.orderData.pickupAddress];
            }
            console.log('locations',this.locations)
            // update title of the screen
            this.serviceLabel = this.orderData.service?.label;
        });

        this.fetchAdditionalServices();
    }

    ionViewWillEnter() {
        this.fetchAdditionalServices();
    }

    // ionViewDidLeave() {
    //     this.loaderService.dismissLoading();
    // }

    /**
     * Fetches the service offerings and filters out the ones that cannot be
     * taken up as additional services. This has to come from the backend API actually.
     */
    fetchAdditionalServices() {

        this.orderService.getServices().subscribe(res => {
            this.services = res;
            const selectedService = this.orderData.service;
            this.services.forEach(service => {
                service.address = 'pickup';
            });
            // remove moving services from  this.services
            this.services = this.services.filter(s => s.id !== selectedService.id);

            this.services = [...this.services];


            // discuss with sunil and enable ( Notes )
            /* if (this.orderData.service.category == ServiceCategory.MOVING_LONG_DISTANCE || this.orderData.service.category == ServiceCategory.MOVING_SHORT_DISTANCE) {
                this.services = this.services.filter(s => (s.category != ServiceCategory.MOVING_LONG_DISTANCE && s.category != ServiceCategory.MOVING_SHORT_DISTANCE));
            } */
            // by default filter moving services
            this.services = this.services.filter(s => (s.category != ServiceCategory.MOVING_LONG_DISTANCE && s.category != ServiceCategory.MOVING_SHORT_DISTANCE));
            switch (this.orderData?.service?.category) {
                case 'organizing':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.ORGANIZING));
                    break;

                case 'cleaning':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.CLEANING));
                    break;

                case 'hauling':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.HAULING));
                    break;

                case 'interior_design':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.INTERIOR_DESIGN));
                    break;

                case 'handyman':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.HANDYMAN));
                    break;

                case 'painting':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.PAINTING));
                    break;

                case 'tiles':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.TILES));
                    break;

                case 'general_contractor':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.GENERAL_CONTRACTOR));
                    break;

                case 'demolition':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.DEMOLITION));
                    break;

                case 'landscape':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.LANDSCAPE));
                    break;

                case 'leak_detection':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.LEAK_DETECTION));
                    break;

                case 'plumbing':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.PLUMBING));
                    break;

                case 'electrical':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.ELECTRICAL));
                    break;

                case 'solar_panels':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.SOLAR_PANELS));
                    break;

                case 'flooring':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.FLOORING));
                    break;

                case 'bin_rental':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.BIN_RENTAL));
                    break;
                
                case 'truck_rental':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.TRUCK_RENTAL));
                    break;

                case 'secure_storage':
                    this.services = this.services.filter(s => (s.category !== ServiceCategory.SECURE_STORAGE));
                    break;
            }

        }, err => {
            console.log(err);
        });
    }

    selectService(index): void {
        if (!this.selectedServiceIds.includes(this.services[index].id)) {
            this.selectedServiceIds.push(this.services[index].id);
        } else {
            this.selectedServiceIds = this.selectedServiceIds.filter(s => s !== this.services[index].id);
        }
        console.log('selectedServiceIds', this.selectedServiceIds);
        
    }

    updateServiceAddressDetail(e, index) {
        e.stopPropagation();
        this.services[index].address = e.target.value;
        console.log('this.services', this.services, e.target.value);
    }

    toVendorList() {

        // creating additional services data
        this.addtnlServices = this.selectedServiceIds.map(id => {
            let serviceLocations:any = this.services.find(s => s.id === id).address;
            if (serviceLocations?.pin === 'pickup' || 'site') {
                return {
                    serviceId: id,
                    serviceDate: this.orderData.estimatedDate,
                    serviceLocations: [serviceLocations]
                };
            }

            else if (serviceLocations?.pin === 'drop') {
                return {
                    serviceId: id,
                    serviceDate: this.orderData.estimatedDate,
                    serviceLocations: [serviceLocations]
                };
            }

            else if (serviceLocations?.pin === 'intermediate') {
                return {
                    serviceId: id,
                    serviceDate: this.orderData.estimatedDate,
                    serviceLocations: [serviceLocations]
                };
            }
        });
        console.log('addtnlServices',this.addtnlServices);
        this.store.dispatch(addAdditionalServices({
            services: this.addtnlServices
        }));

        // add service request
        this.addServiceRequest();

        // this.router.navigate(['user', 'vendor-list']);
    }

    async addServiceRequest() {

        console.log(this.authData, this.orderData);
        this.isRequestInProcess = true;

        // temporary hack need to add some basic logic here
        // const serviceLocations = this.orderData.dropAddress ?
        //     [this.orderData.pickupAddress,[...this.orderData.intermediateAddress], this.orderData.dropAddress] :
        //     [this.orderData.pickupAddress,[...this.orderData.intermediateAddress]];
        let serviceLocations;
        if (this.orderData?.dropAddress !== null && this.orderData?.intermediateAddress?.length > 0) {
            serviceLocations = [this.orderData.pickupAddress, ...this.orderData?.intermediateAddress, this.orderData.dropAddress];
        }
        else if (this.orderData?.dropAddress === null && this.orderData?.intermediateAddress?.length > 0) {
            serviceLocations = [this.orderData.pickupAddress, ...this.orderData?.intermediateAddress];
        }
        else if (this.orderData?.dropAddress !== null && this.orderData?.intermediateAddress?.length === 0) {
            serviceLocations = [this.orderData.pickupAddress, this.orderData.dropAddress];
        }
        else {
            serviceLocations = [this.orderData.pickupAddress];
        }
        let payload = null;

        console.log('ORDER DATA', this.orderData.selectedAfflilation);
        // return
        if(this.authData.authMeta.type === 'agent') {
            // agent payload goes here 
            console.log('ORDER DATA', this.orderData);
          
            let agentPayload : CreateNewRequest = {

                service: {
                    contactNumber: this.orderData.contact.phoneNumber,
                    email: this.orderData.contact.email,
                    firstname: this.orderData.contact.firstname,
                    lastname: this.orderData.contact.lastname,
                    name: this.orderData.activityName,
                    serviceRequests: [{
                        serviceId: this.orderData.service?.id,
                        serviceDate: this.orderData.estimatedDate,
                        notes: this.orderData.notes,
                        serviceLocations
                    }]
                }, 
                founderBaId: this.orderData.selectedAfflilation.id

            };

            payload = agentPayload;

            // checking for additional services
            this.addtnlServices.forEach(service => {
                payload.service.serviceRequests.push(service);
            }); 
            
        } else {
            
            let customerPayload = {
                name: this.orderData.activityName,
                firstname: this.orderData.contact.firstname,
                lastname: this.orderData.contact.lastname,
                email: this.orderData.contact.email,
                contactNumber: this.orderData.contact.phoneNumber,
                serviceRequests: [{
                    serviceId: this.orderData.service?.id,
                    serviceDate: this.orderData.estimatedDate,
                    notes: this.orderData.notes,
                    serviceLocations
                }]
            };
            payload = customerPayload;
            // checking for additional services
            this.addtnlServices.forEach(service => {
                payload.serviceRequests.push(service);
            }); 
        }
    
        console.log('service-request payload:', JSON.stringify(payload));

        // creates a new service request and uploads media
        if (!this.serviceRequestData) {

            this.serviceRequestData = this.loginUser === 'agent' ? await this.registerServiceRequest(null,payload) :  await this.registerServiceRequest(payload, null);
            if (!this.serviceRequestData) {
                this.isRequestInProcess = false;
                await this.throwRetryAlert();
                return;
            }

            // upload associated media files
            await this.runMediaUploads();
            
        }
        else { // new service request is already created only upload media files have to retried

            await this.runMediaUploads(true);
        }
        this.isRequestInProcess = false;



        /* this.orderService.newServiceRequest(this.authData?.authMeta?.customer?.id, payload).subscribe(async res => {

            console.log('created new service-request response:', JSON.stringify(res));

            this.serviceRequestData = res;
            // upload media
            this.loaderService.createLoading('Uploading media, this might take couple of moments...');
            await this.initiateMediaUpload();

            console.log('Uploading media function call returned');

            await this.loaderService.dismissLoading();

            this.throwSuccessAlert();

            console.log('Uploading media success call returned');

        }, async err => {

            console.log(err);
            this.isRequestInProcess = false;
            await this.throwMediaRetryAlert();
        }); */

    }

    /**
     * initiates media uploads to the server
     */
    async runMediaUploads(isRetryAttempt = false) {

        try {
            // images
            /* this.orderData.selectedImages.forEach(async image => {
                // this.uploadAsset(file);
                const dirpath = image.fullPath.substr(0, image.fullPath.lastIndexOf('/') + 1);
                const dirUrl = await this.fileSystem.resolveDirectoryUrl(dirpath);
                this.fileSystem.getFile(dirUrl, image.name, {}).then((f) => {
                    f.file(filedata => {
                        // console.log(filedata);
                        this.readImageFileAndUpload(filedata);
                    });
                });
            }); */

            // console.log('initiating image uploads');
            // await Promise.all(this.orderData.selectedImages.map(image => { return this.uploadImageToS3(image); }));

            // console.log('initiating video uploads');
            // await Promise.all(this.orderData.selectedVideos.map(video => { return this.uploadVideoToS3(video); }));

            if (isRetryAttempt) {
                await this.loaderService.createLoading('Retrying media upload, this might take couple of moments...');
            }
            else {
                await this.loaderService.createLoading('Uploading media, this might take couple of moments...');
            }

            console.log('initiating media uploads');
            await Promise.all([
                ...this.orderData.selectedImages.map(image => this.uploadImageToS3(image)),
                ...this.orderData.selectedVideos.map(video => this.uploadVideoToS3(video))
            ]);

            // prompt user to go to dashboard
            await this.throwSuccessAlert();

            /* console.log('initiating image uploads');
            await Promise.all(this.orderData.selectedImages.map(image => { return this.uploadImageToS3(image); }));

            console.log('initiating video uploads');
            await Promise.all(this.orderData.selectedVideos.map(video => { return this.uploadVideoToS3(video); }));
            console.log('all media uploads completed'); */
        }
        catch (err) {
            console.error(`error uploading medias for service request, this operation can be tried again`, JSON.stringify(err));
            await this.throwRetryAlert();
            //throw err;
        }
        finally {
            await this.loaderService.dismissLoading();
        }

    }


    /* private readImageFileAndUpload(file: any) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            const formData = new FormData();
            formData.append('name', file.name);
            formData.append('file', imgBlob, file.name);
            this.uploadImageToS3(formData.get('file'));
            // console.log(formData.get('name'));
            // console.log(formData.get('file'));
        };
        reader.readAsArrayBuffer(file);
    } */

    /* private async readFile(fileEntry: FileEntry) {

        console.log(`reading media file: `, fileEntry.fullPath);
        const filedata = await new Promise<any>((resolve, reject) => {

            fileEntry.file((filedata) => {
                resolve(filedata);
            },
                (err) => {
                    console.log('error reading file entry', JSON.stringify(err));
                    reject(err);
                });
        });

        return new Promise<any>((resolve, reject) => {

            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const imgBlob = new Blob([reader.result], {
                        type: filedata.type
                    });
                    const formData = new FormData();
                    formData.append('name', filedata.name);
                    formData.append('file', imgBlob, filedata.name);
                    resolve(formData.get('file'));
                };
                reader.readAsArrayBuffer(filedata);
            }
            catch (err) {
                console.log('error reading file', JSON.stringify(err));
                reject(err);
            }

        });
    } */

    /* private async readVideoFileAndUpload(file: any) {

        const reader = new FileReader();
        reader.onloadend = () => {
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            const formData = new FormData();
            formData.append('name', file.name);
            formData.append('file', imgBlob, file.name);
            this.uploadImageToS3(formData.get('file'));
        };
        reader.readAsArrayBuffer(file);
    } */

    /**
     * Uploads plain image to s3
     *
     * @param file
     */
    /* uploadImageToS3(file) {

        console.log('uploading file:', file.name);
        const payload = {
            fileTitle: file.name
        };

        // todo change ID
        this.orderService.generateUploadLocation(this.authData?.user?.customer?.id, 'service-request', this.serviceRequestData.id, payload).subscribe(async data => {
            // Upload media file to S3
            if (data[0].uploadUrl) {
                // console.log(file);
                this.uploadCounter++;
                this.orderService.uploadFileS3(data[0].uploadUrl, file).subscribe(async res => {
                    this.uploadCounter--;
                    await this.checkUploadStatus();
                }, err => {
                    console.log(err);
                    this.uploadCounter--;
                });
            }
        }, err => {
            console.log(err);
        });
    } */

    /**
     * Uploads video file and associated thumbnail image to S3
     *
     * @param videoFile
     * @param thumbnailFile
     */
    /* async uploadVideoToS3(videoFile, thumbnailFile) {

        console.log('uploading video and thumbnail files:', videoFile.name);
        const payload = {
            fileTitle: videoFile.name,
            //thumbnailTitle: thumbnailFile.name
        };

        const uploadLocations = await new Promise<MediaUploadLocation[]>((resolve, reject) => {

            this.orderService.generateUploadLocation(this.authData?.user?.customer?.id, 'service-request', this.serviceRequestData.id, payload).subscribe(async data => {
                resolve(data)
            }, err => {
                console.log(err);
                reject(err);
            });
        });

        // get upload locations for the files


        // wait for the files to upload
        await Promise.all(uploadLocations.map(info => {

            return new Promise<void>((resolve, reject) => {

                const uploadFile = info.type === 'image/video' ? videoFile : thumbnailFile;
                const contentType = info.type === 'image/video' ? { 'Content-Type': videoFile.type } : { 'Content-Type': thumbnailFile.type };
                this.orderService.uploadFileS3(info.uploadUrl, uploadFile).subscribe(() => {
                    resolve();
                }, err => {
                    console.log(`failed to upload ${info.type} video file`, err);
                    reject(err);
                });
            });

        }));

        // acknowledge that the files have been uploaded
        let fileUrl = null, thumbnailUrl = null;
        uploadLocations.forEach(loc => {
            if (loc.type == 'image/video') {
                fileUrl = loc.accessLink;
            }
            else if (loc.type == 'thumbnail') {
                thumbnailUrl = loc.accessLink;
            }
        })
        await this.acknowledgeMediaUpload(fileUrl, 'video', thumbnailUrl);
    } */

    /**
     * Using cordova file transfer plugin
     *
     * @param video
     */
    async uploadVideoToS3(video) {

        try {
            console.log('uploading video and thumbnail files:', video.fullPath);
            const payload = {
                fileTitle: video.name,
                thumbnailTitle: video.thumbnailName
            };
            // get upload locations for the files
            const uploadLocations = await new Promise<MediaUploadLocation[]>((resolve, reject) => {

                this.orderService.generateUploadLocation(this.authData?.authMeta?.customer?.id, 'service-request', this.serviceRequestData.id, payload).subscribe(async data => {
                    resolve(data);
                }, err => {
                    console.log(err);
                    console.log('uploadLocations API: error', JSON.stringify(err));
                    reject(err);
                });
            });

            console.log('uploadLocations:', JSON.stringify(uploadLocations));

            // wait for the files to upload
            await Promise.all(uploadLocations.map(info => {

                const uploadFile = (info.type === 'image/video') ? video.fullPath : video.thumbnailFile;
                const contentType = info.type === 'image/video' ? { 'Content-Type': video.type } : { 'Content-Type': 'image/jpeg' };
                const mimeType = info.type === 'image/video' ? video.type : 'image/jpeg'; // thumbnail file

                const fileTransfer: FileTransferObject = this.fileTransfer.create();
                const options: FileUploadOptions = {
                    httpMethod: info.httpMethod,
                    headers: contentType,
                    mimeType,
                    chunkedMode: false
                };
                return fileTransfer.upload(uploadFile, info.uploadUrl, options).then((result) => {
                    console.log(`media file upload success: ${info.type}`, uploadFile);
                    console.log(JSON.stringify(result));
                }, (err) => {
                    console.log(`media file upload failed: ${info.type}`, uploadFile, JSON.stringify(err));
                });
            }));

            console.log('finished uploading video & thumbnail files:');
            // acknowledge that the files have been uploaded
            let fileUrl = null; let thumbnailUrl = null; let refId
            uploadLocations.forEach(loc => {
                if (loc.type == 'image/video') {
                    fileUrl = loc.accessLink;
                    refId = loc.referenceId
                }
                else if (loc.type == 'thumbnail') {
                    thumbnailUrl = loc.accessLink;
                }
            });
            await this.acknowledgeMediaUpload(fileUrl, 'video', thumbnailUrl, refId);

        }
        catch (err) {
            console.log('tempUploadVideoToS3 error:', JSON.stringify(err));
            throw err;
        }
    }

    /**
     * Using cordova file transfer plugin
     *
     * @param image
     */
    async uploadImageToS3(image) {

        try {
            console.log('uploading image file:', image.fullPath);
            const payload = {
                fileTitle: image.name
            };
            // get upload locations for the image
            const uploadLocations = await new Promise<MediaUploadLocation[]>((resolve, reject) => {

                this.orderService.generateUploadLocation(this.authData?.authMeta?.customer?.id, 'service-request', this.serviceRequestData.id, payload).subscribe(async data => {
                    resolve(data);
                }, err => {
                    console.log(err);
                    console.log('uploadLocations API: error', JSON.stringify(err));
                    reject(err);
                });
            });

            console.log('uploadLocations:', JSON.stringify(uploadLocations));


            const contentType = { 'Content-Type': image.type };

            const fileTransfer: FileTransferObject = this.fileTransfer.create();
            const options: FileUploadOptions = {
                httpMethod: uploadLocations[0].httpMethod,
                headers: contentType,
                mimeType: image.type,
                chunkedMode: false
            };
            await fileTransfer.upload(image.fullPath, uploadLocations[0].uploadUrl, options).then((result) => {
                console.log(`media file upload success: ${uploadLocations[0].type}`, image.fullPath);
                console.log(JSON.stringify(result));
            }, (err) => {
                console.log(`media file upload failed: ${uploadLocations[0].type}`, image.fullPath, JSON.stringify(err));
            });

            console.log('finished uploading video & thumbnail files:');
            // acknowledge that the files have been uploaded
            let fileUrl = null; let thumbnailUrl = null; let refId
            uploadLocations.forEach(loc => {
                if (loc.type == 'image/video') {
                    fileUrl = loc.accessLink;
                    refId = loc.referenceId
                }
                else if (loc.type == 'thumbnail') {
                    thumbnailUrl = loc.accessLink;
                }
            });
            await this.acknowledgeMediaUpload(uploadLocations[0].accessLink, 'image', refId);
        }
        catch (err) {
            console.log('image upload to S3 error:', JSON.stringify(err));
            throw err;
        }
    }

    /**
     * Registers a new service-request based on the payload with the backend platform
     * @param payload 
     * @returns 
     */
    private async registerServiceRequest(payload: { name: string; firstname: string; lastname: string; email: string; serviceRequests: { serviceId: any; serviceDate: any; notes: string; serviceLocations: any[]; }[]; }, agentPayload?:any) {
        
        this.loaderService.createLoading('Please wait while we register your service request...');
        const createServiceRequest = new Promise<any>((resolve, reject) => {
            let observer:any = null
            if(this.authData.authMeta.type === 'agent') {
                observer = this.agentService.createServiceRequest(this.authData?.authMeta?.agent?.id, agentPayload)
            } else {
                observer = this.orderService.newServiceRequest(this.authData?.authMeta?.customer?.id, payload)
            }
            observer.subscribe({
                next: (res) => {
                 
                    resolve(res);
                    
                },
                error: (err) => {
                    reject(err);
                }
            });
        });


        const serviceRequestData = await createServiceRequest.then((serviceRequestData) => {

            console.log('created new service-request response:', JSON.stringify(serviceRequestData));
            return serviceRequestData;

        }).catch((err) => {

            console.log('error creating service request', JSON.stringify(err));
            return null;
        });

        await this.loaderService.dismissLoading();
        return serviceRequestData;
        
    }


    /**
     * Acknowledge platform that the media has been uploaded for the service-request
     *
     * @param fileUrl
     * @param mediaType
     * @param thumbnailUrl
     */
    private async acknowledgeMediaUpload(fileUrl: string, mediaType: MediaType, thumbnailUrl?: string, referenceId?:any) {

        const payload = {
            fileUrl,
            mediaType,
            thumbnailUrl,
            referenceId
        };

        console.log('acknowledge uploadLocations API: payload', JSON.stringify(payload));
        await new Promise<any>((resolve, reject) => {

            this.orderService.ackUploadLocation(this.authData?.authMeta?.customer?.id, 'service-requests', this.serviceRequestData.id, payload).subscribe(async data => {
                resolve(data);

            }, err => {

                console.log('acknowledge uploadLocations API: error', JSON.stringify(err));
                resolve(null);
                //reject(err);
                //resolve(0); // for now ignore this API failure until Vishnu fixes the backend
            });
        });
    }

    goBack() {
        this.navCtrl.back();
    }

    private async throwSuccessAlert() {


        const alert = await this.alertController.create({
            header: 'Success!',
            subHeader: 'Your service request is submitted',
            message: 'Sit back and relax, our team will get you moving soon.',
            buttons: [
                {
                    text: 'Go to dashboard',
                    role: 'confirm',
                    handler: () => {
                        this.takeToDashboard();
                    },
                },
            ],
        });

        await alert.present();
    }

    private takeToDashboard() {
        // the user should not be allowed to navigate back once the service request is sucessful

        // since the request is created , set the getstarted status to false , 
        // so that user wont see additional service page after he logins again
        this.store.dispatch(changeGetStarted({
            getStarted: false
        }));

        if(this.loginUser === 'agent') {
            this.navCtrl.navigateRoot(['agent', 'agent-dashboard'], { state: { refresh: true }});
        } else {
            this.navCtrl.navigateRoot(['user', 'dashboard'], { state: { refresh: true }});
        }
     
    }

    private async throwRetryAlert() {

        /* const alert = await this.alertController.create({
            header: 'Alert!',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        this.handlerMessage = 'Alert canceled';
                    },
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {
                        this.handlerMessage = 'Alert confirmed';
                    },
                },
            ],
        });

        await alert.present();

        const { role } = await alert.onDidDismiss();
        if (role === '')
        this.roleMessage = `Dismissed with role: ${role}`; */

        let alert: HTMLIonAlertElement = null;

        if (this.serviceRequestData) {


            alert = await this.alertController.create({
                header: 'Service Issue',
                subHeader: 'We encountered a service issue',
                message: 'Your service request is created but media files could not be uploded. You can retry now or upload later from your dashboard.',
                buttons: [{
                    text: 'Retry',
                    role: 'confirm',
                    handler: () => {
                        this.addServiceRequest();
                    },
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                    },
                }],
            });

        }
        else {

            alert = await this.alertController.create({
                header: 'Service Issue',
                subHeader: 'We encountered a service issue',
                message: 'SORRY! There was an issue creating your service request.',
                buttons: [{
                    text: `Retry`,
                    role: 'confirm',
                    handler: () => {
                        this.addServiceRequest();
                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                    },
                }],
            });
        }



        await alert.present();

        const { role } = await alert.onDidDismiss();
    }
}
