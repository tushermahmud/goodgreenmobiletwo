
interface Schedule {
    id?: number;
    date?: string;
    time?: string;
    duration?: number;
    leadHelpers?: number;
    helpers?: number;
    planOfAction?: string;
}

interface Truck {
    date?: string;
    time?: string;
    vans?: number;
    shuttles?: number;
    pickupTrucks?: number;
    fourteenTrucks?: number;
    sixteenTrucks?: number;
    twentyTrucks?: number;
    twentyFourTrucks?: number;
    twentySixTrucks?: number;
}

interface Supply {
    name?: string;
    quantity?: number;
    price?: number;
}
interface AdditionalNotes {
    itemsToBeMoved?: string;
    itemsToBePacked?: string;
    itemsToBeDisposed?: string;
}


interface Notes {
    isChecked: boolean;
    formData?:AdditionalNotes;
   
}

export interface Schedules {
    isChecked: boolean;
    formData?: Schedule[];
}

export interface Trucks {
    isChecked: boolean;
    formData?: Truck[];
    totalCost?: any
}

export interface Supplies {
    isChecked: boolean;
    formData?: Supply[];
    totalCost?: any
}

export interface Team {
    isChecked: boolean;
    formData?: any;
}


export interface AddendumForm {
    schedules?: Schedules;
    trucks?: Trucks;
    supplies?: Supplies;
    notes?: Notes;
}

export enum FormTypes {
    Schedules = 'schedules',
    Supplies = 'supplies',
    Trucks = 'trucks',
    Notes = 'notes',
}


