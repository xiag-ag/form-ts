import { FieldPath } from '@form-ts/core';
import { FieldState } from '../types/FieldState';
import { useFormWatch } from './useFormWatch';

export function useFormField<TData, TError, TValue>(
    field: FieldPath<TData, TError, TValue>,
): FieldState<TValue, TError> {
    const meta = useFormWatch(field.form, field.meta.get);
    const value = useFormWatch(field.form, field.value.get);
    const error = useFormWatch(field.form, field.error.get);

    return { meta, value, error };
}
