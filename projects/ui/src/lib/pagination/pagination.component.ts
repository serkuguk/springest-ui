import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {PaginatorModule, PaginatorState} from 'primeng/paginator';

export type {PaginatorState} from 'primeng/paginator';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [PaginatorModule],
    template: `<p-paginator [first]="first()" [rows]="rows()" [totalRecords]="totalRecords()"
        [rowsPerPageOptions]="rowsPerPageOptions()" (onPageChange)="onPageChange($event)" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
    readonly first = model(0);
    readonly rows = model(10);
    readonly totalRecords = input(0);
    readonly rowsPerPageOptions = input<number[]>();
    readonly pageChange = output<PaginatorState>();

    onPageChange(event: PaginatorState): void {
        if (event.first !== undefined) this.first.set(event.first);
        if (event.rows !== undefined) this.rows.set(event.rows);
        this.pageChange.emit(event);
    }
}
