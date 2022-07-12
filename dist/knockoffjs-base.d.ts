export declare abstract class KnockoffJsBase<T extends object> extends HTMLElement {
    constructor(model?: T);
    state: T;
    connectedCallback(): Promise<void>;
    abstract template(): string;
    abstract styles(): string;
    templateCache: Map<Node, string>;
    updateBindings(propName?: string, node?: ParentNode, context?: any, alias?: string): void;
    getBindingsFromValue(nodeValue: string): string[];
    processObjectBinding(alias: string, context: any, propertyName: string, process: (attributeName: string, bindingTarget: any) => void): void;
    private getBindingTarget;
}
