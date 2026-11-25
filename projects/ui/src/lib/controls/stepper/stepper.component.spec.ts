import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, isWritableSignal, signal, WritableSignal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {StepperControlComponent, StepConfig} from './stepper.component';
import {StepperStepDirective} from './stepper-step.directive';

@Component({
    standalone: true,
    imports: [StepperControlComponent, StepperStepDirective, ReactiveFormsModule],
    template: `
        <app-stepper-control
            [steps]="steps()"
            [formControl]="stepControl">
            <ng-template appStepperStep [step]="0">
                <div class="step-1-content">Step 1 Content</div>
            </ng-template>
            <ng-template appStepperStep [step]="1">
                <div class="step-2-content">Step 2 Content</div>
            </ng-template>
            <ng-template appStepperStep [step]="2">
                <div class="step-3-content">Step 3 Content</div>
            </ng-template>
        </app-stepper-control>
    `
})
class TestHostComponent {
    steps = signal<StepConfig[]>([
        {value: 0, label: 'Step 1'},
        {value: 1, label: 'Step 2'},
        {value: 2, label: 'Step 3'}
    ]);
    stepControl = new FormControl(0);
}

describe('StepperControlComponent', () => {
    let component: StepperControlComponent;
    let fixture: ComponentFixture<StepperControlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepperControlComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepperControlComponent);
        component = fixture.componentInstance;

        // Set required input
        fixture.componentRef.setInput('steps', [
            {value: 0, label: 'Step 1'},
            {value: 1, label: 'Step 2'},
            {value: 2, label: 'Step 3'}
        ]);

        fixture.detectChanges();
    });

    it('marks touched on leaving the control but not while moving within it', () => {
        const touched = jest.fn();
        component.registerOnTouched(touched);
        const inside = fixture.nativeElement.querySelector('button');
        inside.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget: inside}));
        expect(touched).not.toHaveBeenCalled();
        inside.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
        expect(touched).toHaveBeenCalledTimes(1);
    });

    it('does not finish before the last step or while disabled', () => {
        const complete = jest.fn();
        component.complete.subscribe(complete);
        component.onFinish();
        expect(complete).not.toHaveBeenCalled();
        component.goToStep(2);
        component.setDisabledState(true);
        component.onFinish();
        expect(complete).not.toHaveBeenCalled();
        component.setDisabledState(false);
        component.onFinish();
        expect(complete).toHaveBeenCalledTimes(1);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial active step of 0', () => {
        expect(component.activeStep()).toBe(0);
    });

    it.each([false, true])('defaults to the first enabled step (first disabled: %s) without emitting form changes', firstDisabled => {
        const changed = jest.fn();
        const stepChanged = jest.fn();
        component.registerOnChange(changed);
        component.stepChange.subscribe(stepChanged);
        fixture.componentRef.setInput('steps', [
            {value: 1, label: 'First', disabled: firstDisabled},
            {value: 2, label: 'Second'},
        ]);
        fixture.detectChanges();
        expect(component.activeStep()).toBe(firstDisabled ? 2 : 1);
        expect(changed).not.toHaveBeenCalled();
        expect(stepChanged).not.toHaveBeenCalled();
    });

    it('follows late lists while unset, preserves explicit selections and restores the default on reset', () => {
        fixture.componentRef.setInput('steps', []);
        component.writeValue(undefined);
        fixture.detectChanges();
        expect(component.activeStep()).toBe(0);
        fixture.componentRef.setInput('steps', [{value: 1, label: 'First'}, {value: 0, label: 'Zero'}]);
        fixture.detectChanges();
        expect(component.activeStep()).toBe(1);
        component.writeValue(0);
        expect(component.activeStep()).toBe(0);
        fixture.componentRef.setInput('steps', [{value: 2, label: 'Second'}, {value: 0, label: 'Zero'}]);
        fixture.detectChanges();
        expect(component.activeStep()).toBe(0);
        component.writeValue(null);
        expect(component.activeStep()).toBe(2);
        component.goToStep(0);
        fixture.componentRef.setInput('steps', [{value: 3, label: 'Third'}, {value: 0, label: 'Zero'}]);
        fixture.detectChanges();
        expect(component.activeStep()).toBe(0);
        component.writeValue(3);
        expect(component.activeStep()).toBe(3);
    });

    it('preserves the synchronous WritableSignal API and explicit writes equal to the default', () => {
        const activeStep: WritableSignal<number> = component.activeStep;
        const readonlyStep = activeStep.asReadonly();
        expect(isWritableSignal(activeStep)).toBe(true);
        expect(isWritableSignal(readonlyStep)).toBe(false);
        activeStep.set(0);
        fixture.componentRef.setInput('steps', [{value: 1, label: 'First'}, {value: 0, label: 'Zero'}]);
        expect(readonlyStep()).toBe(0);
        activeStep.update(value => value + 1);
        expect(activeStep()).toBe(1);
        expect(readonlyStep()).toBe(1);
        component.writeValue(null);
        activeStep.update(value => value);
        fixture.componentRef.setInput('steps', [{value: 2, label: 'Second'}, {value: 1, label: 'First'}]);
        expect(readonlyStep()).toBe(1);
        component.writeValue(undefined);
        expect(activeStep()).toBe(2);
    });

    it('should navigate to next step', () => {
        component.nextStep();
        expect(component.activeStep()).toBe(1);
    });

    it('should navigate to previous step', () => {
        component.goToStep(2);
        component.previousStep();
        expect(component.activeStep()).toBe(1);
    });

    it('should identify first step correctly', () => {
        expect(component.isFirstStep()).toBe(true);
        component.nextStep();
        expect(component.isFirstStep()).toBe(false);
    });

    it('should identify last step correctly', () => {
        expect(component.isLastStep()).toBe(false);
        component.goToStep(2);
        expect(component.isLastStep()).toBe(true);
    });

    it('should emit stepChange event when navigating', () => {
        const stepChangeSpy = jest.spyOn(component.stepChange, 'emit');
        component.goToStep(1);
        expect(stepChangeSpy).toHaveBeenCalledWith({
            previousStep: 0,
            currentStep: 1,
            step: {value: 1, label: 'Step 2'}
        });
    });

    it('should emit complete event on finish', () => {
        const completeSpy = jest.spyOn(component.complete, 'emit');
        component.goToStep(2);
        component.onFinish();
        expect(completeSpy).toHaveBeenCalled();
    });

    it('should implement ControlValueAccessor writeValue', () => {
        component.writeValue(2);
        expect(component.activeStep()).toBe(2);
    });

    it('should implement ControlValueAccessor setDisabledState', () => {
        component.setDisabledState(true);
        expect(component.isDisabled()).toBe(true);
    });

    it('should not navigate when disabled', () => {
        component.setDisabledState(true);
        component.goToStep(1);
        expect(component.activeStep()).toBe(0);
    });

    it('should not navigate to disabled step', () => {
        fixture.componentRef.setInput('steps', [
            {value: 0, label: 'Step 1'},
            {value: 1, label: 'Step 2', disabled: true},
            {value: 2, label: 'Step 3'}
        ]);
        fixture.detectChanges();

        component.goToStep(1);
        expect(component.activeStep()).toBe(0);
    });

    describe('linear mode', () => {
        beforeEach(() => {
            fixture.componentRef.setInput('linear', true);
            fixture.detectChanges();
        });

        it('should prevent skipping steps in linear mode', () => {
            component.goToStep(2);
            expect(component.activeStep()).toBe(0);
        });

        it('should allow going to next step in linear mode', () => {
            component.goToStep(1);
            expect(component.activeStep()).toBe(1);
        });

        it('should allow going back in linear mode', () => {
            component.goToStep(1);
            component.goToStep(0);
            expect(component.activeStep()).toBe(0);
        });
    });
});

describe('StepperControlComponent with host', () => {
    let hostComponent: TestHostComponent;
    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent]
        }).compileComponents();

        hostFixture = TestBed.createComponent(TestHostComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();
    });

    it('should work with reactive forms', () => {
        expect(hostComponent.stepControl.value).toBe(0);
    });

    it('opens the first available panel after a form reset without writing a default into the form', async () => {
        hostComponent.steps.set([{value: 1, label: 'First', disabled: true}, {value: 2, label: 'Second'}]);
        hostComponent.stepControl.reset();
        hostFixture.detectChanges();
        await hostFixture.whenStable();
        hostFixture.detectChanges();
        expect(hostFixture.nativeElement.querySelector('.step-3-content')).toBeTruthy();
        expect(hostComponent.stepControl.value).toBeNull();
    });
});
