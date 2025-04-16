import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurServicesSubCategoryComponent } from './our-services-sub-category.component';

describe('OurServicesSubCategoryComponent', () => {
  let component: OurServicesSubCategoryComponent;
  let fixture: ComponentFixture<OurServicesSubCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OurServicesSubCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OurServicesSubCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
