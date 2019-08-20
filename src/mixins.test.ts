import { mixins, before, after, doAfter, doAround, doBefore, around, callNextMethod } from './index'
import { applyNextMethod } from './combinations';
import { isMethod } from '@babel/types';
import { superMixins } from './mixture';

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

class TestMixin {
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

function testSequence( label ){
    return function(){
        this.sequence = ( this.sequence || [] ).concat([ label ]);
    }
}

function testAround( label ){
    return function(){
        this.sequence = ( this.sequence || [] ).concat([ label ]);

        const next = applyNextMethod(),
             arr = Array.isArray( next ) ? next : [ next ];
        return [ label, ...arr ];
    }
}

describe( 'mixins as standalone classes', () => {
    it( 'Default @before, @after, and @around methods has empty body', () => {
        class Test extends TestMixin {
            @after a(){
                testSequence( 1 ).call( this );
            }

            @before b(){
                testSequence( 2 ).call( this );
            }

            @around ar(){
                return testAround( 3 ).call( this );
            }
        }

        const s = new Test();
        expect( s.a() ).toEqual( void 0 );
        expect( s.b() ).toEqual( void 0 );
        expect( s.ar() ).toEqual( [ 3, undefined ] );

        s.hasSequence( [ 1, 2, 3 ] );
    });

    it( '@before and after are executed in order', () => {
        class Test extends TestMixin {
            @doAfter( testSequence( 8 ) )
            @doBefore( testSequence( 1 ) )
            @doAfter( testSequence( 7 ) )
            @doBefore( testSequence( 2 ) )
            @doAfter( testSequence( 6 ) )
            @doBefore( testSequence( 3 ) )

            @doAround( testAround( 4 ) )
            @doAround( testAround( 5 ) )

            test(){
                return "test";
            }
        }

        const test = new Test();
        expect( test.test() ).toEqual( [ 4, 5, "test" ] );
        test.hasSequence( [ 1, 2, 3, 4, 5, 6, 7, 8 ]);
    });
});

describe( 'single base class', () => {
    it( 'executes @before in a proper order', () => {
        class A {
            @before test(){
                testSequence( 1 ).call( this );
            }
        }

        @mixins( A )
        class Test extends TestMixin {
            @doBefore( testSequence( 2 ) )
            @before test(){
                testSequence( 3 ).call( this );
            }
        }

        const test = new Test();
        expect( test.test() ).toEqual( undefined );
        test.hasSequence( [ 1, 2, 3 ] );
    });

    it( 'executes @after in a reverse order', () => {
        class A {
            @after test(){
                testSequence( 3 ).call( this )
            }
        }

        @mixins( A )
        class Test extends TestMixin {            
            @doAfter( testSequence( 2 ) )
            @doAfter( testSequence( 1 ) )
            test(){
                return 'test'
            }
        }

        const test = new Test();
        expect( test.test() ).toEqual( 'test' );
        test.hasSequence( [ 1, 2, 3 ] );
    })

    it( 'executes @around in a proper order', () => {
        class A {
            @around test(){
                return testAround( 1 ).call( this );
            }
        }

        @mixins( A )
        class Test extends TestMixin {
            @doAround( testAround( 2 ) )
            @doAround( testAround( 3 ) )
            test(){
                return 'test'
            }
        }

        const test = new Test();
        expect( test.test() ).toEqual( [ 1, 2, 3, "test" ] );
        test.hasSequence( [ 1, 2, 3 ] );
    })
});

describe( 'Two base classes', () => {
    it( 'before executed in order', () => {
        class A {
            @doBefore( testSequence( 1 ) )
            test(){}
        }
    
        class B {
            @doBefore( testSequence( 2 ) )
            test(){}
        }
    
        @mixins( A, B )
        class C extends TestMixin {
            @doBefore( testSequence( 3 ) )
            test(){ return 'c'; }
        }
    
        const c = new C();
    
        expect( c.test() ).toEqual( 'c' );
        c.hasSequence([ 1, 2, 3 ]);    
    });

    it( 'after executed in order', () => {
        class A {
            @doAfter( testSequence( 3 ) )
            test(){}
        }
    
        class B {
            @doAfter( testSequence( 2 ) )
            test(){}
        }
    
        @mixins( A, B )
        class C extends TestMixin {
            @doAfter( testSequence( 1 ) )
            test(){ return 'c'; }
        }
    
        const c = new C();
    
        expect( c.test() ).toEqual( 'c' );
        c.hasSequence([ 1, 2, 3 ]);    
    });

    it( 'before, after, around are executed in order', ()=>{
        class A {
            @doBefore( testSequence( 1 ) )
            @doAround( testAround( 4 ) )
            @doAfter( testSequence( 10 ) )
            test(){
                testSequence( 'never' ).call( this )
            }
        }
    
        class B {
            @doBefore( testSequence( 2 ) )
            @doAround( testAround( 5 ) )
            @doAfter( testSequence( 9 ) )
            test(){
                testSequence( 'never' ).call( this )
            }
        }
    
        @mixins( A, B )
        class C extends TestMixin {
            @doBefore( testSequence( 3 ) )
            @doAround( testAround( 6 ) )
            @doAfter( testSequence( 8 ) )
            test(){
                testSequence( 7 ).call( this )
                return 'c';
            }
        }
    
        const c = new C();
    
        expect( c.test() ).toEqual([ 4, 5, 6, 'c' ]);
        c.hasSequence([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
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

describe( 'diamond problem', () => {
    it( 'never merge mixins twice', () => {
        class A {
            log : string

            @before a(){
                this.log += 'A';
            }
        }

        @mixins( A )
        class B {
            log : string

            @before a(){
                this.log += 'B';
            }
        }

        @mixins( A )
        class C {
            log : string

            @before a(){
                this.log += 'C';
            }
        }

        @mixins( B, C )
        class D {
            log = ''

            @before a(){
                this.log += 'D';
            }
        }

        const d = new D();

        d.a();

        expect( d.log ).toEqual( 'ABCD' );

    })
})

describe( 'design patterns', () => {
    it( 'attach the trace hook in a subtype', () => {
        class Base {
            method(){
                return 'Base';
            }
        }

        @mixins( Base )
        class Subtype {
            trace = [];

            @after method(){
                this.trace.push( 'Subtype' );
            }
        }

        const t = new Subtype();
        expect( t.method() ).toEqual( 'Base' );
        expect( t.trace ).toEqual( [ 'Subtype' ]);
    } );

    it( 'attach the trace hook in a base type', () => {
        class Base {
            trace = [];

            @after method(){
                this.trace.push( 'Base' );
            }
        }

        interface Subtype extends Base {}
        @mixins( Base )
        class Subtype {
            constructor(){
                superMixins( this );
            }

            method(){
                return 'Subtype';
            }
        }

        const t = new Subtype();
        expect( t.method() ).toEqual( 'Subtype' );
        expect( t.trace ).toEqual( [ 'Base' ]);
    } );

    it( 'react mixin', () => {
        class ComponentMixin {
            _newMember : string

            @after componentWillMount(){
                this._newMember = 'my private state';
            }

            @around render(){
                const nodes = callNextMethod();

                return '<div>' + nodes + '</div>';
            }
        }

        interface ReactComponent extends ComponentMixin{}
        @mixins( ComponentMixin )
        class ReactComponent {
            render(){
                return "something"
            }
        }

        const t = new ReactComponent();

        t.componentWillMount();
        expect( t._newMember ).toEqual( 'my private state' );
        expect( t.render() ).toEqual( '<div>something</div>' );
    })
});