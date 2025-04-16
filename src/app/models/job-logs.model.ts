import { Employee } from "./employee.model";


export interface JobLogs {
    id: number;
    time: string;
    type: string;
    geoLat: string;
    geoLng: string;
    remarks: string;
    employeeId: number;
    employee: Employee;
}