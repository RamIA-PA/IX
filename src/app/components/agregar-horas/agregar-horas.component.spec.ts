import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarHorasComponent } from './agregar-horas.component';

describe('AgregarHorasComponent', () => {
  let component: AgregarHorasComponent;
  let fixture: ComponentFixture<AgregarHorasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarHorasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarHorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
