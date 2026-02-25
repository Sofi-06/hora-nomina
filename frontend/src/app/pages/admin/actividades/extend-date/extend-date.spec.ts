import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendDate } from './extend-date';

describe('ExtendDate', () => {
  let component: ExtendDate;
  let fixture: ComponentFixture<ExtendDate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtendDate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtendDate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
