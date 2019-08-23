import { mixin, mixins, before, after, around, join } from './index'

import { TestMixin, testAround, testSequence } from './test-commons'

/**
 * Think about grouping some stuff.
 * 
 * mixin.applyNextAround()
 * mixin.nextAround( a, b, ... )
 * 
 * @mixin.join( A )
 * 
 * @around.do( smth )
 */

 describe( 'Base class as mixin', () => {
     it( 'Does nothing with regular class', () => {
         class A {
             a = 1;
             b(){ return 'a' }
             c(){ return 'a' }
         }

         @mixin class B extends A {
             b(){ return 'b' }
         }

         const b = new B();

         expect( b.a ).toBe( 1 );
         expect( b.b() ).toBe( 'b' );
         expect( b.c() ).toBe( 'a' );
     });

     it( 'combinations in subclass', () => {
        class A extends TestMixin {
            a = 1;
            b(){
                testSequence( 2 ).call( this );
                return 'b'
            }
            c(){ return 'a' }
        }

        @mixin class B extends A {
            @before b(){ testSequence( 1 ).call( this ); return '' }
        }

        const b = new B();

        expect( b.a ).toBe( 1 );
        expect( b.b() ).toBe( 'b' );
        expect( b.c() ).toBe( 'a' );
        b.hasSequence([ 1, 2 ]);
    })

    it( 'combinations in base class', () => {
        class A extends TestMixin {
            a = 1;
            @before b(){ testSequence( 1 ).call( this ); return '' }
            c(){ return 'a' }
        }

        @mixin class B extends A {
            b(){
                testSequence( 2 ).call( this );
                return 'b'
            }
        }

        const b = new B();

        expect( b.a ).toBe( 1 );
        expect( b.b() ).toBe( 'b' );
        expect( b.c() ).toBe( 'a' );
        b.hasSequence([ 1, 2 ]);
    });

    it( 'constructor is called once', () => {
        class A extends TestMixin {
            constructor(){
                super();
                testSequence( 1 ).call( this )
            }
        }

        @mixin class B extends A {
            constructor(){
                super();
                mixin.super( this );
            }
        }

        const b = new B();

        b.hasSequence([ 1 ]);
    });
 });

 describe( 'mix inheritance with mixins', () => {
    it( 'Base class constructor not called twice', () => {
        class A extends TestMixin {
            constructor(){
                super();
                testSequence( 1 ).call( this )
            }
        }

        @mixins( A ) class B extends A {
            constructor(){
                super();
                mixin.super( this );
            }
        }

        const b = new B();

        b.hasSequence([ 1 ]);
    });

    it( 'Base class is not merged twice', () => {
        class A extends TestMixin {
            @before test(){
                testSequence( 1 ).call( this );
            }
        }

        @mixins( A ) class B extends A {
            test(){
                testSequence( 2 ).call( this );
                return 'b';
            }
        }

        const b = new B();

        expect( b.test() ).toBe( 'b' );
        b.hasSequence([ 1, 2 ]);
    });
 });