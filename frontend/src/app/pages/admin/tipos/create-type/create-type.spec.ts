import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateType } from './create-type';

describe('CreateType', () => {
  let component: CreateType;
  let fixture: ComponentFixture<CreateType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
