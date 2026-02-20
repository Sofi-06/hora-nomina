import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewReports } from './preview-reports';

describe('PreviewReports', () => {
  let component: PreviewReports;
  let fixture: ComponentFixture<PreviewReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
