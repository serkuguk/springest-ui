import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectComponent } from './multi-select.component';

describe('MultiSelectComponent', () => {
  let component: MultiSelectComponent;
  let fixture: ComponentFixture<MultiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('prevents readonly keyboard selection', () => {
    fixture.componentRef.setInput('items', [{label: 'One', value: 'one'}]);
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    input.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyA', key: 'a', ctrlKey: true, bubbles: true}));
    component.onChanged({value: ['one']});
    expect(component.value()).toEqual([]);
  });
it('forwards accessibility to the hidden focusable input', () => {
    fixture.componentRef.setInput('ariaDescribedBy', 'hint');
    fixture.componentRef.setInput('ariaInvalid', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('hint');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.disabled).toBe(true);
    expect(input.id).toBeTruthy();
  });
});
