import {ChangeDetectionStrategy, Component, computed, inject, input, model, output, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormValueControl} from '@angular/forms/signals';
import {InputNumber} from 'primeng/inputnumber';
import {FormFieldComponent} from '../form-field/form-field.component';

let nextId = 0;

@Component({
    selector: 'app-input-number',
    imports: [FormsModule, InputNumber],
    template: `
        @if (label()) { <label [for]="id()">{{ label() }}</label> }
        <p-inputnumber [inputId]="id()" [ngModel]="value()" (ngModelChange)="onValueChange($event)"
            [disabled]="disabled()" [readonly]="readonly()" [min]="min()" [max]="max()" [step]="step()"
            [locale]="locale()" [mode]="mode()" [currency]="currency()"
            [minFractionDigits]="minFractionDigits()" [maxFractionDigits]="maxFractionDigits()"
            [ariaLabel]="ariaLabel()" [ariaLabelledBy]="labelledBy()" [ariaDescribedBy]="describedBy()"
            [invalid]="effectiveInvalid()" [pt]="passThrough()" (onBlur)="touched.set(true); touch.emit()" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberComponent implements FormValueControl<number | null> {
    private readonly control = viewChild(InputNumber);
    private readonly field = inject(FormFieldComponent, {optional: true});
    readonly value = model<number | null>(null);
    readonly touched = model(false);
    readonly changed = output<number | null>();
    readonly touch = output<void>();
    readonly disabled = input(false);
    readonly readonly = input(false);
    readonly inputId = input(`app-input-number-${++nextId}`);
    readonly label = input('');
    readonly ariaLabel = input<string>();
    readonly ariaLabelledBy = input<string>();
    readonly ariaDescribedBy = input<string>();
    readonly ariaInvalid = input(false);
    readonly min = input<number>();
    readonly max = input<number>();
    readonly step = input(1);
    readonly locale = input<string>();
    readonly mode = input<'decimal' | 'currency'>('decimal');
    readonly currency = input<string>();
    readonly minFractionDigits = input<number>();
    readonly maxFractionDigits = input<number>();
    protected readonly id = computed(() => this.field?.controlId() ?? this.inputId());
    protected readonly labelledBy = computed(() => this.field?.labelledBy(this.ariaLabelledBy()) ?? this.ariaLabelledBy());
    protected readonly describedBy = computed(() => this.field?.describedBy(this.ariaDescribedBy()) ?? this.ariaDescribedBy());
    protected readonly effectiveInvalid = computed(() => this.field ? this.field.hasError() : this.ariaInvalid());
    protected readonly passThrough = computed(() => ({pcInputText: {root: {'aria-invalid': this.effectiveInvalid()}}}));

    onValueChange(value: number | null): void {
        if (this.disabled() || this.readonly()) return;
        this.value.set(value);
        this.changed.emit(value);
    }

    focus(options?: FocusOptions): void {
        this.control()?.input().nativeElement.focus(options);
    }
}
