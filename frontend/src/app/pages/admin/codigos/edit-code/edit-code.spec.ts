import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCode } from './edit-code';

describe('EditCode', () => {
  let component: EditCode;
  let fixture: ComponentFixture<EditCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
