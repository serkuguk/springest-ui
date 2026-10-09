import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Dialog} from 'primeng/dialog';
import {DialogComponent} from '../../dialog/dialog.component';
import {PaginationComponent} from '../../pagination/pagination.component';
import {FilePickerComponent} from '../file-picker/file-picker.component';
import {TextareaComponent} from '../textarea/textarea.component';
import {ToggleComponent} from '../toggle/toggle.component';
import {SegmentedControlComponent} from './segmented-control.component';

@Component({
    imports: [SegmentedControlComponent],
    template: `<app-segmented-control [items]="items" variant="cards">
        <ng-template #item let-item let-selected="selected"><strong>{{ item.label }}:{{ selected }}</strong></ng-template>
    </app-segmented-control>`,
})
class CardsHost {
    readonly items = [{label: 'One', value: 1}, {label: 'Two', value: 2}];
}

describe('new library components', () => {
    afterEach(() => {
        TestBed.resetTestingModule();
        jest.useRealTimers();
    });

    it('updates textarea from native input and forwards readonly and accessible labels', () => {
        const fixture = TestBed.createComponent(TextareaComponent);
        fixture.componentRef.setInput('label', 'Description');
        fixture.componentRef.setInput('ariaDescribedBy', 'help');
        fixture.detectChanges();
        const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
        expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(textarea.id);
        expect(textarea.getAttribute('aria-describedby')).toBe('help');
        textarea.value = 'Pasted text';
        textarea.dispatchEvent(new Event('input'));
        expect(fixture.componentInstance.value()).toBe('Pasted text');
        textarea.dispatchEvent(new Event('blur'));
        expect(fixture.componentInstance.touched()).toBe(true);
        fixture.componentRef.setInput('readonly', true);
        fixture.detectChanges();
        expect(textarea.readOnly).toBe(true);
        fixture.componentInstance.onValueChange('Blocked');
        expect(fixture.componentInstance.value()).toBe('Pasted text');
    });

    it('preserves selection on cancel, clears native file state and accepts the same file again', () => {
        const fixture = TestBed.createComponent(FilePickerComponent);
        fixture.detectChanges();
        const picker = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        const file = new File(['content'], 'example.txt');
        Object.defineProperty(picker, 'files', {value: [file], configurable: true});
        picker.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toEqual([file]);
        expect(fixture.nativeElement.textContent).toContain('example.txt');
        Object.defineProperty(picker, 'files', {value: [], configurable: true});
        picker.dispatchEvent(new Event('change'));
        expect(fixture.componentInstance.value()).toEqual([file]);
        fixture.nativeElement.querySelector('button').click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toEqual([]);
        expect(picker.value).toBe('');
        Object.defineProperty(picker, 'files', {value: [file], configurable: true});
        picker.dispatchEvent(new Event('change'));
        expect(fixture.componentInstance.value()).toEqual([file]);
        fixture.componentRef.setInput('readonly', true);
        fixture.detectChanges();
        expect(picker.disabled).toBe(true);
        fixture.componentInstance.clear();
        expect(fixture.componentInstance.value()).toEqual([file]);
        fixture.componentInstance.value.set([]);
        fixture.detectChanges();
        expect(picker.value).toBe('');
    });

    it('uses the actual switch input, supports focus and prevents readonly changes', async () => {
        const fixture = TestBed.createComponent(ToggleComponent);
        fixture.componentRef.setInput('label', 'Notifications');
        fixture.componentRef.setInput('ariaDescribedBy', 'switch-help');
        fixture.detectChanges();
        await fixture.whenStable();
        const checkbox = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        expect(checkbox.getAttribute('aria-describedby')).toBe('switch-help');
        expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(checkbox.id);
        checkbox.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toBe(true);
        checkbox.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
        expect(fixture.componentInstance.touched()).toBe(true);
        fixture.componentInstance.focus();
        expect(document.activeElement).toBe(checkbox);
        fixture.componentRef.setInput('readonly', true);
        fixture.detectChanges();
        expect(checkbox.disabled).toBe(true);
        checkbox.click();
        expect(fixture.componentInstance.value()).toBe(true);
    });

    it.each(['segments', 'cards'] as const)('selects exactly one option in %s mode and prevents clearing', async variant => {
        const fixture = TestBed.createComponent(SegmentedControlComponent);
        fixture.componentRef.setInput('items', [{label: 'One', value: 1}, {label: 'Two', value: 2}]);
        fixture.componentRef.setInput('variant', variant);
        fixture.componentRef.setInput('label', 'Choice');
        fixture.componentRef.setInput('ariaDescribedBy', 'choice-help');
        fixture.detectChanges();
        await fixture.whenStable();
        const buttons = fixture.nativeElement.querySelectorAll('[role="button"]') as NodeListOf<HTMLElement>;
        buttons[0].click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.componentInstance.value()).toBe(1);
        buttons[0].click();
        expect(fixture.componentInstance.value()).toBe(1);
        buttons[1].dispatchEvent(new KeyboardEvent('keydown', {code: 'Enter', bubbles: true}));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toBe(2);
        expect(Array.from(buttons).filter(button => button.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
        expect(buttons[0].getAttribute('aria-describedby')).toBe('choice-help');
        buttons[1].dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget: buttons[0]}));
        expect(fixture.componentInstance.touched()).toBe(false);
        buttons[0].dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
        expect(fixture.componentInstance.touched()).toBe(true);
        fixture.componentRef.setInput('readonly', true);
        fixture.detectChanges();
        expect(buttons[0].getAttribute('data-p-disabled')).toBe('true');
        buttons[0].dispatchEvent(new KeyboardEvent('keydown', {code: 'Space', bubbles: true}));
        expect(fixture.componentInstance.value()).toBe(2);
    });

    it('projects card markup with selected context', async () => {
        const fixture = TestBed.createComponent(CardsHost);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.nativeElement.querySelector('[role="button"]').click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('strong').textContent).toBe('One:true');
    });

    it('closes from the real button and restores opener focus after the leave transition', () => {
        jest.useFakeTimers();
        const opener = document.createElement('button');
        document.body.append(opener);
        opener.focus();
        const fixture = TestBed.createComponent(DialogComponent);
        fixture.componentInstance.visible.set(true);
        fixture.detectChanges();
        const dialog = fixture.debugElement.children[0].componentInstance as Dialog;
        expect(dialog.focusTrap).toBe(true);
        expect(dialog.dismissableMask).toBe(false);
        const panel = fixture.debugElement.query(element => element.nativeElement.getAttribute?.('role') === 'dialog');
        // shortcut: jsdom has no layout or CSS motion; simulate visibility/events here and use a browser for layout checks.
        const closeButton = panel.nativeElement.querySelector('button') as HTMLButtonElement;
        Object.defineProperty(closeButton, 'offsetParent', {value: panel.nativeElement});
        panel.triggerEventHandler('pMotionOnBeforeEnter', {element: panel.nativeElement});
        panel.triggerEventHandler('pMotionOnAfterEnter', {});
        jest.advanceTimersByTime(200);
        expect(panel.nativeElement.contains(document.activeElement)).toBe(true);
        closeButton.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.visible()).toBe(false);
        panel.triggerEventHandler('pMotionOnAfterLeave', {});
        expect(document.activeElement).toBe(opener);
        opener.remove();
    });

    it('updates paginator models and emits the unmodified PrimeNG state', () => {
        const fixture = TestBed.createComponent(PaginationComponent);
        fixture.componentRef.setInput('totalRecords', 25);
        fixture.detectChanges();
        const received = jest.fn();
        fixture.componentInstance.pageChange.subscribe(received);
        expect(fixture.componentInstance.first()).toBe(0);
        expect(fixture.componentInstance.rows()).toBe(10);
        const event = {first: 20, rows: 10, page: 2, pageCount: 3};
        fixture.nativeElement.querySelectorAll('.p-paginator-page')[2].click();
        expect(fixture.componentInstance.first()).toBe(20);
        expect(received).toHaveBeenCalledWith(event);
        fixture.componentInstance.onPageChange({first: 0, rows: 25, page: 0, pageCount: 0});
        expect(fixture.componentInstance.rows()).toBe(25);
        expect(fixture.componentInstance.first()).toBe(0);
        fixture.componentRef.setInput('totalRecords', 0);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.p-paginator-next').disabled).toBe(true);
    });
});
