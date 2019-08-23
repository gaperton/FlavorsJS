import { mixin, mixins, applyNextMethod, superMixins, before, after, doAfter, doAround, doBefore, around, callNextMethod, join } from './index'

/**
 * Think about grouping some stuff.
 * 
 * mixin.super() 
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
     })
 })