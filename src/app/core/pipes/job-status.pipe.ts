import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'jobStatus',
    pure: true
})
export class JobStatusPipe implements PipeTransform {

    transform(rawStatus: string): any {
        if (rawStatus) {
            if (rawStatus === 'clock-in') {
                return 'Clocked In';
            }
            else if (rawStatus === 'clock-out') {
                return 'Clocked Out';
            }
            else {
                return 'not clocked';
            }
        }
        else {
            return rawStatus;
        }
    }

}
