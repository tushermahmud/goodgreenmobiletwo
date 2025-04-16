import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replaceHyphen',
    pure: true
})
export class ReplaceHyphenPipe implements PipeTransform {

    transform(rawValue: string): any {
        if (rawValue) {
            const transformedText = rawValue.replace(/-/g, ' ');
            return transformedText ? transformedText : rawValue;
        }
    }

}
