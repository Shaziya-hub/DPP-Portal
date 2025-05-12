import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateInvoiceModalComponent } from './generate-invoice-modal.component';

describe('GenerateInvoiceModalComponent', () => {
  let component: GenerateInvoiceModalComponent;
  let fixture: ComponentFixture<GenerateInvoiceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerateInvoiceModalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GenerateInvoiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
