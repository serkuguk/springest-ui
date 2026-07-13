import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormValueControl} from '@angular/forms/signals';
import {CheckboxModule} from 'primeng/checkbox';

@Component({
    selector: 'app-checkbox',
    standalone: true,
    imports: [CheckboxModule, FormsModule],
    templateUrl: './checkbox.component.html',
    styleUrl: './checkbox.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements FormValueControl<boolean> {
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
