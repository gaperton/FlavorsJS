import { applyNextMethod } from './index'

export class TestMixin {
    sequence : any[]
    
    hasSequence( arr ){
        expect( this.sequence ).toEqual( arr );
        return this;
    }

    cleanup(){
        this.sequence = [];
        return this;
    }
}

export function testSequence( label ){
    return function(){
        this.sequence = ( this.sequence || [] ).concat([ label ]);
    }
}

export function testAround( label ){
    return function(){
        this.sequence = ( this.sequence || [] ).concat([ label ]);

        const next = applyNextMethod(),
             arr = Array.isArray( next ) ? next : [ next ];
        return [ label, ...arr ];
    }
}