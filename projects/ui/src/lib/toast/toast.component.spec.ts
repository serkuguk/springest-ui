import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ToastComponent } from './toast.component';
import { ToastPayload, ToastService, ToastVariant } from './toast.service';

describe('library toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({ imports: [ToastComponent] });
  });

  afterEach(() => {
    TestBed.inject(ToastService).clear();
    TestBed.resetTestingModule();
    jest.useRealTimers();
  });

  function createToast() {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.detectChanges();
    const toast = fixture.debugElement.children[0].componentInstance as Toast;
    return { fixture, toast, service: TestBed.inject(ToastService) };
  }

  it.each<ToastVariant>(['correct', 'warn', 'error', 'info'])('renders %s with a local MessageService', variant => {
    const { fixture, toast, service } = createToast();
    expect(TestBed.inject(MessageService, null)).toBeNull();
    expect(fixture.debugElement.injector.get(MessageService)).toBeTruthy();
    service.mostrarToast('Title', 'Description', variant);
    expect(toast.messages).toHaveLength(1);
    expect(toast.messages?.[0]).toMatchObject({
      severity: variant === 'correct' ? 'success' : variant,
      summary: 'Title', detail: 'Description', sticky: true,
    });
    expect(fixture.nativeElement.textContent).toContain('Description');
    expect(toast.position).toBe('top-right');
  });

  it('replaces the current message and restarts the five-second timer', () => {
    const { fixture, toast, service } = createToast();
    service.mostrarToast('First');
    jest.advanceTimersByTime(4000);
    service.mostrarToast('Second');
    expect(toast.messages).toHaveLength(1);
    expect(toast.messages?.[0].summary).toBe('Second');
    expect(toast.messages?.[0].detail).toBeUndefined();
    expect(fixture.nativeElement.textContent).not.toContain('First');
    jest.advanceTimersByTime(4999);
    expect(toast.messages).toHaveLength(1);
    jest.advanceTimersByTime(1);
    expect(toast.messages).toEqual([]);
    expect(fixture.nativeElement.textContent).not.toContain('Second');
  });

  it('clears state on manual close and ignores a stale close event', () => {
    const { fixture, toast, service } = createToast();
    let current: ToastPayload | null = null;
    const subscription = service.toast$.subscribe(value => current = value);
    service.mostrarToast('Same');
    const oldMessage = toast.messages![0];
    service.mostrarToast('Same');
    toast.onClose.emit({ message: oldMessage });
    expect(toast.messages).toHaveLength(1);
    expect(current).not.toBeNull();
    const closeButton = fixture.nativeElement.querySelector('button.p-toast-close-button') as HTMLButtonElement;
    expect(closeButton.getAttribute('aria-label')).toBeTruthy();
    closeButton.click();
    fixture.detectChanges();
    // jsdom does not render CSS transitions; finish PrimeNG's leave transition explicitly.
    const message = fixture.debugElement.query(element => element.nativeElement.classList?.contains('p-toast-message'));
    message.triggerEventHandler('pMotionOnAfterLeave', { element: message.nativeElement });
    fixture.detectChanges();
    expect(current).toBeNull();
    expect(toast.messages).toEqual([]);
    expect(fixture.nativeElement.textContent).not.toContain('Same');
    service.mostrarToast('Clear me');
    service.clear();
    expect(current).toBeNull();
    expect(toast.messages).toEqual([]);
    expect(fixture.nativeElement.textContent).not.toContain('Clear me');
    subscription.unsubscribe();
  });

  it('replays existing state on mount and unsubscribes on destroy', () => {
    TestBed.inject(ToastService).mostrarToast('Before mount');
    const { fixture, toast, service } = createToast();
    expect(toast.messages?.[0].summary).toBe('Before mount');
    fixture.destroy();
    expect(() => service.mostrarToast('After destroy')).not.toThrow();
    expect(toast.messages?.[0].summary).toBe('Before mount');
  });
});
