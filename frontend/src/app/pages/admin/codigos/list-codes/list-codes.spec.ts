import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCodes } from './list-codes';

describe('ListCodes', () => {
  let component: ListCodes;
  let fixture: ComponentFixture<ListCodes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCodes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCodes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
