import { AccountStatus } from 'src/app/definitions/account-status.enum';
import { BusinessAccount } from 'src/app/models/business-account.model';
import { TokenResponse } from 'src/app/models/chat.model';
import { Customer } from 'src/app/models/customer.model';
import { Employee } from 'src/app/models/employee.model';

export interface AuthMeta {
    userId: string;
    accountStatus: AccountStatus.PENDING |   AccountStatus.ACTIVE |  AccountStatus.INACTIVE,
    accessToken: TokenResponse;
    chatToken: string;
    type: string;
    customer?: Customer;
    business?: BusinessAccount; // only when employee login
    profileUrl: string;
    employee?: Employee;
    agent?: Employee;
}
