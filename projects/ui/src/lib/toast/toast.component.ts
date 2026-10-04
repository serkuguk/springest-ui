import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { Toast, ToastCloseEvent } from 'primeng/toast';
import { ToastPayload, ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [Toast],
  providers: [MessageService],
  template: '<p-toast position="top-right" (onClose)="onClose($event)" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements AfterViewInit {
  private readonly toast = viewChild.required(Toast);
  private readonly messages = inject(MessageService);
  private readonly service = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private current: ToastPayload | null = null;

  ngAfterViewInit(): void {
    this.service.toast$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(payload => {
      this.current = payload;
      // ponytail: reset PrimeNG 21's public list synchronously; animated clear() can close a replacement.
      this.toast().messages = [];
      if (payload) {
        this.messages.add({
          severity: payload.variant === 'correct' ? 'success' : payload.variant,
          summary: payload.message,
          detail: payload.description ?? undefined,
          sticky: true,
          data: payload,
        });
      }
      this.toast().cd.detectChanges();
    });
  }

  onClose(event: ToastCloseEvent): void {
    if (this.current && event.message?.data === this.current) this.service.clear();
  }
}
