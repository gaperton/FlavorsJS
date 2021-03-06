import { mixins, Mixin } from "./decorators";
import { superMixins } from "./mixture";

export function join<A, B>( a : Mixin<A>, b : Mixin<B> ) : new () => A & B
export function join<A, B, C>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C> ) : new () => A & B & C
export function join<A, B, C, D>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D> ) : new () => A & B & C & D
export function join<A, B, C, D, E>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E> ) : new () => A & B & C & D & E
export function join<A, B, C, D, E, F>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E>, f : Mixin<F> ) : new () => A & B & C & D & E & F

/**
 * Create the class merging the list of mixins.
 */
export function join( First : new ( ...args ) => any, ...Mixins : any[] ) : any {
    @(mixins as any)( ...Mixins )
    class JoinedMixins extends First {
        constructor( ...args ){
            super( ...args );
            superMixins( this ); // Must not call the base class.
        }
    }

    return JoinedMixins;
}