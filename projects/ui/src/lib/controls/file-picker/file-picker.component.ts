import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, model, output, viewChild} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {ButtonComponent} from '../../button/button.component';
import {FormFieldComponent} from '../form-field/form-field.component';

let nextId = 0;

@Component({
    selector: 'app-file-picker',
    standalone: true,
    imports: [ButtonComponent],
    template: `
        @if (label()) { <label [for]="id()">{{ label() }}</label> }
        <input #picker type="file" [id]="id()" [accept]="accept()" [multiple]="multiple()"
            [disabled]="disabled() || readonly()" [attr.aria-readonly]="readonly()"
            [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="labelledBy()"
            [attr.aria-describedby]="describedBy()" [attr.aria-invalid]="effectiveInvalid()"
            (change)="onFileChange($event)" (blur)="touched.set(true)" />
        @if (value().length) {
            <ul>@for (file of value(); track $index) { <li>{{ file.name }}</li> }</ul>
            <app-button label="Clear files" [disabled]="disabled() || readonly()" (click)="clear()" />
        }
    `,
    styles: [`:host { display: block; } label { display: block; }`],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePickerComponent implements FormValueControl<File[]> {
    protected readonly field = inject(FormFieldComponent, {optional: true});
    protected readonly picker = viewChild<ElementRef<HTMLInputElement>>('picker');
    readonly inputId = input(`app-file-picker-${nextId++}`);
    readonly label = input('');
    readonly ariaLabel = input<string>();
    readonly ariaLabelledBy = input<string>();
    readonly ariaDescribedBy = input<string>();
    readonly ariaInvalid = input(false);
    readonly accept = input('');
    readonly multiple = input(false);
    readonly disabled = input(false);
    readonly readonly = input(false);
    readonly value = model<File[]>([]);
    readonly touched = model(false);
    readonly changed = output<File[]>();
    protected readonly id = computed(() => this.field?.controlId() ?? this.inputId());
    protected readonly labelledBy = computed(() => this.field?.labelledBy(this.ariaLabelledBy()) ?? this.ariaLabelledBy());
    protected readonly describedBy = computed(() => this.field?.describedBy(this.ariaDescribedBy()) ?? this.ariaDescribedBy());
    protected readonly effectiveInvalid = computed(() => this.field ? this.field.hasError() : this.ariaInvalid());

    constructor() {
        effect(() => {
            const picker = this.picker();
            if (!this.value().length && picker) picker.nativeElement.value = '';
        });
    }

    onFileChange(event: Event): void {
        if (this.disabled() || this.readonly()) return;
        const files = (event.target as HTMLInputElement).files;
        if (!files?.length) return;
        this.setFiles(Array.from(files));
    }

    clear(): void {
        if (this.disabled() || this.readonly()) return;
        const picker = this.picker();
        if (picker) picker.nativeElement.value = '';
        this.setFiles([]);
        this.touched.set(true);
    }

    focus(options?: FocusOptions): void {
        this.picker()?.nativeElement.focus(options);
    }

    private setFiles(files: File[]): void {
        this.value.set(files);
        this.changed.emit(files);
    }
}
