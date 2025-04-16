import { TimeOffStatus } from "../definitions/time-off-status.enum";

export class TimeOffDto {
    date: Date;
    status: TimeOffStatus;
}