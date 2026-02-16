import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUnits } from './list-units';

describe('ListUnits', () => {
  let component: ListUnits;
  let fixture: ComponentFixture<ListUnits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUnits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListUnits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
