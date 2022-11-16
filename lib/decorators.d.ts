import { superMixins } from './mixture';
import { callNextMethod, applyNextMethod } from './combinations';
export declare type Mixin<T> = (new () => T) | (abstract new () => T) | T;
export declare function mixins<A>(a: Mixin<A>): ClassDecorator;
export declare function mixins<A, B>(a: Mixin<A>, b: Mixin<B>): ClassDecorator;
export declare function mixins<A, B, C>(a: Mixin<A>, b: Mixin<B>, c: Mixin<C>): ClassDecorator;
export declare function mixins<A, B, C, D>(a: Mixin<A>, b: Mixin<B>, c: Mixin<C>, d: Mixin<D>): ClassDecorator;
export declare function mixins<A, B, C, D, E>(a: Mixin<A>, b: Mixin<B>, c: Mixin<C>, d: Mixin<D>, e: Mixin<E>): ClassDecorator;
export declare function mixins<A, B, C, D, E, F>(a: Mixin<A>, b: Mixin<B>, c: Mixin<C>, d: Mixin<D>, e: Mixin<E>, f: Mixin<F>): ClassDecorator;
export declare function mixin(Class: new (...args: any[]) => any): void;
export declare namespace mixin {
    var _a: typeof mixins;
    var _b: typeof superMixins;
    export var nextAround: typeof callNextMethod;
    export var applyNextAround: typeof applyNextMethod;
    export { _a as extends, _b as super };
}
export declare const after: {
    (object: any, name?: string, desc?: PropertyDescriptor): PropertyDescriptor;
    do: (fun: Function) => (proto: object, name: string, desc: PropertyDescriptor) => PropertyDescriptor;
};
export declare const before: {
    (object: any, name?: string, desc?: PropertyDescriptor): PropertyDescriptor;
    do: (fun: Function) => (proto: object, name: string, desc: PropertyDescriptor) => PropertyDescriptor;
};
export declare const around: {
    (object: any, name?: string, desc?: PropertyDescriptor): PropertyDescriptor;
    do: (fun: Function) => (proto: object, name: string, desc: PropertyDescriptor) => PropertyDescriptor;
};
//# sourceMappingURL=decorators.d.ts.map