import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursosList } from './recursos-list';

describe('RecursosList', () => {
  let component: RecursosList;
  let fixture: ComponentFixture<RecursosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecursosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
