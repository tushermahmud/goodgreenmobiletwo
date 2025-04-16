export interface Schedule {
    datetime: Date;
    duration: number;
    leadHelpers: number;
    helpers: number;
    planOfAction: string;
    timezoneOffset: string;
}

export interface Truck {
    datetime: Date;
    vans: number;
    shuttles: number;
    pickupTrucks: number;
    fourteenTrucks: number;
    sixteenTrucks: number;
    twentyTrucks: number;
    twentyFourTrucks: number;
    twentySixTrucks: number;
    timezoneOffset: string;
}

export interface Supply {
    name: string;
    quantity: number;
    price: number;
}

export interface CreateAddendum {
    serviceItemId: number;
    businessAccountId: string;
    itemsToBeMoved?: string;
    itemsToBePacked?: string;
    itemsToBeDisposed?: string;
    createdByAccId: number;
    schedules: Schedule[];
    trucks: Truck[];
    supplies?: Supply[];
    totalSuppliesCost?: number;
    totalTrucksCost?: number;
}


