import {ChangeDetectionStrategy, Component, input, linkedSignal, model, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FormValueControl} from '@angular/forms/signals';
import {FloatLabel} from 'primeng/floatlabel';
import {Select, SelectChangeEvent} from 'primeng/select';

@Component({
  selector: 'app-basic-select',
  imports: [
    Select,
    FormsModule,
    FloatLabel
  ],
  templateUrl: './basic-select.component.html',
  styleUrl: './basic-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicSelectComponent implements FormValueControl<unknown | null> {
  public readonly items = input<unknown[]>();
  public readonly class = input<string>();
  public readonly disabledValue = input<unknown[]>([]);
  public readonly placeholder = input<string>('Select sum items...');
  public readonly lengthTextSelected = input<number>(20);
  public readonly filter = input<boolean>(false);
  public readonly emptyOption = input<boolean>(false);
  public readonly showClear = input<boolean>();
  public readonly withIcons = input<boolean>(false);
  public readonly resetFilterOnHide = input<boolean>(true);
  public readonly nullOrZero = input<number | null>(null);
  public readonly labelType = input<string>('in_label');
  public readonly showIcon = input<boolean>(false);
  public readonly optionLabel = input<string>('name');
  public readonly optionValue = input<string>();
  public readonly changed = output<unknown | null>();
  public readonly showClearState = linkedSignal(() => this.showClear());
  public readonly isDisabled = input<boolean>(false);
  public readonly value = model<unknown | null>(null);
  public readonly touched = model<boolean>(false);
  public readonly closed = output<void>();

  onChanged({value}: SelectChangeEvent): void {
    this.value.set(value);
    this.changed.emit(value);
  }

  onClosed(): void {
    this.touched.set(true);
    this.closed.emit();
  }
}
