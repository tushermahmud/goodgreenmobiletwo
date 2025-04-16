import { LocationPin } from '../definitions/location-pin.enum';

export interface ServiceLocation {
    id: number;
    pin: LocationPin;
    order: number;
    address: string;
    city: string;
    state: string;
    country?: string;
    zipcode: number;
    createdAt?: Date;
    updatedAt?: Date;
}
