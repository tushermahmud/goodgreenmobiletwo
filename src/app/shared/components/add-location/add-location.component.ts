import { Component, NgZone, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

declare var google

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.css']
})
export class AddLocationComponent implements OnInit {
  autocomplete: { input: string };
  autocompleteItems: any[];
  placeid: any;
  googleAutocomplete: any;
  address: any;

  constructor(
    public zone: NgZone,
    private modalController: ModalController
  ) {
    this.googleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  ngOnInit(): void {
  }


  updateSearchResults(addrs) {
    this.autocomplete.input = addrs;
    if (this.autocomplete.input === '') {
      this.autocompleteItems = [];
      this.clearAutocomplete();
      return;
    }
    var searchObj = {
      input: this.autocomplete.input,
      componentRestrictions: { country: 'us' }
    };

    this.googleAutocomplete.getPlacePredictions(searchObj,
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


  selectSearchResult(item) {
    this.placeid = item.place_id;
    this.address = item;
    // this.getCoordsFromAddress(item.description,type);
    this.modalController.dismiss(this.address)
  }


  close(){
    this.modalController.dismiss();
  }


}
