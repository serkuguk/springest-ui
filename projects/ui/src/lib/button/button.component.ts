import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {ButtonModule} from "primeng/button";

export type ButtonType = 'button' | 'submit';
export type ButtonSizeType = "small" | "large";
export type ButtonIconPosition = 'left' | 'right' | 'top' | 'bottom';
export type badgeSeverityType = 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' | 'help' | 'primary';

@Component({
    selector: 'app-button',
    imports: [ButtonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
    readonly type = input<ButtonType>('button');
    readonly className = input<string>();
    readonly style = input<Record<string, string | number>>();
    readonly label = input<string>();
    readonly iconPos = input<ButtonIconPosition>('left');
    readonly styleClass = input<string>();
    readonly icon = input<string>();
    readonly disabled = input<boolean>(false);
    readonly rounded = input<boolean>(false);
    readonly badgeSeverity = input<badgeSeverityType>('warn');
    readonly size = input<ButtonSizeType>('small');
    readonly loading = input<boolean>(false);
    readonly aria = input<Record<string, string | number | boolean>>({});
    readonly passThrough = computed(() => ({root: {...this.aria(), 'aria-busy': this.loading() ? 'true' : undefined}}));
}
