export declare abstract class KnockoffJsBase<T extends object> extends HTMLElement {
    constructor(model?: T);
    protected state: T;
    connectedCallback(): Promise<void>;
    abstract template(): string;
    abstract styles(): string;
    private templateCache;
    private updateBindings;
    private getBindingsFromValue;
    private processObjectBinding;
    private getBindingTarget;
}
