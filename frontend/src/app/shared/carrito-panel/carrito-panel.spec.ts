import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarritoPanel } from './carrito-panel';

describe('CarritoPanel', () => {
  let component: CarritoPanel;
  let fixture: ComponentFixture<CarritoPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarritoPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
