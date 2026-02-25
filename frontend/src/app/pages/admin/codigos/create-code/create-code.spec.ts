import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCode } from './create-code';

describe('CreateCode', () => {
  let component: CreateCode;
  let fixture: ComponentFixture<CreateCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
