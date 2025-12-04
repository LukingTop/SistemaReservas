import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaFormComponent } from './reserva-form';

describe('ReservaFormComponent', () => {

  let component: ReservaFormComponent;
  let fixture: ComponentFixture<ReservaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaFormComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaFormComponent); 
    component = fixture.componentInstance;
    await fixture.whenStable(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});