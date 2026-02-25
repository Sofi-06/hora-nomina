import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateActivities } from './state-activities';

describe('StateActivities', () => {
  let component: StateActivities;
  let fixture: ComponentFixture<StateActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateActivities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateActivities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
