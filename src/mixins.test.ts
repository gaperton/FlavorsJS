import { mixins, before, after, around, callNextMethod } from './index'

class SimpleMixin {
    a(){ return 'SimpleMixin'; }
    b(){ return 'SimpleMixin'; }
    c(){ return 'SimpleMixin'; }
}

class ComplexMixin {
    before : string[]
    after : string[]

    @before a() : string {
        this.before = ( this.before || [] ).concat([ 'ComplexMixin' ]);

        return void 0;
    }

    @after b() : string {
        this.after = ( this.after || [] ).concat([ 'ComplexMixin' ]);

        return void 0;
    }

    @around c(){
        return 'ComplexMixin' + ( callNextMethod() || '' );
    }
}

describe( 'mixins as standalone classes', () => {
    it( '@before, @after, and @around methods has empty body', () => {
        const s = new ComplexMixin();
        expect( s.a() ).toEqual( void 0 );
        expect( s.before ).toEqual( [ 'ComplexMixin'] );

        expect( s.b() ).toEqual( void 0 );
        expect( s.after ).toEqual( [ 'ComplexMixin'] );

        expect( s.c() ).toEqual( 'ComplexMixin' );
    });

    it( 'executes @before in a proper order', () => {
        class A {
            before : number[]
            
            @before test(){
                this.before.push( 1 )
            }
        }

        @mixins( A )
        class Test {
            before = [];
            
            @before( function(){ this.before.push( 2 ) })
            @before( function(){ this.before.push( 3 ) })
            test(){
                return 'test'
            }
        }

        const test = new Test();
        expect( test.test() ).toEqual( 'test' );
        expect( test.before ).toEqual( [ 1, 2, 3 ] );
    });

    it( 'executes @after in a reverse order', () => {
        class A {
            after : number[]
            
            @after test(){
                this.after.push( 1 )
            }
        }

        @mixins( A )
        class Test {
            after = [];
            
            @after( function(){ this.after.push( 2 ) })
            @after( function(){ this.after.push( 3 ) })
            test(){
                return 'test'
            }
        }

        const test = new Test();
        expect( test.test() ).toEqual( 'test' );
        expect( test.after ).toEqual( [ 3,2,1 ] );
    })

    it( 'executes @around in a proper order', () => {
        class A {
            count : number[]
            
            @around test(){
                this.count.push( 1 )
                return callNextMethod();
            }
        }

        @mixins( A )
        class Test {
            count = [];
            
            @around( function(){
                this.count.push( 2 )
                return callNextMethod()
            })
            @around( function(){
                this.count.push( 3 )
                return callNextMethod()
            })
            test(){
                return 'test'
            }
        }

        const test = new Test();
        expect( test.test() ).toEqual( 'test' );
        expect( test.count ).toEqual( [ 1, 2, 3 ] );
    })
});

describe( 'simple target', ()=>{    
    it( 'merges primary-only source', () => {
        interface Target extends SimpleMixin {}
        @mixins( SimpleMixin )
        class Target {
            b(){
                return 'Target';
            }
        }

        const t = new Target();

        expect( t.a() ).toEqual( 'SimpleMixin' );
        expect( t.b() ).toEqual( 'Target' );
        expect( t.c() ).toEqual( 'SimpleMixin' );
    });

    it( 'merges mixed-combination source', () => {
        interface Target extends ComplexMixin {}
        @mixins( ComplexMixin )
        class Target {
            a(){
                return 'Target';
            }

            b(){
                return 'Target';
            }

            c(){
                return 'Target';
            }
        }

        const t = new Target();

        expect( t.a() ).toEqual( 'Target' );
        expect( t.b() ).toEqual( 'Target' );
        expect( t.c() ).toEqual( 'ComplexMixinTarget' );

        expect( t.after ).toEqual( [ 'ComplexMixin' ] );
        expect( t.before ).toEqual( [ 'ComplexMixin' ] );
    });

    it( 'merges two sources to empty target', () => {
        interface Target extends SimpleMixin, ComplexMixin {}
        @mixins( SimpleMixin, ComplexMixin )
        class Target {
        }

        const t = new Target();

        expect( t.a() ).toEqual( 'SimpleMixin' );
        expect( t.b() ).toEqual( 'SimpleMixin' );
        expect( t.c() ).toEqual( 'ComplexMixinSimpleMixin' );
    });
});

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