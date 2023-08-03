/* eslint-disable arrow-body-style */
import { flow, pipe } from 'fp-ts/function';
import * as L from 'monocle-ts/Lens';
import type { FieldMap } from '../types/FieldMap';
import type { FieldMeta } from '../types/FieldMeta';
import type { FieldPath } from '../types/FieldPath';
import type { FormMeta } from '../types/FormMeta';
import type { FormState } from '../types/FormState';

export function formMeta<TData, TError>(): L.Lens<FormState<TData, TError>, FormMeta> {
    const form = L.id<FormState<TData, TError>>();
    return pipe(form, L.prop('meta'));
}

export function formChanged<TData, TError>(): L.Lens<FormState<TData, TError>, boolean> {
    return pipe(formMeta<TData, TError>(), L.prop('changed'));
}

export function formTouched<TData, TError>(): L.Lens<FormState<TData, TError>, boolean> {
    return pipe(formMeta<TData, TError>(), L.prop('touched'));
}

export function formSubmitted<TData, TError>(): L.Lens<FormState<TData, TError>, boolean> {
    return pipe(formMeta<TData, TError>(), L.prop('submitted'));
}

export function formSubmitting<TData, TError>(): L.Lens<FormState<TData, TError>, boolean> {
    return pipe(formMeta<TData, TError>(), L.prop('submitting'));
}

export function formValidating<TData, TError>(): L.Lens<FormState<TData, TError>, boolean> {
    return pipe(formMeta<TData, TError>(), L.prop('validating'));
}

export function formValues<TData, TError>(): L.Lens<FormState<TData, TError>, TData> {
    const form = L.id<FormState<TData, TError>>();
    return pipe(form, L.prop('values'));
}

export function formErrors<TData, TError>(): L.Lens<FormState<TData, TError>, FieldMap<TError>> {
    const form = L.id<FormState<TData, TError>>();
    return pipe(form, L.prop('errors'));
}

export function fieldMeta<TData, TError, TValue>(
    field: FieldPath<TData, TError, TValue>,
): L.Lens<FormState<TData, TError>, FieldMeta> {
    return L.lens(
        (state) => state.fields[field.path] ?? DEFAULT_FIELD_META,
        (value) => (state) => {
            const form = L.id<FormState<TData, TError>>();
            return pipe(
                form,
                L.prop('fields'),
                L.prop(field.path),
                L.modify(() => value),
            )(state);
        },
    );
}

export function fieldValidating<TData, TError, TValue>(
    field: FieldPath<TData, TError, TValue>,
): L.Lens<FormState<TData, TError>, boolean> {
    return L.lens(
        (state) => {
            return pipe(
                fieldMeta(field),
                L.prop('validating'),
            ).get(state);
        },
        (validating) => (state) => {
            return flow(
                pipe(
                    formValidating<TData, TError>(),
                    L.modify((prev) => prev || validating),
                ),
                pipe(
                    fieldMeta(field),
                    L.prop('validating'),
                    L.modify(() => validating),
                ),
            )(state);
        },
    );
}

export function fieldTouched<TData, TError, TValue>(
    field: FieldPath<TData, TError, TValue>,
): L.Lens<FormState<TData, TError>, boolean> {
    return L.lens(
        (state) => {
            return pipe(
                fieldMeta(field),
                L.prop('touched'),
            ).get(state);
        },
        (touched) => (state) => {
            return flow(
                pipe(
                    formTouched<TData, TError>(),
                    L.modify((prev) => prev || touched),
                ),
                pipe(
                    fieldMeta(field),
                    L.prop('touched'),
                    L.modify(() => touched),
                ),
            )(state);
        },
    );
}

export function fieldChanged<TData, TError, TValue>(
    field: FieldPath<TData, TError, TValue>,
): L.Lens<FormState<TData, TError>, boolean> {
    return L.lens(
        (state) => {
            return pipe(
                fieldMeta(field),
                L.prop('changed'),
            ).get(state);
        },
        (changed) => (state) => {
            return flow(
                pipe(
                    formChanged<TData, TError>(),
                    L.modify((prev) => prev || changed),
                ),
                pipe(
                    fieldMeta(field),
                    L.prop('changed'),
                    L.modify(() => changed),
                ),
            )(state);
        },
    );
}

export function fieldValue<TData, TError, TValue>(
    field: FieldPath<TData, TError, TValue>,
): L.Lens<FormState<TData, TError>, TValue> {
    return L.lens(
        (state) => field.lens.get(state.values),
        (value) => (state) => {
            const prevValue = field.lens.get(state.values);
            if (prevValue === value) {
                return state;
            }

            return flow(
                pipe(
                    formChanged<TData, TError>(),
                    L.modify(() => true),
                ),
                pipe(
                    formValues<TData, TError>(),
                    L.compose(field.lens),
                    L.modify(() => value),
                ),
                pipe(
                    fieldMeta(field),
                    L.prop('changed'),
                    L.modify(() => true),
                ),
            )(state);
        },
    );
}

export function fieldError<TData, TError, TValue>(
    field: FieldPath<TData, TError, TValue>,
): L.Lens<FormState<TData, TError>, TError | undefined> {
    return L.lens(
        (state) => state.errors[field.path],
        (error) => (state) => {
            return pipe(
                formErrors<TData, TError>(),
                L.prop(field.path),
                L.modify(() => error),
            )(state);
        },
    );
}

const DEFAULT_FIELD_META: FieldMeta = {
    changed: false,
    touched: false,
    validating: false,
};
