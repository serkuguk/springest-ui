import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {UIChart} from "primeng/chart";
import {ChartData} from '../types';
import {ChartOptionsInput} from './interface/chart-options.interface';

@Component({
  selector: 'app-charts',
  imports: [
    UIChart
  ],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartsComponent {
  readonly data = input<ChartData | null>(null);
  readonly options = input<ChartOptionsInput | null>(null);
}
