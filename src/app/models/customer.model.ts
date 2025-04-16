import { AccountStatus } from '../definitions/account-status.enum';
import { User } from './user.model';

export interface Customer extends User {
    accountStatus: AccountStatus;
    accountId: number;
    paymentCustomerId: string;
}
