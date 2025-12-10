import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { RouterTestingModule } from '@angular/router/testing'; 
import { RecursosListComponent } from './recursos-list'; 

describe('RecursosListComponent', () => { 
  let component: RecursosListComponent; 
  let fixture: ComponentFixture<RecursosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      imports: [RecursosListComponent, HttpClientTestingModule, RouterTestingModule] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecursosListComponent); 
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});