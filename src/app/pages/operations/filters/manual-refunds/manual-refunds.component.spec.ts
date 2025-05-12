import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualRefundsComponent } from './manual-refunds.component';

describe('ManualRefundsComponent', () => {
  let component: ManualRefundsComponent;
  let fixture: ComponentFixture<ManualRefundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManualRefundsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManualRefundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
