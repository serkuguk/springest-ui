import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, model, output, viewChild} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {toSignal} from '@angular/core/rxjs-interop';
import {TranslateService} from '@ngx-translate/core';
import {ButtonComponent} from '../../button/button.component';
import {FormFieldComponent} from '../form-field/form-field.component';

let nextId = 0;

@Component({
    selector: 'app-file-picker',
    standalone: true,
    imports: [ButtonComponent],
    templateUrl: './file-picker.component.html',
    styles: [`
        :host {
            display: block;
        }
        label {
            display: block;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePickerComponent implements FormValueControl<File[]> {
    private readonly translate = inject(TranslateService, {optional: true});
    private readonly clearTranslation = this.translate ? toSignal(this.translate.stream('FILE_PICKER.CLEAR_FILES')) : undefined;
    protected readonly clearLabel = computed(() => {
        const translated = this.clearTranslation?.();
        return translated && translated !== 'FILE_PICKER.CLEAR_FILES' ? translated : 'Clear files';
    });
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
    readonly touch = output<void>();
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
        this.touch.emit();
    }

    focus(options?: FocusOptions): void {
        this.picker()?.nativeElement.focus(options);
    }

    private setFiles(files: File[]): void {
        this.value.set(files);
        this.changed.emit(files);
    }
}
