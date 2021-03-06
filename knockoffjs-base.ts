import { Router } from "./router.js";

export abstract class KnockoffJsBase<T extends object> extends HTMLElement {
    constructor(model: T = null) {
        super();
        this.attachShadow({ mode: 'open' });

        const instance = this;
        let createOnChangeProxy = (target) => {
            return new Proxy(target, {
                get(obj, prop) {
                    const item = obj[prop];
                    if (item && typeof item === 'object') {
                        // create new proxy for nested object
                        return createOnChangeProxy(item);
                    }

                    return item
                },
                set(obj, prop, value) {
                    obj[prop] = value;
                    instance.updateBindings(prop as string);
                    return true;
                },
            });
        }

        // use state if set by parent component, otherwise initialize
        const stateObject = this.state === undefined ? model : this.state;
        if (stateObject !== null) {
            this.state = createOnChangeProxy(stateObject);
        }
    }

    protected state: T;

    async connectedCallback(): Promise<void> {
        this.shadowRoot.innerHTML = `<style>${this.styles()}</style>${this.template()}`;
        this.updateBindings();
    }

    abstract template(): string;

    abstract styles(): string;

    private templateCache = new Map<Node, string>();

    private updateBindings(propName: string = null, node: ParentNode = null, context: any = null, alias: string = null) {
        const nodes = (node ?? this.shadowRoot).querySelectorAll("[data-bind]");
        for (const n of nodes) {
            const nodeValue = n.attributes["data-bind"].nodeValue as string;
            const allBindings = this.getBindingsFromValue(nodeValue);
            for (const nodeValue of allBindings) {
                const binding = nodeValue.split(":")[0].trim();
                const propertyName = nodeValue.substring(binding.length + 1).trim();
                if (binding === "event") {
                    this.processObjectBinding(
                        alias, context, propertyName,
                        (eventName, bindingTarget) => {
                            if (context) {
                                n.addEventListener(eventName, (ev) => {
                                    bindingTarget(ev, context);
                                });
                            } else {
                                n.addEventListener(eventName, bindingTarget);
                            }
                        });

                } else if (binding === "foreach") {
                    let template = this.templateCache.get(n);
                    if (!template) {
                        template = n.innerHTML;
                        this.templateCache.set(n, template);
                    }

                    n.innerHTML = "";
                    const collection = propertyName.split("of")[1].trim();
                    const alias = propertyName.split("of")[0].trim();
                    for (const c of (this.state[collection] ?? [])) {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(template, 'text/html');
                        this.updateBindings(undefined, doc.body, c, alias);
                        n.append(...doc.body.childNodes);
                    }
                } else {
                    if (binding === "attr") {
                        this.processObjectBinding(
                            alias, context, propertyName,
                            (elementAttributeName, bindingTarget) => {
                                const value = bindingTarget instanceof Function ? bindingTarget(context) : bindingTarget;
                                if (value !== null) {
                                    n.setAttribute(elementAttributeName, value);
                                } else {
                                    n.removeAttribute(elementAttributeName);
                                }
                            });
                    } else {
                        const bindingTarget = this.getBindingTarget(alias, propertyName, context);
                        const value = bindingTarget instanceof Function ? bindingTarget(context) : bindingTarget;
                        const bindingPathParts = binding.split(".");
                        let targetProperty = n;
                        for (let i = 0; i < bindingPathParts.length - 1; i++) {
                            targetProperty = targetProperty[bindingPathParts[i]];
                        }

                        targetProperty[bindingPathParts[bindingPathParts.length - 1]] = value;
                    }
                }
            }
        }

        if (!node) {
            const allLinks = this.shadowRoot.querySelectorAll("a");
            allLinks.forEach(a => {
                const link = a as HTMLAnchorElement;
                if (a.pathname.startsWith("/")) {
                    link.addEventListener("click", Router.handleLinkClick);
                }
            });
        }
    }

    private getBindingsFromValue(nodeValue: string) {
        let nodeValueWithObjectsSeparatedBySemicolon = "";
        let inObject = false;
        for (let i = 0; i < nodeValue.length; i++) {
            if (nodeValue[i] == "{") {
                inObject = true;
            } else if (inObject && nodeValue[i] == ",") {
                nodeValueWithObjectsSeparatedBySemicolon += ";";
                continue;
            } else if (inObject && nodeValue[i] == "}") {
                inObject = false;
            }

            nodeValueWithObjectsSeparatedBySemicolon += nodeValue[i];
        }
        
        return nodeValueWithObjectsSeparatedBySemicolon.split(",").map(s => s.trim());
    }

    private processObjectBinding(
        alias: string,
        context: any,
        propertyName: string,
        process: (attributeName: string, bindingTarget: any) => void) {
        const events = propertyName.split(";");
        for (const eventObj of events) {
            const attributeName = eventObj.split(":")[0].replace("{", "").trim();
            const valueName = eventObj.split(":")[1].replace("}", "").trim();
            const bindingTarget = this.getBindingTarget(alias, valueName, context);
            if (bindingTarget !== null) {
                process(attributeName, bindingTarget);
            }
        }
    }

    private getBindingTarget(alias: string, propertyName: string, context: any) {
        if (alias === propertyName) {
            // Simple property, such as string, in a foreach binding
            return context;
        }

        var traverse = function (obj, propertyString) {
            let cur = obj;
            const keys = propertyString.split('.');
            for (const key of keys) {
                if (key.indexOf("?") === key.length - 1) {
                    cur = cur[key.substring(0, key.length - 1)];
                    if (cur === null || cur === undefined) {
                        return null;
                    }
                } else {
                    cur = cur[key];
                    if (cur === undefined) {
                        return undefined;
                    }
                }
            }

            return cur;
        };

        const cleanPropertyName = alias ? propertyName.replace(`${alias}.`, "") : propertyName;
        let bindingTarget = context ? traverse(context, cleanPropertyName) : traverse(this.state, cleanPropertyName);

        if (bindingTarget === undefined) {
            bindingTarget = this[cleanPropertyName];
        }

        return bindingTarget;
    }
}
