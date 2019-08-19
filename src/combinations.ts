import { registerCombination, dummyPrimaryMethod } from './mixture'

registerCombination( 'PRIMARY',
    ( prev, next ) => next !== dummyPrimaryMethod ? next : prev,
    ( empty, primary ) => primary || empty
);

registerCombination( 'AROUND',
    ( prev, next ) =>
        function( ...args ){
            const prevContext = aroundContext,
                self = this;

            const nextContext : any = [
                function callNext( args ){
                    aroundContext = prevContext;
                    const res = next.apply( self, args );
                    aroundContext = nextContext;
                    return res;
                },
                args
            ]
                
            aroundContext = nextContext;
            
            const res = prev.apply( this, args );
            
            aroundContext = prevContext;

            return res;
        },

    ( method, arounds ) =>
        function( ...args ){
            const prevContext = aroundContext,
                self = this;

            const nextContext : any = [
                function callNext( args ){
                    aroundContext = prevContext;
                    const res = method.apply( self, args );
                    aroundContext = nextContext;
                    return res;
                },
                args
            ]

            aroundContext = nextContext;

            const res = arounds.apply( this, args );
            
            aroundContext = prevContext;

            return res;
        }
);

let aroundContext : [ Function, object ];

// Apply the next method in `@around` chain with a given arguments.
export function callNextMethod( ...args ){
    return aroundContext[ 0 ]( args );
}

// Apply the next method in `@around` chain with the original arguments.
export function applyNextMethod(){
    return aroundContext[ 0 ]( aroundContext[ 1 ] );
}

registerCombination( 'BEFORE',
    ( prev, next ) =>
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

registerCombination( 'AFTER',
    ( prev, next ) =>
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