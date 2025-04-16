export interface ProfileInfo {
    id: string;
    fullname: string;
    lastname: string;
    firstname: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    email: string;
    accountStatus: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
    accountId: number;
    paymentCustomerId?: any;
}
