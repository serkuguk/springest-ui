import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastVariant = 'correct' | 'warn' | 'error' | 'info';

export interface ToastPayload {
  message: string;
  description?: string | null;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastSubject = new BehaviorSubject<ToastPayload | null>(null);
  readonly toast$ = this.toastSubject.asObservable();
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly zone: NgZone) {}

  mostrarToast(message: string, description: string | null = null, variant: ToastVariant = 'correct'): void {
    if (this.hideTimer !== null) clearTimeout(this.hideTimer);
    this.toastSubject.next({ message, description, variant });
    this.zone.runOutsideAngular(() => {
      this.hideTimer = setTimeout(() => this.zone.run(() => this.clear()), 5000);
    });
  }

  clear(): void {
    if (this.hideTimer !== null) clearTimeout(this.hideTimer);
    this.hideTimer = null;
    this.toastSubject.next(null);
  }
}
