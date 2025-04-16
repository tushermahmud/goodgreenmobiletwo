import { ServiceCategory } from '../definitions/service-category.enum';
import { ServiceItemState } from '../definitions/service-item-state.enum';
import { ServiceItemDocument } from './service-item-document.model';
import { ServiceItemMedia } from './service-item-media.model';
import { ServiceLocation } from './service-location.model';


export interface CustomerServiceItem {
    id: number;
    //
    serviceOfferingId: number;
    serviceLabel: string;
    serviceCategory: ServiceCategory;
    logoUrl: string;
    //
    serviceDate: Date;
    projectName: string;
    status: {
        state: ServiceItemState;
        newQuoteReceived: boolean;
    };
    contact: {
        firstname: string;
        lastName: string;
        email: string;
    };
    payment: {
        grandTotal: any;
        paidAmount:any
    };
    serviceRequestId: number;
    media: any;
    documents: ServiceItemDocument[];
    notes: string;
    opportunityId?: number;
    serviceLocations?: ServiceLocation[];
    createdAt: Date;
    updatedAt: Date;
    quoteId?: number;
    contractId?: number;
}
