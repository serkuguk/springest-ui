import {ChangeDetectionStrategy, Component, computed, inject, input, model, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormValueControl} from '@angular/forms/signals';
import {DatePickerModule} from 'primeng/datepicker';
import {FloatLabelModule} from 'primeng/floatlabel';

import {FormFieldComponent} from '../controls/form-field/form-field.component';

let nextId = 0;

@Component({
    selector: 'global-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    imports: [DatePickerModule, FloatLabelModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements FormValueControl<Date | null> {

    protected readonly formField = inject(FormFieldComponent, {optional: true});
    public readonly readonly = input<boolean>(false);
    public readonly inputId = input<string>(`app-calendar-${++nextId}`);
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
    protected readonly passThrough = computed(() => ({pcInputText: {root: this.inputAria()}}));


    public placeholder = input<string>();
    public maxDate = input<Date>();
    public minDate = input<Date>();
    public disabled = input<boolean>(false);
    public touched = model<boolean>(false);
    public value = model<Date | null>(null);
    public changed = output<Date | null>();
    public closed = output<void>();

    onChanged(event: Date | null): void {
        this.value.set(event);
        this.changed.emit(event);
    }

    onClosed(): void {
        this.touched.set(true);
        this.closed.emit();
    }
}