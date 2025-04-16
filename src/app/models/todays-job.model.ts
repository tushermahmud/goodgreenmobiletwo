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
    startedAt: string;
    completedAt: string;
    locations: Location[];
}

export interface Job {
    id: number;
    date: Date;
    time: string;
    checkedIn: boolean;
    role: string;
    currentStatus: string;
    currentStatusTime?: any;
}

export interface TodaysJob {
    jobCard: JobCard;
    job: Job;
}



export interface StartOrEndJob {
    geoLat: string;
    geoLng: string;
    remarks: string;
    time: any;
    media: [];
    customerSIgnature: string;
}