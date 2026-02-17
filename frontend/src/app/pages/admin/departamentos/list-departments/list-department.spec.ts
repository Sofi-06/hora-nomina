import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDepartment } from './list-department';

describe('ListDepartment', () => {
  let component: ListDepartment;
  let fixture: ComponentFixture<ListDepartment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDepartment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDepartment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
