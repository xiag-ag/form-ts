import * as L from 'monocle-ts/Lens';
import {
    formChanged,
    formErrors,
    formMeta,
    formSubmitted,
    formSubmitting,
    formTouched,
    formValidating,
    formValues,
} from '../utils/lenses';
import type { FieldMap } from './FieldMap';
import { FieldPath } from './FieldPath';
import type { FormMeta } from './FormMeta';
import type { FormMiddleware } from './FormMiddleware';
import type { FormState } from './FormState';
import type { FormSubscriber } from './FormSubscriber';
import type { FormUnsubscribe } from './FormUnsubscribe';

export class FormController<TData, TError> {
    public readonly field = new FieldPath<TData, TError, TData>('', this, L.id());

    public readonly meta: L.Lens<FormState<TData, TError>, FormMeta> = formMeta();
    public readonly values: L.Lens<FormState<TData, TError>, TData> = formValues<TData, TError>();
    public readonly errors: L.Lens<FormState<TData, TError>, FieldMap<TError>> = formErrors<TData, TError>();

    public readonly touched: L.Lens<FormState<TData, TError>, boolean> = formTouched<TData, TError>();
    public readonly changed: L.Lens<FormState<TData, TError>, boolean> = formChanged<TData, TError>();
    public readonly submitted: L.Lens<FormState<TData, TError>, boolean> = formSubmitted<TData, TError>();
    public readonly submitting: L.Lens<FormState<TData, TError>, boolean> = formSubmitting<TData, TError>();
    public readonly validating: L.Lens<FormState<TData, TError>, boolean> = formValidating<TData, TError>();

    private current: FormState<TData, TError>;
    private initial: FormState<TData, TError>;

    private readonly subscribers: Set<FormSubscriber<TData, TError>> = new Set();
    private readonly middlewares: Set<FormMiddleware<TData, TError>> = new Set();

    public constructor(
        public readonly name: string,
        initialState: FormState<TData, TError>,
    ) {
        this.initial = initialState;
        this.current = this.initial;
    }

    public get initialState(): FormState<TData, TError> {
        return this.initial;
    }

    public get currentState(): FormState<TData, TError> {
        return this.current;
    }

    public change(state: FormState<TData, TError>): void {
        if (state === this.current) {
            return;
        }

        const nextState = [...this.middlewares].reduce((next, handler) => handler(next), state);
        if (nextState === this.current) {
            return;
        }

        const prevState = this.current;
        this.current = nextState;
        this.subscribers.forEach((cb) => cb(prevState));
    }

    public reset(state: FormState<TData, TError>): void {
        if (this.current === state) {
            return;
        }

        const prevState = this.current;
        this.initial = state;
        this.current = state;
        this.subscribers.forEach((cb) => cb(prevState));
    }

    public subscribe(handler: FormSubscriber<TData, TError>): FormUnsubscribe {
        this.subscribers.add(handler);

        return () => {
            this.subscribers.delete(handler);
        };
    }

    public middleware(handler: FormMiddleware<TData, TError>): FormUnsubscribe {
        this.middlewares.add(handler);

        return () => {
            this.middlewares.delete(handler);
        };
    }

    public destroy(): void {
        this.subscribers.clear();
        this.middlewares.clear();
    }
}
