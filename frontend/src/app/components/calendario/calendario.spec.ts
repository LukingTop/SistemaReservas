import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // 🌟 Importante para o ApiService

// 👇 1. Importe a classe correta
import { CalendarioComponent } from './calendario';

describe('CalendarioComponent', () => { // 👇 2. Nome correto
  let component: CalendarioComponent; // 👇 3. Tipagem correta
  let fixture: ComponentFixture<CalendarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 👇 4. Use a classe correta e adicione o módulo de teste HTTP
      imports: [CalendarioComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioComponent); // 👇 5. Criação correta
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});