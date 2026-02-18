import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListActivities } from './list-activities';

describe('ListActivities', () => {
  let component: ListActivities;
  let fixture: ComponentFixture<ListActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListActivities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListActivities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
