import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUnit } from './create-unit';

describe('CreateUnit', () => {
  let component: CreateUnit;
  let fixture: ComponentFixture<CreateUnit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUnit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUnit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
