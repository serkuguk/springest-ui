import {
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild, effect,
    input,
    output,
    signal,
    TemplateRef,
    ViewChild,
    viewChild
} from '@angular/core';
import {Table, TableModule} from "primeng/table";
import {TranslatePipe} from "@ngx-translate/core";
import {DatePipe, NgTemplateOutlet} from "@angular/common";
import {ButtonComponent} from '../button/button.component';
import {Tooltip} from 'primeng/tooltip';
import {SortEvent} from "primeng/api";
import {FormFieldComponent} from '../controls/form-field/form-field.component';
import {BasicInputComponent} from '../controls/basic-input/basic-input.component';
import {FormField, form, required} from "@angular/forms/signals";

let nextTableId = 0;

type ColumnType =
    | 'datetime' | 'date' | 'date-mes' | 'date-reverse'
    | 'icon' | 'decimal' | 'clickable' | 'number' | 'text' | 'especial';

export interface TableColumn {
    field: string;
    header: string;
    width?: string;
    minWidth?: string;
    textAlign?: 'left' | 'center' | 'right';
    type: ColumnType;
    visible?: boolean;
    modificable?: boolean;
}

export interface TableRowUpdateEvent {
    data: TableRow;
    field: string;
    newValue: any;
}

export interface TableRowSelectEvent {
    data?: TableRow | TableRow[];
    index?: number;
}

export interface TableRow {
    [key: string]: any;
    _editing?: boolean;
    _originalData?: any;
}

@Component({
    selector: 'app-table',
    standalone: true,
    imports: [
        TableModule,
        Tooltip,
        TranslatePipe,
        NgTemplateOutlet,
        DatePipe,
        ButtonComponent,
        FormFieldComponent,
        BasicInputComponent,
        FormField
    ],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {

    private readonly editor = viewChild(BasicInputComponent);
    rows = 10;
    readonly editingRow = signal<TableRow | null>(null);
    readonly actionsId = 'springest-table-actions-' + ++nextTableId;
    dataSource = input<TableRow[]>([]);
    // ponytail: copy only the array so PrimeNG sorting never mutates consumer data.
    enrichedDataSource = computed(() => [...this.dataSource()]);
    dataSourceColumns = input<TableColumn[]>([]);
    iconColor = input<string>('');
    iconClass = input<string>('');
    msgTooltip = input<string>('');
    paginator = input<boolean>(false);
    selectionMode = input<"single" | "multiple" | undefined | null>(null);
    scrollable = input<boolean>(true);
    metaKeySelection = input<boolean>();
    resizableColumns = input<boolean>(false);
    selectedRowValue = input<null | any[]>();
    showIconSort = input<boolean>(true);
    showRowActions = input<boolean>(true);
    showIconCondition = input<boolean>(false);
    showFilterCondition = input<string>();
    editableFieldName = input<string>(); // Optional: explicitly specify which field is editable
    customSortFun = true;
    editModel = signal({inputValue: ''});
    initialForm = form(this.editModel, (p) => {
        required(p.inputValue);
    });

    //outputs
    selectRow = output<{ row: TableRow, rowIndex: number }>();
    unselectRow = output<null>();
    cellEdit = output<any>();
    rowUpdate = output<TableRowUpdateEvent>();

    @ViewChild('table') table!: Table;
    @ContentChild('customCellTemplate') customCellTemplate: TemplateRef<any> | undefined;

    constructor() {
        afterRenderEffect(() => {
            if (this.editingRow()) this.editor()?.focus();
        });
        effect(() => {
            const row = this.editingRow();
            if (row && !this.dataSource().includes(row)) this.editingRow.set(null);
        });
    }

    public onSelectedRow(event: TableRowSelectEvent): void {
        if (!event.data || Array.isArray(event.data) || event.index === undefined) return;
        this.selectRow.emit({row: event.data, rowIndex: event.index});
    }

    onRowUnselect(): void {
        this.unselectRow.emit(null);
    }

    onCustomSort(event: SortEvent): void {
        const { data, field, order } = event;
        if (!field) return;

        const col = this.dataSourceColumns().find(c => c.field === field);
        if (!col) return;

        if (!data || data === this.dataSource()) return;

        const value = (row: TableRow): string | number | null => {
            const raw = row[field];
            if (raw === null || raw === undefined || raw === '') return null;
            if (this.isDateType(col.type)) {
                const time = new Date(raw).getTime();
                return Number.isFinite(time) ? time : null;
            }
            return typeof raw === 'number' ? (Number.isFinite(raw) ? raw : null) : String(raw);
        };
        // Empty/invalid values sort last in either direction.
        data.sort((a, b) => {
            const av = value(a), bv = value(b);
            if (av === null) return bv === null ? 0 : 1;
            if (bv === null) return -1;
            return (typeof av === 'number' && typeof bv === 'number'
                ? av - bv : String(av).localeCompare(String(bv))) * (order ?? 1);
        });
    }

    /**
     * Determines the field name to edit.
     * Priority: 1) explicit editableFieldName input, 2) first modificable column
     */
    getEditableField(): string | null {
        // First, check if editableFieldName is explicitly provided
        const explicitField = this.editableFieldName();
        if (explicitField) {
            return explicitField;
        }

        // Otherwise, find the first modificable column
        const modificableCol = this.dataSourceColumns().find(col => col.modificable);
        return modificableCol?.field ?? null;
    }

    /**
     * Determines if a column type is a date type
     */
    private isDateType(type: ColumnType): boolean {
        return type === 'date' || type === 'datetime' || type === 'date-mes' || type === 'date-reverse';
    }

    /**
     * Determines if a column should use custom cell template
     */
    shouldUseCustomCell(col: TableColumn): boolean {
        return this.isDateType(col.type)
            || col.type === 'icon'
            || col.type === 'decimal'
            || col.type === 'clickable';
    }

    public startEdit(row: TableRow, _rowIndex?: number): void {
        const field = this.getEditableField();
        if (!field || !this.dataSource().includes(row)) return;
        this.initialForm().reset({inputValue: String(row[field] ?? '')});
        this.editingRow.set(row);
    }

    public confirmEdit(row: TableRow): void {
        const field = this.getEditableField();
        if (!field || this.editingRow() !== row || !this.dataSource().includes(row)) return;
        this.initialForm.inputValue().markAsTouched();
        if (this.initialForm().invalid()) return;
        this.editingRow.set(null);
        this.rowUpdate.emit({data: row, field, newValue: this.editModel().inputValue});
    }

    public cancelEdit(_row?: TableRow): void {
        this.editingRow.set(null);
    }
}
