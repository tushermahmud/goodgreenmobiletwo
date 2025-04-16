import { createReducer, on, State } from '@ngrx/store';
import {
    addActivityName,
    addAdditionalServices,
    addAddress,
    addContactDetail,
    addDropAddress,
    addEstimatedDate,
    addEstimatedTime,
    addIntermediateAddress,
    addPickUpAddress,
    addServiceItemNotes,
    changeGetStarted,
    selectAfflilation,
    selectService,
    uploadImages,
    uploadVideos
} from './order.actions';

export interface OrderState {
    selectedAfflilation?: any | null;
    activityName: string | null;
    service: any | null;
    media: [];
    contact: { firstname: string; lastname: string; email: string; phoneNumber: string; };
    notes: string;
    pickupAddress: any | null;
    estimatedDate: any | null;
    estimatedTime: any | null;
    dropAddress: any | null;
    address: any | null;
    additionalServices: [];
    selectedVideos: [];
    selectedImages: [];
    getStarted: boolean;
    errorMessage: string | null;
    intermediateAddress:[];
    status: 'pending' | 'loading' | 'error' | 'success';
}

export const initialState: OrderState = {
    selectedAfflilation: null,
    activityName: null,
    service: null,
    media: [],
    contact: null,
    notes: null,
    pickupAddress: null,
    estimatedDate: null,
    estimatedTime: null,
    dropAddress: null,
    address: null,
    additionalServices: [],
    selectedVideos: [],
    selectedImages: [],
    getStarted: false,
    errorMessage: null,
    intermediateAddress:[],
    status: 'pending',
};

export const orderReducer = createReducer(
    // Supply the initial state
    initialState,

    // add affiliation > only for cofounder
    on(selectAfflilation, (state, { afflilation }) => ({ ...state, selectedAfflilation: afflilation })),

    // add name for the project
    on(addActivityName, (state, { name }) => ({ ...state, activityName: name })),

    // select the intial service
    on(selectService, (state, { selectedService }) => ({ ...state, service: selectedService })),

    // attach videos for the service-item
    on(uploadVideos, (state, { videoList }) => ({ ...state, selectedVideos: videoList })),

    // attach images for the service-item
    on(uploadImages, (state, { imageList }) => ({ ...state, selectedImages: imageList })),

    // add the starting address for the service-item
    on(addPickUpAddress, (state, { address }) => ({ ...state, pickupAddress: address })),

    // add the service notes the service-item
    on(addServiceItemNotes, (state, { notes }) => ({ ...state, notes })),
    
    // add the contact details for the service-request
    on(addContactDetail, (state, { contact }) => ({ ...state, contact })),

    // add the starting address for the service-item
    on(addDropAddress, (state, { address }) => ({ ...state, dropAddress: address })),

    // add the starting address for the service-item
    on(addAddress, (state, { locationAddress }) => ({ ...state, address: locationAddress })),

    // add the starting address for the service-item
    on(addAdditionalServices, (state, { services }) => ({ ...state, additionalServices: services })),

    // add the estimated date for service-item
    on(addEstimatedDate, (state, { date }) => ({ ...state, estimatedDate: date })),

    // add the estimated time for service-item
    on(addEstimatedTime, (state, { time }) => ({ ...state, estimatedTime: time })),

    // no-idea!!!
    on(changeGetStarted, (state, { getStarted }) => ({ ...state, getStarted })),

    //add intermediate locations
    on(addIntermediateAddress, (state, { intermediateLocation }) => ({ ...state, intermediateAddress: intermediateLocation }))

);
