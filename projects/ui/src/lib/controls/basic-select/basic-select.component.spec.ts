import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectChangeEvent } from 'primeng/select';

import { BasicSelectComponent } from './basic-select.component';

describe('BasicSelectComponent', () => {
  let component: BasicSelectComponent;
  let fixture: ComponentFixture<BasicSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stores and emits the selected scalar value', () => {
    const changed = jest.fn();
    component.changed.subscribe(changed);

    component.onChanged({value: 'LEGAL'} as SelectChangeEvent);

    expect(component.value()).toBe('LEGAL');
    expect(changed).toHaveBeenCalledWith('LEGAL');
  });
});
