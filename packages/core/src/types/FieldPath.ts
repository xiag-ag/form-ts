import type { Predicate } from 'fp-ts/Predicate';
import type { Refinement } from 'fp-ts/Refinement';
import * as L from 'monocle-ts/Lens';
import clone from 'shallow-clone';
import { Memoize } from 'typescript-memoize';
import {
    fieldChanged,
    fieldError,
    fieldMeta,
    fieldTouched,
    fieldValidating,
    fieldValue,
} from '../utils/lenses';
import type { FieldMeta } from './FieldMeta';
import type { FormController } from './FormController';
import type { FormState } from './FormState';

export class FieldPath<TData, TError, TValue> {
    public readonly meta: L.Lens<FormState<TData, TError>, FieldMeta> = fieldMeta(this);
    public readonly value: L.Lens<FormState<TData, TError>, TValue> = fieldValue(this);
    public readonly error: L.Lens<FormState<TData, TError>, TError | undefined> = fieldError(this);

    public readonly touched: L.Lens<FormState<TData, TError>, boolean> = fieldTouched(this);
    public readonly changed: L.Lens<FormState<TData, TError>, boolean> = fieldChanged(this);
    public readonly validating: L.Lens<FormState<TData, TError>, boolean> = fieldValidating(this);

    public constructor(
        public readonly path: string,
        public readonly form: FormController<TData, TError>,
        public readonly lens: L.Lens<TData, TValue>,
    ) {
    }

    @Memoize()
    public at<Key extends keyof TValue>(key: Key): FieldPath<TData, TError, TValue[Key]> {
        const atKey = L.lens<TValue, TValue[Key]>(
            (state) => state[key],
            (value) => (state) => {
                if (state[key] === value) {
                    return state;
                }

                const copy = clone(state);
                copy[key] = value;
                return copy;
            },
        );

        return new FieldPath(
            this.path === '' ? String(key) : `${this.path}.${String(key)}`,
            this.form,
            L.compose(atKey)(this.lens),
        );
    }

    @Memoize()
    public transform<TOther>(transform: L.Lens<TValue, TOther>): FieldPath<TData, TError, TOther> {
        return new FieldPath(
            this.path,
            this.form,
            L.compose(transform)(this.lens),
        );
    }

    public guard<TOther extends TValue>(guard: Refinement<TValue, TOther>): FieldPath<TData, TError, TOther>;
    public guard(guard: Predicate<TValue>): FieldPath<TData, TError, TValue>;

    @Memoize()
    public guard<TOther extends TValue>(guard: Refinement<TValue, TOther>): FieldPath<TData, TError, TOther> {
        const transform = L.lens<TValue, TOther>(
            (value) => {
                if (!guard(value)) {
                    const msg = `Form field "${this.form.name}"/"${this.path}" should be assignable to ${guard.name}`;
                    throw new Error(msg);
                }

                return value;
            },
            (value) => () => value,
        );

        return this.transform(transform);
    }
}
