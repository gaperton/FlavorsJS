import { Combination, Combinations, getAllMixtures, getMixture, mergeMixture, mixMethod, sealMethod, unfoldMixins, cloneAllMixtures, superMixins } from './mixture';
import { callNextMethod, applyNextMethod } from './combinations';

function getMethodMixture( proto, mixtures, name ){
    const cached = mixtures[ name ];
    if( cached ) return cached;

    // Method is primary. Register it.
    const mixture = getMixture( mixtures, name );
    mixMethod( mixture, Combinations.PRIMARY, proto[ name ] );
    return mixture;
}


export type Mixin<T> = ( new () => T ) | ( abstract new () => T ) | T

// Class decorator @mixins( A, B, ... )
export function mixins<A>( a : Mixin<A> ) : ClassDecorator
export function mixins<A, B>( a : Mixin<A>, b : Mixin<B> ) : ClassDecorator
export function mixins<A, B, C>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C> ) : ClassDecorator
export function mixins<A, B, C, D>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D> ) : ClassDecorator
export function mixins<A, B, C, D, E>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E> ) : ClassDecorator
export function mixins<A, B, C, D, E, F>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E>, f : Mixin<F> ) : ClassDecorator
export function mixins( ...Mixins : Mixin<any>[] ){
    return Target => {
        const baseProto = Object.getPrototypeOf( Target.prototype );
        
        baseProto === Object.prototype || Mixins.unshift( baseProto );
        
        mergeMixinsToProto( Target.prototype, Mixins );
    }
}

function mergeMixinsToProto( target : any, Mixins : Mixin<any>[] ){
    const targetMixtures = cloneAllMixtures( target );

    // Create flattened list of all unique mixins.
    const appliedMixins = unfoldMixins( target, Mixins );

    for( let source of appliedMixins.reverse() ){
        sealMixins( source );

        const sourceMixtures = getAllMixtures( source );

        const descriptors = Object.getOwnPropertyDescriptors( source );
        for( let name of Object.keys( descriptors ) ){
            const desc = descriptors[name];
            
            if( typeof desc.value === 'function' && name !== 'constructor' ){
                const targetMixture = getMethodMixture( target, targetMixtures, name ),
                        sourceMixture = getMethodMixture( source, sourceMixtures, name );

                mergeMixture( targetMixture, sourceMixture );
                target[ name ] = sealMethod( targetMixture );
            }   
        }
    }
}

export function mixin( Class : new ( ...args ) => any ){
    sealMixins( Class.prototype );
}

mixin.extends = mixins;

mixin.super = superMixins;
mixin.nextAround = callNextMethod;
mixin.applyNextAround = applyNextMethod;

function sealMixins( proto ){
    if( proto !== Object.prototype && !proto.hasOwnProperty( '__appliedMixins__' )){
        const baseProto = Object.getPrototypeOf( proto );
        
        if( baseProto !== Object.prototype ){
            sealMixins( baseProto );
            mergeMixinsToProto( proto, [ baseProto ] );    
        }
    }
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
    
function methodDecorator( combination : Combination )
{
    function decorator( object, name? : string, desc? : PropertyDescriptor ){
        const mixtures = getAllMixtures( object ),
            mixture = getMixture( mixtures, name );

        mixMethod( mixture, combination, desc.value );
        desc.value = sealMethod( mixture );
        return desc;
    }

    decorator.do = aspectDecorator( combination );

    return decorator;
}

export const after = methodDecorator( Combinations.AFTER );
export const before = methodDecorator( Combinations.BEFORE );
export const around = methodDecorator( Combinations.AROUND );
