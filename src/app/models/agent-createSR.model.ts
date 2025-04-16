export interface CreateNewRequest {
    // customer: Customer
    service: Service
    founderBaId: string
}
  
export interface Customer {
firstname: string
lastname: string
email: string
address: string
apartmentNumber: string
city: string
state: string
country: string
zipcode: string
phonenumber: string
}

export interface Service {
name: string
firstname: string
lastname: string
email: string
contactNumber: string
serviceRequests: ServiceRequest[]
}

export interface ServiceRequest {
serviceId: number
serviceDate: string
notes: string
serviceLocations: ServiceLocation[]
}

export interface ServiceLocation {
pin: string
address: string
city: string
state: string
zipcode: string
country?: string
}
  