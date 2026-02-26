import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPassword } from './confirm-password';

describe('ConfirmPassword', () => {
  let component: ConfirmPassword;
  let fixture: ComponentFixture<ConfirmPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
