export type FormMeta = {
    readonly changed: boolean;
    readonly touched: boolean;

    readonly submitted: boolean;
    readonly submitting: boolean;
    readonly validating: boolean;
};
