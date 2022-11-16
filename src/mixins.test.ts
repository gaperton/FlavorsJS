import { mixins, mixin, before, after, around, join } from './index'

import { TestMixin, testAround, testSequence } from './test-commons'

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
        return 'ComplexMixin' + ( mixin.nextAround() || '' );
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
            @after.do( testSequence( 8 ) )
            @before.do( testSequence( 1 ) )
            @after.do( testSequence( 7 ) )
            @before.do( testSequence( 2 ) )
            @after.do( testSequence( 6 ) )
            @before.do( testSequence( 3 ) )

            @around.do( testAround( 4 ) )
            @around.do( testAround( 5 ) )

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

        @mixin.extends( A )
        class Test extends TestMixin {
            @before.do( testSequence( 2 ) )
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

        @mixin.extends( A )
        class Test extends TestMixin {            
            @after.do( testSequence( 2 ) )
            @after.do( testSequence( 1 ) )
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

        @mixin.extends( A )
        class Test extends TestMixin {
            @around.do( testAround( 2 ) )
            @around.do( testAround( 3 ) )
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
            @before.do( testSequence( 1 ) )
            test(){}
        }
    
        class B {
            @before.do( testSequence( 2 ) )
            test(){}
        }
    
        @mixin.extends( A, B )
        class C extends TestMixin {
            @before.do( testSequence( 3 ) )
            test(){ return 'c'; }
        }
    
        const c = new C();
    
        expect( c.test() ).toEqual( 'c' );
        c.hasSequence([ 1, 2, 3 ]);    
    });

    it( 'after executed in order', () => {
        class A {
            @after.do( testSequence( 3 ) )
            test(){}
        }
    
        class B {
            @after.do( testSequence( 2 ) )
            test(){}
        }
    
        @mixin.extends( A, B )
        class C extends TestMixin {
            @after.do( testSequence( 1 ) )
            test(){ return 'c'; }
        }
    
        const c = new C();
    
        expect( c.test() ).toEqual( 'c' );
        c.hasSequence([ 1, 2, 3 ]);    
    });

    it( 'before, after, around are executed in order', ()=>{
        class A {
            @before.do( testSequence( 1 ) )
            @around.do( testAround( 4 ) )
            @after.do( testSequence( 10 ) )
            test(){
                testSequence( 'never' ).call( this )
            }
        }
    
        class B {
            @before.do( testSequence( 2 ) )
            @around.do( testAround( 5 ) )
            @after.do( testSequence( 9 ) )
            test(){
                testSequence( 'never' ).call( this )
            }
        }
    
        @mixin.extends( A, B )
        class C extends TestMixin {
            @before.do( testSequence( 3 ) )
            @around.do( testAround( 6 ) )
            @after.do( testSequence( 8 ) )
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
        @mixin.extends( SimpleMixin )
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
        @mixin.extends( ComplexMixin )
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
        @mixin.extends( SimpleMixin, ComplexMixin )
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

        @mixin.extends( A )
        class B {
            log : string

            @before a(){
                this.log += 'B';
            }
        }

        @mixin.extends( A )
        class C {
            log : string

            @before a(){
                this.log += 'C';
            }
        }

        @mixin.extends( B, C )
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
});

describe( 'join pattern', () => {
    class A {
        a = true
    }

    class B {
        // b = true
        b;
        _constructor() {
            this.b = true;
        }
    }

    it( 'works', () => {
        const C = join( A, B );
        const c = new C();

        expect( c.a ).toBe( true );
        expect( c.b ).toBe( true );
    });

    it( 'can be extended', () => {
        class C extends join( A, B ) {
            c = true;
        }

        const c = new C();
        expect( c.a ).toBe( true );
        expect( c.b ).toBe( true );
        expect( c.c ).toBe( true );
    });
});

describe( 'design patterns', () => {
    it( 'attach the trace hook in a subtype', () => {
        class Base {
            method(){
                return 'Base';
            }
        }

        @mixin.extends( Base )
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
            // trace = [];
            trace;
            _constructor(){
                this.trace = [];
            }

            @after method(){
                this.trace.push( 'Base' );
            }
        }

        interface Subtype extends Base {}
        @mixin.extends( Base )
        class Subtype {
            constructor(){
                mixin.super( this );
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
                const nodes = mixin.nextAround();

                return '<div>' + nodes + '</div>';
            }
        }

        interface ReactComponent extends ComponentMixin{}
        @mixin.extends( ComponentMixin )
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

describe( 'inheritance chains', () => {
   it( 'have a long inheritance', () => {
       abstract class Base1 {
           public method1() { return 1; }
           public overridden() { return 1; }
       }
       abstract class Base2 extends Base1 {
           public method2() { return 2; }
           public overridden() { return 2; }
       }
       abstract class Base3 extends Base2 {
           public method3() { return 3; }
           public overridden() { return 3; }
       }
       abstract class Base4 extends Base3 {
           public method4() { return 4; }
           public overridden() { return 4; }
       }
       
       class Mixin1 {
           public mixed1() { return "m1"; }
       }
       
       @mixins(Mixin1)
       class A extends Base4 {
           public methodA() { return "a" };
       }
       interface A extends Mixin1 {}
       
       var a = new A();
       expect( a.overridden() ).toEqual( 4 );
       expect( a.method1() ).toEqual( 1 );
       expect( a.method2() ).toEqual( 2 );
       expect( a.method3() ).toEqual( 3 );
       expect( a.method4() ).toEqual( 4 );
       expect( a.methodA() ).toEqual( "a" );
       expect( a.mixed1() ).toEqual( "m1" );
   });

   it( 'base class and inheritance in mixin', () => {
       abstract class Base1 {
           public method1() { return 1; }
       }
       
       class Mixin1 {
           public mixed1() { return "m1"; }
           public mixedOverride() { return "1"; }
       }
       
       class Mixin2 extends Mixin1 {
           public mixed2() { return "m2"; }
           public mixedOverride() { return "2"; }
       }
       
       @mixins(Mixin2)
       class A extends Base1 {
           public methodA() { return "a" };
       }
       interface A extends Mixin2 {}
       
       var a = new A();
       expect( a.method1() ).toEqual( 1 );
       expect( a.methodA() ).toEqual( "a" );
       expect( a.mixed1() ).toEqual( "m1" );
       expect( a.mixed2() ).toEqual( "m2" );
       expect( a.mixedOverride() ).toEqual( "2" );
   });
});