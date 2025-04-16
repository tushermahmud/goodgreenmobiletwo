import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVendorQuoteComponent } from './view-vendor-quote.component';

describe('ViewVendorQuoteComponent', () => {
  let component: ViewVendorQuoteComponent;
  let fixture: ComponentFixture<ViewVendorQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewVendorQuoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewVendorQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
