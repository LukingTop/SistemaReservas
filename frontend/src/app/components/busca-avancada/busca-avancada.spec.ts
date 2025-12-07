import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscaAvancada } from './busca-avancada';

describe('BuscaAvancada', () => {
  let component: BuscaAvancada;
  let fixture: ComponentFixture<BuscaAvancada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscaAvancada]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscaAvancada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
