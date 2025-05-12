import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateInvoicesComponent } from './generate-invoices.component';

describe('GenerateInvoicesComponent', () => {
  let component: GenerateInvoicesComponent;
  let fixture: ComponentFixture<GenerateInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerateInvoicesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GenerateInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
