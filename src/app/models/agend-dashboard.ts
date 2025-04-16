export interface ServiceItem {
    id: number;
    serviceOfferingId: number;
    serviceRequestId: number;
    logoUrl: string;
    serviceCategory: string;
    serviceLabel: string;
    serviceDate: string;
    projectName: string;
    contact: {
        firstname: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    status: {
        state: string;
        newQuoteReceived: boolean;
    };
    notes: string;
    quoteId: null;
    contractId: null;
    documents: any[];
    payment: {
        grandTotal: number;
        paidAmount: number;
    };
    opportunityId: null;
    createdAt: string;
    updatedAt: string;
}

export interface FounderDetails {
    id: string;
    name: string;
    status: string;
    priority: string;
    type: string;
    logoUrl: null | string;
    website: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    email: string;
    phoneNumber: string;
    licenseNumber: string;
    founderId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceRequest {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    email: string;
    notes: null | string;
    serviceItemsCount: number;
    founderDetails: FounderDetails;
    serviceItems: ServiceItem[];
    createdAt: string;
    updatedAt: string;
}

export type ServiceRequestList = ServiceRequest[];
