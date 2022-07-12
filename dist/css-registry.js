export class CssRegistry {
    static register(key, style) {
        this.registrations[key] = style;
    }
    static get(key) {
        return this.registrations[key];
    }
}
CssRegistry.registrations = {};
//# sourceMappingURL=css-registry.js.map