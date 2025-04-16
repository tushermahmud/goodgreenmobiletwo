import { Pipe, PipeTransform } from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safeurl'
})
export class SafePipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) {

    }

    transform(url: string) {
        return (!url) ? url : this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
