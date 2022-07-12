import { NullishGuard } from './nullish-guard.js';
export class ServiceLocator {
    static register(key, factory) {
        this.registrations[key] = factory;
    }
    static resolve(key) {
        const factory = this.registrations[key];
        NullishGuard.guard(factory, key);
        return factory();
    }
}
ServiceLocator.registrations = {};
//# sourceMappingURL=service-locator.js.map