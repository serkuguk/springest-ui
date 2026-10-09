import {NgTemplateOutlet} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, contentChild, ElementRef, inject, input, model, output, TemplateRef, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormValueControl} from '@angular/forms/signals';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ControlItemInterface, Value} from '../../types';
import {FormFieldComponent} from '../form-field/form-field.component';

export interface SegmentedControlItemContext {
    $implicit: ControlItemInterface;
    selected: boolean;
}

let nextId = 0;

@Component({
    selector: 'app-segmented-control',
    standalone: true,
    imports: [FormsModule, SelectButtonModule, NgTemplateOutlet],
    template: `
        @if (label()) { <span [id]="id() + '-group-label'">{{ label() }}</span> }
        <p-selectbutton #control [options]="items()" optionLabel="label" optionValue="value" [ngModel]="value()"
            [multiple]="false" [allowEmpty]="allowEmpty()" [disabled]="disabled() || readonly()"
            [ariaLabelledBy]="labelledBy()" [pt]="{ root: { id: id(), 'aria-label': ariaLabel(),
                'aria-describedby': describedBy(), 'aria-invalid': effectiveInvalid(), 'aria-readonly': readonly() },
                pcToggleButton: { root: { 'aria-describedby': describedBy(), 'aria-invalid': effectiveInvalid(),
                    'aria-disabled': disabled() || readonly() } } }"
            [class.cards]="variant() === 'cards'" (ngModelChange)="onValueChange($event)"
            (focusout)="onFocusOut($event)">
            <ng-template #item let-item>
                @if (itemTemplate(); as template) {
                    <ng-container [ngTemplateOutlet]="template"
                        [ngTemplateOutletContext]="{ $implicit: item, selected: value() === item.value }" />
                } @else { {{ item.label }} }
            </ng-template>
        </p-selectbutton>
    `,
    styles: [`:host { display: block; } :host ::ng-deep .cards { display: flex; gap: .75rem; flex-wrap: wrap; }
        :host ::ng-deep .cards .p-togglebutton { border-radius: var(--p-togglebutton-border-radius, .5rem); padding: 1rem; }`],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlComponent implements FormValueControl<Value | null> {
    private readonly control = viewChild<unknown, ElementRef<HTMLElement>>('control', {read: ElementRef});
    protected readonly field = inject(FormFieldComponent, {optional: true});
    protected readonly itemTemplate = contentChild<TemplateRef<SegmentedControlItemContext>>('item');
    readonly inputId = input(`app-segmented-control-${nextId++}`);
    readonly label = input('');
    readonly ariaLabel = input<string>();
    readonly ariaLabelledBy = input<string>();
    readonly ariaDescribedBy = input<string>();
    readonly ariaInvalid = input(false);
    readonly items = input<ControlItemInterface[]>([]);
    readonly allowEmpty = input(false);
    readonly variant = input<'segments' | 'cards'>('segments');
    readonly disabled = input(false);
    readonly readonly = input(false);
    readonly value = model<Value | null>(null);
    readonly touched = model(false);
    readonly changed = output<Value | null>();
    protected readonly id = computed(() => this.field?.controlId() ?? this.inputId());
    protected readonly labelledBy = computed(() => this.field?.labelledBy(this.ariaLabelledBy())
        ?? this.ariaLabelledBy() ?? (this.label() ? this.id() + '-group-label' : undefined));
    protected readonly describedBy = computed(() => this.field?.describedBy(this.ariaDescribedBy()) ?? this.ariaDescribedBy());
    protected readonly effectiveInvalid = computed(() => this.field ? this.field.hasError() : this.ariaInvalid());

    onValueChange(value: Value | null): void {
        if (this.disabled() || this.readonly()) return;
        this.value.set(value);
        this.changed.emit(value);
    }

    onFocusOut(event: FocusEvent): void {
        const group = event.currentTarget as HTMLElement;
        if (!group.contains(event.relatedTarget as Node | null)) this.touched.set(true);
    }

    focus(options?: FocusOptions): void {
        const group = this.control()?.nativeElement;
        const selected = group?.querySelector<HTMLElement>('[role="button"][aria-pressed="true"]:not([aria-disabled="true"])');
        (selected ?? group?.querySelector<HTMLElement>('[role="button"]:not([aria-disabled="true"])'))?.focus(options);
    }
}
