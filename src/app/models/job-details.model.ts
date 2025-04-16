export interface ContactDetails {
    fullname: string;
    email: string;
    number: string;
}

export interface ProjectDetails {
    name: string;
}

export interface ServiceInfo {
    id: number;
    label: string;
    logoUrl: string;
    category: string;
    licenseType: string;
}

export interface Location {
    id: number;
    order: number;
    isIntermediate: boolean;
    pin: string;
    apartmentNumber: string;
    locationType?: any;
    parkingDetails?: any;
    stairDetails?: any;
    elevatorDetails?: any;
    address: string;
    city: string;
    state: string;
    country?: any;
    zipcode: number;
}

export interface JobCard {
    id: number;
    contactDetails: ContactDetails;
    status: string;
    projectDetails: ProjectDetails;
    serviceInfo: ServiceInfo;
    startedAt: Date;
    completedAt: Date;
    locations: Location[];
}

export interface Job {
    id: number;
    scheduledDateTime: Date;
    checkedIn: boolean;
    role: string;
    currentStatus: string;
    currentStatusTime: string;
}

export interface JobDetails {
    jobCard: JobCard;
    job: Job;
}

export interface ContactDetails2 {
    fullname: string;
    email: string;
    phoneNumber: string;
}

export interface Location2 {
    id: number;
    order: number;
    isIntermediate: boolean;
    pin: string;
    apartmentNumber: string;
    locationType?: any;
    parkingDetails?: any;
    stairDetails?: any;
    elevatorDetails?: any;
    address: string;
    city: string;
    state: string;
    country?: any;
    zipcode: number;
}

export interface Document {
    createdBy: string;
    type: string;
    url: string;
    id?: number;
    isSigned?: boolean;
    filesUrl: string;
}

export interface JobRequestDetails {
    contactDetails: ContactDetails2;
    locations: Location2[];
    documents: Document[];
    notes?: any;
    baseQuoteId:number
    serviceRequestId:number
    customerId:string
}

export interface Crew {
    id: string;
    accountId: number;
    accountStatus: string;
    businessAccountId: string;
    firstname: string;
    lastname: string;
    fullname: string;
    role: string;
    type: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    email: string;
    phoneNumber: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    jobRole: string;
    checkedIn: boolean;
}

export interface JobMediaResource {
    id: number;
    accessLink: string;
    thumbnailUrl: string;
    fileType: string;
    tag: string;
    uploadedByAcc:number
}

export interface JobMedia {
    jobCardMedia: JobMediaResource[];
    jobMedia: JobMediaResource[];
}

export interface JobDetailsRes {
    jobDetails: JobDetails;
    jobRequestDetails: JobRequestDetails;
    crew: Crew[];
    jobMedia: JobMedia;
}