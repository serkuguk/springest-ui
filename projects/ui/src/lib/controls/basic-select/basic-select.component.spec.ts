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
it('forwards accessibility to the focusable combobox and disables from Signal Forms', () => {
    fixture.componentRef.setInput('ariaDescribedBy', 'hint');
    fixture.componentRef.setInput('ariaInvalid', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const control = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
    expect(control.getAttribute('aria-describedby')).toBe('hint');
    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(control.getAttribute('tabindex')).toBe('-1');
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(control.id);
  });

  it('stores and emits the selected scalar value', () => {
    const changed = jest.fn();
    component.changed.subscribe(changed);

    component.onChanged({value: 'LEGAL'} as SelectChangeEvent);

    expect(component.value()).toBe('LEGAL');
    expect(changed).toHaveBeenCalledWith('LEGAL');
  });
});
