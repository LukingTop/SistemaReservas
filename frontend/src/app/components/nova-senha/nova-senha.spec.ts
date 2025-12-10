import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { FormsModule } from '@angular/forms'; 
import { RouterTestingModule } from '@angular/router/testing'; 
import { NovaSenhaComponent } from './nova-senha';

describe('NovaSenhaComponent', () => { 
  let component: NovaSenhaComponent; 
  let fixture: ComponentFixture<NovaSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      
      imports: [NovaSenhaComponent, HttpClientTestingModule, FormsModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NovaSenhaComponent); 
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});