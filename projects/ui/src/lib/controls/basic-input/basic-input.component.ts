import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {InputTextModule} from 'primeng/inputtext';
import {FloatLabel} from "primeng/floatlabel";
import {FormValueControl} from "@angular/forms/signals";

@Component({
    selector: 'app-basic-input',
    standalone: true,
    imports: [InputTextModule, FloatLabel],
    templateUrl: './basic-input.component.html',
    styleUrl: './basic-input.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicInputComponent implements FormValueControl<string> {
    public placeholder = input<string>("Input some text...");
    public labelType = input<string>("in_label");
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
