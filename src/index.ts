/**
 * - Class is a flavor
 * - No primary means empty function
 * 
 * PoC assumptions:
 * - No inheritance
 * - No complex combinations
 */

type Mixture = Function[];

// How we merge elements from other classes.
type Mixer = ( next : Function, prev : Function ) => Function

// How we produce the method in a target class.
type Sealer = ( method : Function, combination : Function ) => Function

const mixers = [],
    sealers = [],
    Combinations : any = {};

type Combination = number;

function addCombination( name : string, mixer : Mixer, sealer : Sealer ){
    mixers.push( mixer );
    sealers.push( sealer );
    Combinations[ name ] = mixers.length - 1;
}

addCombination( 'PRIMARY',
    ( next, prev ) => next,
    ( empty, primary ) => primary || empty
);

addCombination( 'AROUND',
    ( next, prev ) =>
        function(){
            const prevContext = context;
            context = [ this, prev ];

            const res = next.apply( this, arguments );
            
            context = prevContext;

            return res;
        }
    ,
    ( method, around ) => //TODO Same
        function( ...args ){
            const prevContext = context;
            context = [ this, method ];

            const res = around.apply( this, arguments );
            context = prevContext;
            return res;
        }
);

let context;

function callNextMethod(){
    return context[ 1 ].apply( context[ 0 ], arguments );
}

addCombination( 'BEFORE',
    ( next, prev ) =>
        function(){
            prev.apply( this, arguments );
            next.apply( this, arguments );
        }
    ,
    ( method, before ) =>
        function(){
            before.apply( this, arguments )
            return method.apply( this, arguments );
        }
);

addCombination( 'AFTER',
    ( next, prev ) =>
        function(){
            next.apply( this, arguments );
            prev.apply( this, arguments );
        }
    ,
    ( method, after ) =>
        function(){
            const result = method.apply( this, arguments );
            after.apply( this, arguments );
            return result;
        }
);

type MethodsMixtures = {
    [ methodName : string ] : Mixture
}

function getMixture( mixtures : MethodsMixtures, methodName : string ) : Mixture {
    return mixtures[ methodName ] || ( mixtures[ methodName ] = [ void 0, void 0, void 0, void 0 ] );
}

function mixMethod( mixture : Mixture, combination : Combination, method : Function ){
    const prev = mixture[ combination ];
    mixture[ combination ] = prev ?
        mixers[ combination ]( method, prev ) :
        method;
}

function mergeMixture( target : Mixture, source : Mixture ){
    for( let i = 0; i < source.length; i++ ){
        if( source[ i ] ){
            mixMethod( target, i, source[ i ]);
        }
    }
}

function sealMethod( mixture : Mixture ){
    let method = emptyFunction;

    for( let i = 0; i < mixture.length; i++ ){
        method = sealers[ i ]( method, mixture[ i ] );
    }

    return method;
}

function emptyFunction(){}

// Class decorator @mixins( A, B, ... )
export function mixins( ...Mixins : Function[] ){
    //TODO: protection from merging the same mixin twice.

    return Target => {
        const target = Target.prototype,
            targetMixtures = getClassMixtures( target );
        
        for( let Source of Mixins ){
            const source = Source.prototype,
                sourceMixtures = getClassMixtures( source );

            for( let name of Object.getOwnPropertyNames( source ) ){
                const desc = Object.getOwnPropertyDescriptor( source, name );
                
                if( typeof desc.value === 'function' && name !== 'constructor' ){
                    const targetExists = targetMixtures[ name ],
                        sourceExists = targetMixtures[ name ],
                        targetMixture = getMixture( targetMixtures, name ),
                        sourceMixture = getMixture( sourceMixtures, name );

                    // Make sure the original methods are recorded as primary.
                    targetExists || mixMethod( targetMixture, Combinations.primary, target[ name ] );
                    sourceExists || mixMethod( sourceMixture, Combinations.primary, source[ name ] );

                    mergeMixture( targetMixture, sourceMixture );
                    target[ name ] = sealMethod( targetMixture );
                }
            }
        }    
    }
}

function getClassMixtures( proto ) : MethodsMixtures {
    return proto.__mixtures__ || ( proto.__mixtures__ = {} );
}

const createDecorator = ( combination : Combination, fun : Function ) =>
    ( proto, name : string, desc : PropertyDescriptor ) => {
        const mixtures = getClassMixtures( proto ),
            exists = mixtures[ name ],
            mixture = getMixture( mixtures, name );

        // Method declared in the class is a primary method.
        exists || mixMethod( mixture, Combinations.primary, desc.value );

        mixMethod( mixture, combination, fun );
        desc.value = sealMethod( mixture );

        return desc;    
    }

function methodDecorator( combination : Combination ) : any
{
    return ( arg : Function | object, name? : string, desc? : PropertyDescriptor ) => {
        if( typeof arg === 'function' ){
            return createDecorator( combination, arg );
        }
        else{
            const mixtures = getClassMixtures( arg ),
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

class SimpleMixin {
    a(){ return 'SimpleMixin'; }
    b(){ return 'SimpleMixin'; }
    c(){ return 'SimpleMixin'; }
}

class ComplexMixin {
    @before
    a(){ return 'ComplexMixin'; }

    @after
    b(){ return 'ComplexMixin'; }

    @around
    c(){
        callNextMethod();
        return 'ComplexMixin';
    }
}

function anotherComplexMixin(){
    return "AnotherComplexMixin";
}

class AnotherComplexMixin {
    @before( anotherComplexMixin )
    a(){ return 'ComplexMixin'; }

    @after
    b(){ return 'ComplexMixin'; }

    @around
    c(){
        callNextMethod();
        return 'ComplexMixin';
    }
}

interface SimpleTarget extends SimpleMixin, ComplexMixin {}
@mixins( SimpleMixin, ComplexMixin )
class SimpleTarget {
    a(){ return 'SimpleTarget'; }
}