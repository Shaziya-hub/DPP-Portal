import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundProcessComponent } from './refund-process.component';

describe('RefundProcessComponent', () => {
  let component: RefundProcessComponent;
  let fixture: ComponentFixture<RefundProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefundProcessComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RefundProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
