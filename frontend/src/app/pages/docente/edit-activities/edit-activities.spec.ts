import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditActivities } from './edit-activities';

describe('EditActivities', () => {
  let component: EditActivities;
  let fixture: ComponentFixture<EditActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditActivities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditActivities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
