import { canApplyMixin, Combination, Combinations, getAllMixtures, getMixture, mergeMixture, mixMethod, sealMethod } from './mixture';

function getMethodMixture( proto, mixtures, name ){
    const cached = mixtures[ name ];
    if( cached ) return cached;

    // Method is primary. Register it.
    const mixture = getMixture( mixtures, name );
    mixMethod( mixture, Combinations.primary, proto[ name ] );
    return mixture;
}

// Class decorator @mixins( A, B, ... )
export function mixins( ...Mixins : Function[] ){
    return Target => {
        const target = Target.prototype,
            targetMixtures = getAllMixtures( target );
        
        for( let Source of Mixins ){
            const source = Source.prototype;

            if( canApplyMixin( target, source ) ){
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
}

// Chainable decorator is the decorator with function as parameter.
// @before( fun1 ) @before( fun2 ) method(){ ... }
// In this case the method itself is a primary method and must be registered so.
const chainableDecorator = ( combination : Combination, fun : Function ) =>
    ( proto : object, name : string, desc : PropertyDescriptor ) => {
        const mixtures = getAllMixtures( proto ),
            mixture = getMethodMixture( proto, mixtures, name );

        mixMethod( mixture, combination, fun );
        desc.value = sealMethod( mixture );

        return desc;    
    }

function methodDecorator( combination : Combination ) : any
{
    return ( arg : Function | object, name? : string, desc? : PropertyDescriptor ) => {
        if( typeof arg === 'function' ){
            return chainableDecorator( combination, arg );
        }
        else{
            const mixtures = getAllMixtures( arg ),
                mixture = getMixture( mixtures, name );

            mixMethod( mixture, combination, desc.value );
            desc.value = sealMethod( mixture );
            return desc;
        }
    }
}

export const after = methodDecorator( Combinations.after );
export const before = methodDecorator( Combinations.before );
export const around = methodDecorator( Combinations.around );
