import {ChangeDetectionStrategy, Component, computed, inject, input, model, output, viewChild} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {FormsModule} from '@angular/forms';
import {ToggleSwitch, ToggleSwitchModule} from 'primeng/toggleswitch';
import {FormFieldComponent} from '../form-field/form-field.component';

let nextId = 0;

@Component({
    selector: 'app-toggle',
    standalone: true,
    imports: [FormsModule, ToggleSwitchModule],
    template: `<p-toggleswitch [inputId]="id()" [ngModel]="value()" [disabled]="disabled() || readonly()" [readonly]="readonly()"
            [ariaLabel]="ariaLabel()" [ariaLabelledBy]="labelledBy()"
            [pt]="{ input: { 'aria-describedby': describedBy(), 'aria-invalid': effectiveInvalid(), 'aria-readonly': readonly() } }"
            (ngModelChange)="onValueChange($event)" (focusout)="touched.set(true)" />
        @if (label()) { <label [for]="id()">{{ label() }}</label> }`,
    styles: [`:host { display: inline-flex; align-items: center; gap: .5rem; }`],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent implements FormValueControl<boolean> {
    private readonly control = viewChild(ToggleSwitch);
    protected readonly field = inject(FormFieldComponent, {optional: true});
    readonly inputId = input(`app-toggle-${nextId++}`);
    readonly label = input('');
    readonly ariaLabel = input<string>();
    readonly ariaLabelledBy = input<string>();
    readonly ariaDescribedBy = input<string>();
    readonly ariaInvalid = input<boolean>(false);
    readonly disabled = input(false);
    readonly readonly = input(false);
    readonly value = model<boolean>(false);
    readonly touched = model(false);
    readonly changed = output<boolean>();

    protected readonly id = computed(() => this.field?.controlId() ?? this.inputId());
    protected readonly labelledBy = computed(() => this.field?.labelledBy(this.ariaLabelledBy()) ?? this.ariaLabelledBy());
    protected readonly describedBy = computed(() => this.field?.describedBy(this.ariaDescribedBy()) ?? this.ariaDescribedBy());
    protected readonly effectiveInvalid = computed(() => this.field ? this.field.hasError() : this.ariaInvalid());

    onValueChange(value: boolean): void {
        if (this.disabled() || this.readonly()) return;
        this.value.set(value);
        this.changed.emit(value);
    }

    focus(options?: FocusOptions): void {
        this.control()?.input.nativeElement.focus(options);
    }
}

