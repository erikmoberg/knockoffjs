export class NullishGuard {
    static guard(value: any, name: string) {
        if (typeof(value) === 'undefined' || value === null) {
            throw new Error(`${name} is null or undefined.`);
        }
    }
}
