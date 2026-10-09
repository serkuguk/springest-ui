import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

export type FieldErrorMessages = Record<string, string | ((error: Record<string, unknown>) => string)>;
type FieldError = Record<string, unknown> & {kind?: string; message?: string};
type SignalFieldState = {invalid: () => boolean; touched: () => boolean; errors: () => readonly FieldError[]};
let nextFieldId = 0;

@Component({
    selector: 'app-form-field',
    templateUrl: './form-field.component.html',
    styleUrl: './form-field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent {
    private readonly controlRevision = signal(0);
    private readonly translate = inject(TranslateService, {optional: true});
    readonly label = input<string>();
    readonly required = input(false);
    readonly isInline = input(true);
    readonly showLabel = input(false);
    readonly field = input.required<unknown>();
    readonly patternError = input<string>();
    readonly submitted = input(false);
    readonly errorMessages = input<FieldErrorMessages>({});
    readonly controlId = input(`springest-field-${++nextFieldId}`);
    readonly labelId = computed(() => `${this.controlId()}-label`);
    readonly errorId = computed(() => `${this.controlId()}-error`);

    constructor() {
        effect(onCleanup => {
            const control = this.field();
            if (control instanceof AbstractControl) {
                const subscription = control.events.subscribe(() => this.controlRevision.update(revision => revision + 1));
                onCleanup(() => subscription.unsubscribe());
            }
        });
    }

    hasError(): boolean {
        this.controlRevision();
        const control = this.field();
        if (control instanceof AbstractControl) return control.invalid && (control.touched || this.submitted());
        const state = this.getSignalFieldState(control);
        return !!state && state.invalid() && (state.touched() || this.submitted());
    }

    get errorKey(): string | null {
        this.controlRevision();
        const control = this.field();
        if (control instanceof AbstractControl) return Object.keys(control.errors ?? {})[0] ?? null;
        const kind = this.getSignalFieldState(control)?.errors()[0]?.kind;
        return kind === 'minLength' ? 'minlength' : kind === 'maxLength' ? 'maxlength' : kind ?? null;
    }

    get errorValue(): unknown {
        this.controlRevision();
        const control = this.field();
        return control instanceof AbstractControl
            ? control.errors?.[this.errorKey ?? '']
            : this.getSignalFieldState(control)?.errors()[0];
    }

    get errorMessage(): string {
        const key = this.errorKey;
        if (!key) return '';
        const data = this.errorValue;
        const error: FieldError = data && typeof data === 'object' ? data as FieldError : {};
        const override = this.errorMessages()[error.kind ?? key] ?? this.errorMessages()[key];
        if (override !== undefined) return typeof override === 'function' ? override(error) : override;
        if (error.message) return error.message;
        switch (key) {
            case 'required': {
                const translated = this.translate?.instant('ERRORS.FIELD_REQUIRED');
                return translated && translated !== 'ERRORS.FIELD_REQUIRED' ? translated : 'Required field';
            }
            case 'email': return 'Invalid email';
            case 'minlength': return `At least ${error.minLength ?? error.requiredLength} characters`;
            case 'maxlength': return `No more than ${error.maxLength ?? error.requiredLength} characters`;
            case 'min': return `Minimum ${error.min}`;
            case 'max': return `Maximum ${error.max}`;
            case 'pattern': return this.patternError() ?? 'Pattern does not match';
            case 'parse': return 'Invalid value';
            default: return typeof data === 'string' ? data : 'Invalid value';
        }
    }

    describedBy(existing?: string): string | undefined {
        return [...new Set([...(existing?.split(/\s+/).filter(Boolean) ?? []), ...(this.hasError() ? [this.errorId()] : [])])].join(' ') || undefined;
    }

    labelledBy(existing?: string): string | undefined {
        return [...new Set([...(existing?.split(/\s+/).filter(Boolean) ?? []), ...(this.showLabel() && this.label() ? [this.labelId()] : [])])].join(' ') || undefined;
    }

    private getSignalFieldState(value: unknown): SignalFieldState | null {
        const candidate = typeof value === 'function' ? value() : value;
        if (!candidate || typeof candidate !== 'object') return null;
        const state = candidate as Partial<SignalFieldState>;
        return typeof state.invalid === 'function' && typeof state.touched === 'function' && typeof state.errors === 'function'
            ? state as SignalFieldState : null;
    }
}
