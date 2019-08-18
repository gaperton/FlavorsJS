import { registerCombination, dummyPrimaryMethod } from './mixture'

registerCombination( 'PRIMARY',
    ( prev, next ) => next !== dummyPrimaryMethod ? next : prev,
    ( empty, primary ) => primary || empty
);

registerCombination( 'AROUND',
    ( prev, next ) =>
        function( ...args ){
            const prevContext = context;
            context = [ this, prev, args ];

            const res = next.apply( this, args );
            
            context = prevContext;

            return res;
        }
);

type CallContext = [ any, Function, any[] ];
let context : CallContext;

// Apply the next method in `@around` chain with a given arguments.
export function callNextMethod( ...args ){
    const [ self, method ] = context;
    return method.apply( self, args );
}

// Apply the next method in `@around` chain with the original arguments.
export function applyNextMethod(){
    const [ self, method, args ] = context;
    return method.apply( self, args );
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