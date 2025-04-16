import { createAction, props } from '@ngrx/store';

export const addActivityName = createAction(
  '[Order] Add Activity Name',
  props<{ name: any }>()
);

export const selectAfflilation = createAction(
  '[Order] Select Afflilation',
  props<{ afflilation: any }>()
);

export const selectService = createAction(
  '[Order] Select Service',
  props<{ selectedService: any }>()
);

export const uploadVideos = createAction(
  '[Order] Upload Videos',
  props<{ videoList: any }>()
);

export const uploadImages = createAction(
  '[Order] Upload Images',
  props<{ imageList: any }>()
);

export const addServiceItemNotes = createAction(
  '[Order] Add Service Item Notes',
  props<{ notes: string }>()
);

export const addContactDetail = createAction(
  '[Order] Add Contact Detail',
  props<{ contact: { firstname: string; lastname: string; email: string; phoneNumber: string; } }>()
);

export const addPickUpAddress = createAction(
  '[Order] Add PickUp Address',
  props<{ address: any }>()
);

export const addDropAddress = createAction(
  '[Order] Add Drop Address',
  props<{ address: any }>()
);

export const addAddress = createAction(
  '[Order] Add Address',
  props<{ locationAddress: any }>()
);

export const addAdditionalServices = createAction(
  '[Order] Add Additional Services',
  props<{ services: any }>()
);

export const addEstimatedDate = createAction(
  '[Order] Add Estimated Date',
  props<{ date: any }>()
);

export const addEstimatedTime = createAction(
  '[Order] Add Estimated Time',
  props<{ time: any }>()
);

export const changeGetStarted = createAction(
  '[Order] Change Get Started',
  props<{ getStarted: any }>()
);

export const orderSuccess = createAction(
  '[Order] Order Success',
  props<{ order: any }>()
);

export const orderError = createAction(
  '[Order] Order Error',
  props<{ error: string }>()
);

export const getOrderData = createAction(
  '[Order] Get Order Data'
);


export const addIntermediateAddress = createAction(
  '[Order] Add Intermediate Address',
  props<{ intermediateLocation: any }>()
)
