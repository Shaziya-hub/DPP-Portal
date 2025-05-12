import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonHeadingComponent } from './common-heading.component';

describe('CommonHeadingComponent', () => {
  let component: CommonHeadingComponent;
  let fixture: ComponentFixture<CommonHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommonHeadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CommonHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
