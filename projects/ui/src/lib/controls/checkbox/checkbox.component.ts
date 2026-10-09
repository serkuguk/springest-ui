import {ChangeDetectionStrategy, Component, computed, inject, input, model, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormValueControl} from '@angular/forms/signals';
import {CheckboxModule} from 'primeng/checkbox';

import {FormFieldComponent} from '../form-field/form-field.component';

let nextId = 0;

@Component({
    selector: 'app-checkbox',
    standalone: true,
    imports: [CheckboxModule, FormsModule],
    templateUrl: './checkbox.component.html',
    styleUrl: './checkbox.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements FormValueControl<boolean> {

    protected readonly formField = inject(FormFieldComponent, {optional: true});
    public readonly inputId = input<string>(`app-checkbox-${++nextId}`);
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
    protected readonly passThrough = computed(() => ({input: this.inputAria()}));

    public label = input<string>('');
    public binary = input<boolean>(true);
    public disabled = input<boolean>(false);
    public readonly = input<boolean>(false);
    public value = model<boolean>(false);
    public touched = model<boolean>(false);
    public changed = output<boolean>();

    onValueChange(checked: boolean): void {
        this.value.set(checked);
        this.changed.emit(checked);
    }

    onBlur(): void {
        this.touched.set(true);
    }
}