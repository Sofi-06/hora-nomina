import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTypes } from './view-types';

describe('ViewTypes', () => {
  let component: ViewTypes;
  let fixture: ComponentFixture<ViewTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
