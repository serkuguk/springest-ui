import {DOCUMENT} from '@angular/common';
import {afterRenderEffect, ChangeDetectionStrategy, Component, effect, inject, input, model, viewChild} from '@angular/core';
import {Dialog, DialogModule} from 'primeng/dialog';

@Component({
    selector: 'app-dialog',
    standalone: true,
    imports: [DialogModule],
    template: `
        <p-dialog [visible]="visible()" (visibleChange)="visible.set($event)" [header]="header()"
            [modal]="true" [closeOnEscape]="closeOnEscape()" [closable]="closable()" [dismissableMask]="dismissableMask()"
            [closeAriaLabel]="closeAriaLabel()"
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
    private readonly dialog = viewChild(Dialog);
    readonly visible = model(false);
    readonly header = input('');
    readonly closable = input(true);
    readonly closeOnEscape = input(true);
    readonly dismissableMask = input(false);
    readonly closeAriaLabel = input<string>();

    constructor() {
        effect(() => {
            if (this.visible()) this.opener = this.document.activeElement as HTMLElement | null;
        });
        afterRenderEffect(onCleanup => {
            const dialog = this.dialog();
            const closable = this.closable();
            const closeOnEscape = this.closeOnEscape();
            const dismissableMask = this.dismissableMask();
            if (!this.visible() || !dialog?.container() || !dialog.wrapper) return;
            // shortcut: PrimeNG 21 snapshots closing options on entry; remove rebinding when upstream handles live changes.
            dialog.unbindDocumentEscapeListener();
            dialog.unbindMaskClickListener();
            if (closable && closeOnEscape) dialog.bindDocumentEscapeListener();
            if (closable && dismissableMask) dialog.enableModality();
            onCleanup(() => {
                dialog.unbindDocumentEscapeListener();
                dialog.unbindMaskClickListener();
            });
        });
    }

    restoreFocus(): void {
        if (this.opener?.isConnected) this.opener.focus();
        this.opener = null;
    }
}
