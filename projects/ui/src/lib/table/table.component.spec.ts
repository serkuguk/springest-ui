import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {TableComponent, TableRow} from './table.component';

describe('TableComponent', () => {
  let fixture: ComponentFixture<TableComponent>;
  let component: TableComponent;
  const rows: TableRow[] = Array.from({length: 12}, (_, i) => Object.freeze({name: String(12 - i), date: '2025-12-31'}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [TableComponent], providers: [provideTranslateService()]}).compileComponents();
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dataSource', Object.freeze([...rows]));
    fixture.componentRef.setInput('dataSourceColumns', [
      {field: 'name', header: 'Name', type: 'clickable', modificable: true},
      {field: 'date', header: 'Date', type: 'date-reverse'},
      {field: 'hidden', header: 'Hidden', type: 'text', visible: false},
    ]);
    fixture.detectChanges();
  });

  it('shows columns by default and uses calendar year/month/day tokens', () => {
    const headers = fixture.nativeElement.querySelectorAll('thead th');
    expect(headers[0].hidden).toBe(false);
    expect(headers[2].hidden).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('2025-12-31');
  });

  it('sorts its own array, retains row identities and leaves input untouched', () => {
    component.onCustomSort({data: component.enrichedDataSource(), field: 'name', order: 1});
    expect(component.enrichedDataSource()[0]).toBe(rows[11]);
    expect(component.dataSource()[0]).toBe(rows[0]);
    component.onCustomSort({data: component.dataSource(), field: 'name', order: -1});
    expect(component.dataSource()[0]).toBe(rows[0]);
  });

  it('sorts numbers and dates with missing/invalid values last in either direction', () => {
    fixture.componentRef.setInput('dataSourceColumns', [{field: 'date', header: 'Date', type: 'date'}]);
    const a = {date: '2024-01-01'}, b = {date: '2025-01-01'}, empty = {date: null}, invalid = {date: 'bad'};
    const data = [empty, b, invalid, a];
    component.onCustomSort({data, field: 'date', order: 1});
    expect(data).toEqual([a, b, empty, invalid]);
    component.onCustomSort({data, field: 'date', order: -1});
    expect(data).toEqual([b, a, empty, invalid]);
    fixture.componentRef.setInput('dataSourceColumns', [{field: 'date', header: 'Number', type: 'number'}]);
    const numbers = [{date: 10}, {date: -2}, {date: 0}];
    component.onCustomSort({data: numbers, field: 'date', order: 1});
    expect(numbers.map(row => row.date)).toEqual([-2, 0, 10]);
  });

  it('edits the clicked row after sorting/pagination without resetting the page', () => {
    fixture.componentRef.setInput('paginator', true);
    fixture.detectChanges();
    component.onCustomSort({data: component.enrichedDataSource(), field: 'name', order: 1});
    (fixture.nativeElement.querySelectorAll('.p-paginator-page')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    const row = component.enrichedDataSource()[10];
    (fixture.nativeElement.querySelector('tbody button.clickable') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.editingRow()).toBe(row);
    expect(component.table.first).toBe(10);
    expect(fixture.nativeElement.querySelectorAll('tbody app-basic-input').length).toBe(1);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('tbody input'));
    component.cancelEdit();
    fixture.detectChanges();
    expect(component.editingRow()).toBeNull();
    expect(component.table.first).toBe(10);
  });

  it('rejects empty edits, emits the original row and never mutates it', () => {
    const emitted = jest.fn();
    component.rowUpdate.subscribe(emitted);
    component.startEdit(rows[0]);
    component.editModel.set({inputValue: ''});
    component.confirmEdit(rows[0]);
    expect(emitted).not.toHaveBeenCalled();
    expect(component.initialForm.inputValue().touched()).toBe(true);
    component.editModel.set({inputValue: 'updated'});
    component.confirmEdit(rows[0]);
    expect(emitted).toHaveBeenCalledWith({data: rows[0], field: 'name', newValue: 'updated'});
    expect(rows[0]['name']).toBe('12');
    expect(component.editingRow()).toBeNull();
  });

  it('cancels when the edited row is replaced and ignores stale saves', () => {
    const emitted = jest.fn();
    component.rowUpdate.subscribe(emitted);
    component.startEdit(rows[0]);
    fixture.componentRef.setInput('dataSource', [{...rows[0]}]);
    fixture.detectChanges();
    expect(component.editingRow()).toBeNull();
    component.confirmEdit(rows[0]);
    expect(emitted).not.toHaveBeenCalled();
  });

  it('edits only the explicit field and handles Escape and submit without navigation', () => {
    fixture.componentRef.setInput('editableFieldName', 'date');
    component.startEdit(rows[0]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody app-basic-input').length).toBe(1);
    const form = fixture.nativeElement.querySelector('tbody form') as HTMLFormElement;
    form.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    expect(component.editingRow()).toBeNull();
    component.startEdit(rows[0]);
    fixture.detectChanges();
    const event = new Event('submit', {cancelable: true});
    fixture.nativeElement.querySelector('tbody form').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(component.editingRow()).toBeNull();
  });

  it('gives each table a unique actions header ID', () => {
    const second = TestBed.createComponent(TableComponent);
    expect(second.componentInstance.actionsId).not.toBe(component.actionsId);
    second.destroy();
  });
});
