
export function getAllMixtures( proto ) : MethodsMixtures {
    return proto.__mixtures__ || ( proto.__mixtures__ = {} );
}

export function canApplyMixin( target, source ){
    const appliedMixins = target.__appliedMixins__ || ( target.__appliedMixins__ = [] ),
        notApplied = appliedMixins.indexOf( source ) < 0;

    if( notApplied ) appliedMixins.push( source );

    return notApplied;
}

type MethodsMixtures = {
    [ methodName : string ] : Mixture
}

/**
 * Mixture of methods for the particular class method.
 * Represent the result of the mixins merge before it's sealed,
 * to be used in the subsequent merges.
 */
type Mixture = Function[];

export function getMixture( mixtures : MethodsMixtures, methodName : string ) : Mixture {
    return mixtures[ methodName ] || ( mixtures[ methodName ] = createMixture() );
}

// How we mix methods from other classes to create the items in Mixture.
export type Mixer = ( next : Function, prev : Function ) => Function

// How to seal mixture elements to produce the final method implemention.
export type Sealer = ( method : Function, combination : Function ) => Function

// Internal registry of mixes and sealers
const mixers : Mixer[] = [],
    sealers : Sealer[] = [];

export function createMixture() : Mixture {
    return Array( mixers.length );
}
    
export const Combinations : { [ key : string ] : Combination } = {};
export type Combination = number;


// Add new combination
export function registerCombination( name : string, mixer : Mixer, sealer : Sealer = mixer ){
    mixers.push( mixer );
    sealers.push( sealer );
    Combinations[ name ] = mixers.length - 1;
}

/**
 * Mix method into the given mixture using the given combination.
 * @param mixture 
 * @param combination 
 * @param method 
 */
export function mixMethod( mixture : Mixture, combination : Combination, method : Function ){
    const targetMethod = mixture[ combination ];

    mixture[ combination ] = targetMethod ?
        mixers[ combination ]( method, targetMethod ) :
        method;
}

// Merge one mixture into another.
export function mergeMixture( target : Mixture, source : Mixture ){
    for( let i = 0; i < source.length; i++ ){
        if( source[ i ] ){
            mixMethod( target, i, source[ i ]);
        }
    }
}

export const dummyPrimaryMethod = () => {}

/**
 * Create the merged method for the target class.
 */
export function sealMethod( mixture : Mixture ){
    let method : Function = dummyPrimaryMethod;

    for( let i = 0; i < mixture.length; i++ ){
        if( mixture[ i ] ){
            method = sealers[ i ]( method, mixture[ i ] );
        }
    }

    return method;
}
