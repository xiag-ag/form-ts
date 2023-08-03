import { FieldMap } from '@form-ts/core';

export type FormConfig<TData, TError> = {
    readonly reinitialize?: boolean;
    readonly initialValues: TData;
    readonly initialErrors?: FieldMap<TError>;
};
