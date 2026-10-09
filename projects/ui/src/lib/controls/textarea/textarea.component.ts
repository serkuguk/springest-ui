import {ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, output, viewChild} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {TextareaModule} from 'primeng/textarea';
import {FormFieldComponent} from '../form-field/form-field.component';

let nextId = 0;

@Component({
    selector: 'app-textarea',
    standalone: true,
    imports: [TextareaModule],
    template: `@if (label()) { <label [for]="id()">{{ label() }}</label> }
        <textarea #control pTextarea [id]="id()" [value]="value()" [rows]="rows()" [placeholder]="placeholder()"
            [attr.maxlength]="maxLength()" [disabled]="disabled()" [readOnly]="readonly()"
            [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="labelledBy()"
            [attr.aria-describedby]="describedBy()" [attr.aria-invalid]="effectiveInvalid()"
            (input)="onValueChange($any($event.target).value)" (blur)="touched.set(true)"></textarea>`,
    styles: [`:host { display: block; } textarea { width: 100%; box-sizing: border-box; }`],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent implements FormValueControl<string> {
    private readonly control = viewChild<ElementRef<HTMLTextAreaElement>>('control');
    protected readonly field = inject(FormFieldComponent, {optional: true});
    readonly inputId = input(`app-textarea-${nextId++}`);
    readonly label = input('');
    readonly ariaLabel = input<string>();
    readonly ariaLabelledBy = input<string>();
    readonly ariaDescribedBy = input<string>();
    readonly ariaInvalid = input<boolean>(false);
    readonly disabled = input(false);
    readonly readonly = input(false);
    readonly value = model<string>('');
    readonly touched = model(false);
    readonly changed = output<string>();
    readonly rows = input(3);
    readonly placeholder = input('');
    readonly maxLength = input<number>();
    protected readonly id = computed(() => this.field?.controlId() ?? this.inputId());
    protected readonly labelledBy = computed(() => this.field?.labelledBy(this.ariaLabelledBy()) ?? this.ariaLabelledBy());
    protected readonly describedBy = computed(() => this.field?.describedBy(this.ariaDescribedBy()) ?? this.ariaDescribedBy());
    protected readonly effectiveInvalid = computed(() => this.field ? this.field.hasError() : this.ariaInvalid());

    onValueChange(value: string): void {
        if (this.disabled() || this.readonly()) return;
        this.value.set(value);
        this.changed.emit(value);
    }

    focus(options?: FocusOptions): void {
        this.control()?.nativeElement.focus(options);
    }
}

