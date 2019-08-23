import { Combination, Combinations, getAllMixtures, getMixture, mergeMixture, mixMethod, sealMethod, unfoldMixins, cloneAllMixtures } from './mixture';

function getMethodMixture( proto, mixtures, name ){
    const cached = mixtures[ name ];
    if( cached ) return cached;

    // Method is primary. Register it.
    const mixture = getMixture( mixtures, name );
    mixMethod( mixture, Combinations.PRIMARY, proto[ name ] );
    return mixture;
}

// Class decorator @mixins( A, B, ... )
export function mixins( ...Mixins : Function[] ){
    return Target => {
        const target = Target.prototype,
            targetMixtures = cloneAllMixtures( target );

        // Create flattened list of all unique mixins.
        const appliedMixins = unfoldMixins( target, Mixins );
        
        for( let source of appliedMixins.reverse() ){
            // BUG: Need to disable cachinf of the pre-merged mixtures,
            // and traverse all the source mixins every time to solve diamond problem.
            // __appliedMixins_ must contain the whole graph of mixins.
            const sourceMixtures = getAllMixtures( source );

            for( let name of Object.getOwnPropertyNames( source ) ){
                const desc = Object.getOwnPropertyDescriptor( source, name );
                
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

export function mixin( Class : new ( ...args ) => any ){
    sealMixins( Class.prototype );
}

function sealMixins( proto ){
    if( proto !== Object.prototype ){
        const baseProto = Object.getPrototypeOf( proto );

        if( !baseProto.hasOwnProperty( '__appliedMixins__' ) ){
            sealMixins( baseProto );
        }

        const dec = mixins( baseProto );
        dec( proto.constructor );
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
