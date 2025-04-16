export interface Contact {
    firstname: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface Status {
    state: string;
    newQuoteReceived: boolean;
}

export interface Document {
    type: string;
    url: string;
    createdBy?: string;
    id?: number;
    isSigned?: boolean;
    filesUrl?: string;
}

export interface Payment {
    grandTotal: string;
    paidAmount: number;
}

export interface ServiceLocation {
    id: number;
    order: number;
    isIntermediate: boolean;
    pin: string;
    apartmentNumber: string | null;
    locationType: string | null;
    parkingDetails: string | null;
    stairDetails: string | null;
    elevatorDetails: string | null;
    address: string;
    city: string;
    state: string;
    country: string | null;
    zipcode: number;
}

export interface Media {
    id: number;
    serviceRequestId: number;
    accessLink: string;
    fileType: string;
    thumbnail: string;
}

export interface ServiceRequest {
    id: number;
    serviceOfferingId: number;
    serviceRequestId: number;
    customerId: string;
    logoUrl: string;
    serviceCategory: string;
    serviceLabel: string;
    serviceDate: string;
    projectName: string;
    contact: Contact;
    status: Status;
    notes: string;
    quoteId: number;
    contractId: number | null;
    documents: Document[];
    payment: Payment;
    opportunityId: number;
    createdAt: string;
    updatedAt: string;
    serviceLocations: ServiceLocation[];
    media: Media[];
}
