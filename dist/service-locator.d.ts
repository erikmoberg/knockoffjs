export declare class ServiceLocator {
    static registrations: {};
    static register(key: any, factory: any): void;
    static resolve<T>(key: any): T;
}
