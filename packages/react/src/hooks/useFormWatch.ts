import { FormController, FormState } from '@form-ts/core';
import { useEffect, useState } from 'react';

export function useFormWatch<TData, TError, TValue>(
    form: FormController<TData, TError>,
    selector: (state: FormState<TData, TError>) => TValue,
): TValue {
    const [result, setResult] = useState(() => selector(form.currentState));

    useEffect(() => {
        setResult(selector(form.currentState));

        return form.subscribe(() => {
            setResult(selector(form.currentState));
        });
    }, [form, selector]);

    return result;
}
