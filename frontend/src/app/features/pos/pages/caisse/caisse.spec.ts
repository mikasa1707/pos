import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Caisse } from './caisse';

describe('Caisse', () => {
  let component: Caisse;
  let fixture: ComponentFixture<Caisse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Caisse],
    }).compileComponents();

    fixture = TestBed.createComponent(Caisse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
