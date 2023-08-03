import { FieldMeta } from '@form-ts/core';

export type FieldState<TValue, TError> = {
    readonly meta: FieldMeta;
    readonly value: TValue;
    readonly error: TError | undefined;
};
