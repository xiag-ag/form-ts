import { FieldMap } from './FieldMap';
import { FieldMeta } from './FieldMeta';
import { FormMeta } from './FormMeta';

export type FormState<TData, TError> = {
    readonly meta: FormMeta;
    readonly values: TData;
    readonly errors: FieldMap<TError>;
    readonly fields: FieldMap<FieldMeta>;
};
