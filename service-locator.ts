import { NullishGuard } from './nullish-guard.js';

export class ServiceLocator {
    static registrations = {};
    
    static register(key, factory) {
        this.registrations[key] = factory;
    }
    
    static resolve<T>(key) : T {
        const factory = this.registrations[key];
        NullishGuard.guard(factory, key);
        return factory();
    }
}