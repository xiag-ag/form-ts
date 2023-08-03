import { FormState } from './FormState';

export type FormSubscriber<TData, TError> = {
    (prevState: FormState<TData, TError>): void;
};
