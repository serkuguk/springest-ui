import {ChangeDetectionStrategy, Component, computed, inject, input, model, output} from '@angular/core';
import {InputTextModule} from 'primeng/inputtext';
import {FloatLabel} from "primeng/floatlabel";
import {FormValueControl} from "@angular/forms/signals";
import {FormFieldComponent} from '../form-field/form-field.component';

let nextInputId = 0;

@Component({
    selector: 'app-basic-input',
    standalone: true,
    imports: [InputTextModule, FloatLabel],
    templateUrl: './basic-input.component.html',
    styleUrl: './basic-input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicInputComponent<T extends string | number | null = string> implements FormValueControl<T> {
    readonly formField = inject(FormFieldComponent, {optional: true});
    readonly placeholder = input<string>("Input some text...");
    readonly labelType = input<string>("in_label");
    readonly isDisabled = input<boolean>(false);
    readonly type = input<'text' | 'email' | 'search' | 'number'>('text');
    readonly min = input<number>();
    readonly max = input<number>();
    readonly step = input<number | 'any'>();
    readonly readonly = input(false);
    readonly disabled = input(false);
    readonly autocomplete = input<string>();
    readonly autocapitalize = input<string>();
    readonly lang = input<string>();
    readonly spellcheck = input<boolean>();
    readonly inputId = input(`springest-input-${++nextInputId}`);
    readonly label = input<string>();
    readonly ariaLabel = input<string>();
    readonly ariaLabelledBy = input<string>();
    readonly ariaDescribedBy = input<string>();
    readonly ariaInvalid = input<boolean | string>();
    readonly effectiveId = computed(() => this.formField?.controlId() ?? this.inputId());
    readonly value = model<T>('' as T);
    readonly touched = model<boolean>(false);
    readonly changed = output<T>();

    onInput(event: Event): void {
        const field = event.target as HTMLInputElement;
        const value = (this.type() === 'number' ? (Number.isFinite(field.valueAsNumber) ? field.valueAsNumber : null) : field.value) as T;
        this.value.set(value);
        this.changed.emit(value);
    }

    onKeyup(event: Event): void { this.onInput(event); }

    onBlur(): void {
        this.touched.set(true);
    }
}
