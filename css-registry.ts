export class CssRegistry {
    static registrations = {};
    
    static register(key, style) {
        this.registrations[key] = style;
    }
    
    static get(key) : string {
        return this.registrations[key];
    }
}