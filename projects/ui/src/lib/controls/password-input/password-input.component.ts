import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {FloatLabel} from "primeng/floatlabel";
import {FormsModule} from "@angular/forms";
import {Password} from "primeng/password";
import {FormValueControl} from "@angular/forms/signals";

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
    public placeholder = input<string>("Input your password...");
    public labelType = input<string>("in_label");
    public toggleMask = input<boolean>(true);
    public feedback = input<boolean>(false);
    public isDisabled = input<boolean>(false);
    public value = model<string>('');
    public touched = model<boolean>(false);
    public changed = output<string>();

    onKeyup(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.value.set(value);
        this.changed.emit(value);
    }

    onBlur(): void {
        this.touched.set(true);
    }
}
