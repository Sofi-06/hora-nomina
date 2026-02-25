import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDepartment } from './create-department';

describe('CreateDepartment', () => {
  let component: CreateDepartment;
  let fixture: ComponentFixture<CreateDepartment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDepartment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDepartment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
