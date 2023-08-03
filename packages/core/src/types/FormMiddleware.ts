import { FormState } from './FormState';

export type FormMiddleware<TData, TError> = {
    (nextState: FormState<TData, TError>): FormState<TData, TError>;
};
