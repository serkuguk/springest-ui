import {DOCUMENT} from '@angular/common';
import {ChangeDetectionStrategy, Component, effect, inject, input, model} from '@angular/core';
import {DialogModule} from 'primeng/dialog';

@Component({
    selector: 'app-dialog',
    standalone: true,
    imports: [DialogModule],
    template: `
        <p-dialog [visible]="visible()" (visibleChange)="visible.set($event)" [header]="header()"
            [modal]="true" [closeOnEscape]="true" [closable]="true" [dismissableMask]="false"
            [draggable]="false" [resizable]="false" [focusTrap]="true" (onHide)="restoreFocus()">
            <ng-content />
            <ng-template #footer><ng-content select="[dialogActions]" /></ng-template>
        </p-dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
    private readonly document = inject(DOCUMENT);
    private opener: HTMLElement | null = null;
    readonly visible = model(false);
    readonly header = input('');

    constructor() {
        effect(() => {
            if (this.visible()) this.opener = this.document.activeElement as HTMLElement | null;
        });
    }

    restoreFocus(): void {
        if (this.opener?.isConnected) this.opener.focus();
        this.opener = null;
    }
}
