import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditType } from './edit-type';

describe('EditType', () => {
  let component: EditType;
  let fixture: ComponentFixture<EditType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
