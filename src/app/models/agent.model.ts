export interface Agent {
    id: string
    accountId: number
    key: string
    fullname: string
    lastname: string
    firstname: string
    address: string
    city: string
    state: string
    country: string
    zipcode: string | number
    email: string
    accountStatus: string
    phoneNumber: string | number
    createdAt?: string
    updatedAt?: string
}



