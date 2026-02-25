import { TestBed } from '@angular/core/testing';

import { Archivo } from './archivo';

describe('Archivo', () => {
  let service: Archivo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Archivo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
