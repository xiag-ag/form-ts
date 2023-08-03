import { FormController, FormMeta } from '@form-ts/core';
import { useEffect, useRef } from 'react';
import { FormConfig } from '../types/FormConfig';

export function useForm<TData, TError>(
    name: string,
    config: FormConfig<TData, TError>,
): FormController<TData, TError> {
    const controller = useRef(new FormController(name, {
        meta: DEFAULT_FORM_META,
        fields: {},
        values: config.initialValues,
        errors: config.initialErrors ?? {},
    }));

    const prevName = useRef(name);
    const prevInit = useRef(config.initialValues);

    if (
        prevName.current !== name ||
        prevInit.current !== config.initialValues
    ) {
        if (config.reinitialize === true) {
            controller.current.destroy();
            controller.current = new FormController(name, {
                meta: DEFAULT_FORM_META,
                fields: {},
                values: config.initialValues,
                errors: config.initialErrors ?? {},
            });
        }

        prevName.current = name;
        prevInit.current = config.initialValues;
    }

    useEffect(() => () => controller.current.destroy(), []);
    return controller.current;
}

const DEFAULT_FORM_META: FormMeta = {
    changed: false,
    touched: false,

    submitted: false,
    submitting: false,
    validating: false,
};
