import { Combination, Combinations, getAllMixtures, getMixture, mergeMixture, mixMethod, sealMethod, unfoldMixins, cloneAllMixtures } from './mixture';

function getMethodMixture( proto, mixtures, name ){
    const cached = mixtures[ name ];
    if( cached ) return cached;

    // Method is primary. Register it.
    const mixture = getMixture( mixtures, name );
    mixMethod( mixture, Combinations.PRIMARY, proto[ name ] );
    return mixture;
}


export type Mixin<T> = ( new () => T ) | T

// Class decorator @mixins( A, B, ... )
export function mixins<A>( a : Mixin<A> ) : ClassDecorator
export function mixins<A, B>( a : Mixin<A>, b : Mixin<B> ) : ClassDecorator
export function mixins<A, B, C>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C> ) : ClassDecorator
export function mixins<A, B, C, D>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D> ) : ClassDecorator
export function mixins<A, B, C, D, E>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E> ) : ClassDecorator
export function mixins<A, B, C, D, E, F>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E>, f : Mixin<F> ) : ClassDecorator
export function mixins( ...Mixins : Mixin<any>[] ){
    return Target => {
        const target = Target.prototype,
            targetMixtures = cloneAllMixtures( target );

        // Create flattened list of all unique mixins.
        const appliedMixins = unfoldMixins( target, Mixins );
        
        for( let source of appliedMixins.reverse() ){
            const sourceMixtures = getAllMixtures( source );

            for( let name of Object.keys( source ) ){
                const desc = getPropertyDescriptor( source, name );
                
                if( typeof desc.value === 'function' && name !== 'constructor' ){
                    const targetMixture = getMethodMixture( target, targetMixtures, name ),
                            sourceMixture = getMethodMixture( source, sourceMixtures, name );

                    mergeMixture( targetMixture, sourceMixture );
                    target[ name ] = sealMethod( targetMixture );
                }   
            }
        }
    }
}

function getPropertyDescriptor( source : object, name : string ) : PropertyDescriptor {
    let desc;

    for( let proto = source; proto && !desc; proto = Object.getPrototypeOf( proto )){
        desc = Object.getOwnPropertyDescriptor( proto, name );
    }

    return desc;
}

// Chainable decorator is the decorator with function as parameter.
// @before( fun1 ) @before( fun2 ) method(){ ... }
// In this case the method itself is a primary method and must be registered so.
function aspectDecorator( combination : Combination ){
    return ( fun : Function ) =>
        ( proto : object, name : string, desc : PropertyDescriptor ) => {
            const mixtures = getAllMixtures( proto ),
                mixture = getMethodMixture( proto, mixtures, name );

            mixMethod( mixture, combination, fun );
            desc.value = sealMethod( mixture );

            return desc;    
        }
} 

export const doAfter = aspectDecorator( Combinations.AFTER );
export const doBefore = aspectDecorator( Combinations.BEFORE );
export const doAround = aspectDecorator( Combinations.AROUND );
    
function methodDecorator( combination : Combination )
{
    return ( object, name? : string, desc? : PropertyDescriptor ) => {
        const mixtures = getAllMixtures( object ),
            mixture = getMixture( mixtures, name );

        mixMethod( mixture, combination, desc.value );
        desc.value = sealMethod( mixture );
        return desc;
    }
}

export const after = methodDecorator( Combinations.AFTER );
export const before = methodDecorator( Combinations.BEFORE );
export const around = methodDecorator( Combinations.AROUND );
