import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutsFilterComponent } from './payouts-filter.component';

describe('PayoutsFilterComponent', () => {
  let component: PayoutsFilterComponent;
  let fixture: ComponentFixture<PayoutsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayoutsFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayoutsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
