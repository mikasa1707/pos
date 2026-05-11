import { TestBed } from '@angular/core/testing';

import { FichesTechniques } from './fiches-techniques';

describe('FichesTechniques', () => {
  let service: FichesTechniques;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FichesTechniques);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
