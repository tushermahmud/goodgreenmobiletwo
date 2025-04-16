import { Injectable, NgZone } from '@angular/core';

// eslint-disable-next-line no-var
declare var google;

@Injectable({
  providedIn: 'root'
})
export class GoogleLocationSearchService {
  autocomplete: { input: string };
  autocompleteItems: any[];
  placeid: any;
  googleAutocomplete: any;

  address: any;
  lat: string;
  long: string;


  constructor(
    public zone: NgZone,
  ) {
    this.googleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }


  updateSearchResults(addrs) {
    this.autocomplete.input = addrs;
    if (this.autocomplete.input === '') {
      this.autocompleteItems = [];
      this.clearAutocomplete();
      return;
    }
    this.googleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }

  clearAutocomplete() {
    this.autocompleteItems = [];
    this.autocomplete.input = '';
  }



}
