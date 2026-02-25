import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateActivities } from './create-activities';

describe('CreateActivities', () => {
  let component: CreateActivities;
  let fixture: ComponentFixture<CreateActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateActivities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateActivities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
