import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms'; 
import { RouterTestingModule } from '@angular/router/testing'; 
import { EsqueciSenhaComponent } from './esqueci-senha';

describe('EsqueciSenhaComponent', () => { 
  let component: EsqueciSenhaComponent; 
  let fixture: ComponentFixture<EsqueciSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      
      imports: [EsqueciSenhaComponent, HttpClientTestingModule, FormsModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsqueciSenhaComponent); 
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});