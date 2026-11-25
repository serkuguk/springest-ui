import {TestBed} from '@angular/core/testing';
import {provideTranslateService, TranslateService} from '@ngx-translate/core';
import {FilePickerComponent} from './file-picker.component';

describe('FilePickerComponent localization', () => {
    it('keeps the clear button usable without a translation provider', () => {
        const fixture = TestBed.createComponent(FilePickerComponent);
        fixture.componentInstance.value.set([new File(['content'], 'example.txt')]);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('button').textContent.trim()).toBe('Clear files');
    });

    it('updates the visible clear label in two languages and falls back for missing keys', () => {
        TestBed.configureTestingModule({providers: [provideTranslateService()]});
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', {FILE_PICKER: {CLEAR_FILES: 'Clear selected files'}});
        translate.setTranslation('es', {FILE_PICKER: {CLEAR_FILES: 'Borrar archivos'}});
        translate.setTranslation('missing', {});
        const fixture = TestBed.createComponent(FilePickerComponent);
        fixture.componentInstance.value.set([new File(['content'], 'example.txt')]);
        for (const [language, label] of [['en', 'Clear selected files'], ['es', 'Borrar archivos'], ['missing', 'Clear files']]) {
            translate.use(language);
            fixture.detectChanges();
            const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
            expect(button.textContent?.trim()).toBe(label);
            expect(button.getAttribute('aria-label') ?? button.textContent?.trim()).toBe(label);
        }
    });
});
