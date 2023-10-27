import { FormController, FormState } from '@form-ts/core';
import { useCallback, useSyncExternalStore } from 'react';

export function useFormWatch<TData, TError, TValue>(
    form: FormController<TData, TError>,
    selector: (state: FormState<TData, TError>) => TValue,
): TValue {
    const getter = useCallback(() => selector(form.currentState), [form, selector]);
    const subscribe = useCallback((cb: () => void) => form.subscribe(cb), [form]);
    return useSyncExternalStore(subscribe, getter);
}
