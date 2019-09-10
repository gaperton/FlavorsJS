import { Mixin } from "./decorators";
export declare function join<A, B>(a: Mixin<A>, b: Mixin<B>): new () => A & B;
export declare function join<A, B, C>(a: Mixin<A>, b: Mixin<B>, c: Mixin<C>): new () => A & B & C;
export declare function join<A, B, C, D>(a: Mixin<A>, b: Mixin<B>, c: Mixin<C>, d: Mixin<D>): new () => A & B & C & D;
export declare function join<A, B, C, D, E>(a: Mixin<A>, b: Mixin<B>, c: Mixin<C>, d: Mixin<D>, e: Mixin<E>): new () => A & B & C & D & E;
export declare function join<A, B, C, D, E, F>(a: Mixin<A>, b: Mixin<B>, c: Mixin<C>, d: Mixin<D>, e: Mixin<E>, f: Mixin<F>): new () => A & B & C & D & E & F;
//# sourceMappingURL=join.d.ts.map