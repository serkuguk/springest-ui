import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ButtonComponent} from './button.component';

@Component({imports: [ButtonComponent], template: '<form (submit)="submitted = true; $event.preventDefault()"><app-button type="submit" icon="pi pi-save" [loading]="loading()" [aria]="aria" [rounded]="true" (click)="clicked = true"><strong>Details</strong></app-button></form>'})
class ButtonHost {
  loading = signal(false);
  clicked = false;
  submitted = false;
  aria = {'aria-label': 'Save changes', 'aria-describedby': 'help'};
}

describe('ButtonComponent', () => {
  it('projects markup, forwards ARIA and blocks activation while loading', () => {
    TestBed.configureTestingModule({imports: [ButtonHost]});
    const fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.querySelector('strong')?.textContent).toBe('Details');
    expect(button.matches('.p-button-icon-only:not(:has(.default-button__content:not(:empty)))')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Save changes');
    expect(button.getAttribute('aria-describedby')).toBe('help');
    expect(button.classList.contains('p-button-rounded')).toBe(true);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('[data-p-icon="spinner"]')).not.toBeNull();
    button.click();
    expect(fixture.componentInstance.clicked).toBe(false);
    expect(fixture.componentInstance.submitted).toBe(false);
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    button.click();
    expect(fixture.componentInstance.clicked).toBe(true);
    expect(fixture.componentInstance.submitted).toBe(true);
  });

  it('keeps compact icon-only styling and the existing label API', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('icon', 'pi pi-save');
    fixture.componentRef.setInput('aria', {'aria-label': 'Save'});
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.matches('.p-button-icon-only:not(:has(.default-button__content:not(:empty)))')).toBe(true);
    fixture.componentRef.setInput('label', 'Save');
    fixture.detectChanges();
    expect(button.textContent).toContain('Save');
    expect(button.classList.contains('p-button-icon-only')).toBe(false);
  });
});
