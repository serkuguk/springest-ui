import {ChangeDetectionStrategy, Component, computed, inject, input, model, output} from '@angular/core';
import {FloatLabel} from "primeng/floatlabel";
import {FormsModule} from "@angular/forms";
import {Password} from "primeng/password";
import {FormValueControl} from "@angular/forms/signals";

import {FormFieldComponent} from '../form-field/form-field.component';

let nextId = 0;

@Component({
    selector: 'app-password-input',
    standalone: true,
    imports: [
        FloatLabel,
        Password,
        FormsModule
    ],
    templateUrl: './password-input.component.html',
    styleUrl: './password-input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordInputComponent implements FormValueControl<string> {

    protected readonly formField = inject(FormFieldComponent, {optional: true});
    public readonly readonly = input<boolean>(false);
    public readonly inputId = input<string>(`app-password-${++nextId}`);
    public readonly ariaLabel = input<string>();
    public readonly ariaLabelledBy = input<string>();
    public readonly ariaDescribedBy = input<string>();
    public readonly ariaInvalid = input<boolean>(false);
    protected readonly effectiveId = computed(() => this.formField?.controlId() ?? this.inputId());
    protected readonly labelledBy = computed(() => this.formField?.labelledBy(this.ariaLabelledBy()) ?? this.ariaLabelledBy());
    protected readonly inputAria = computed(() => ({
        'aria-describedby': this.formField?.describedBy(this.ariaDescribedBy()) ?? this.ariaDescribedBy(),
        'aria-invalid': this.formField ? this.formField.hasError() : this.ariaInvalid()
    }));
    protected readonly passThrough = computed(() => ({pcInputText: {root: {...this.inputAria(), readonly: this.readonly() ? '' : undefined}}}));

    public placeholder = input<string>("Input your password...");
    public labelType = input<string>("in_label");
    public toggleMask = input<boolean>(true);
    public feedback = input<boolean>(false);
    public readonly autocomplete = input<string>();
    public isDisabled = input<boolean>(false);
    public readonly disabled = input<boolean>(false);
    public value = model<string>('');
    public touched = model<boolean>(false);
    public changed = output<string>();

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.value.set(value);
        this.changed.emit(value);
    }

    onBlur(): void {
        this.touched.set(true);
    }
}
