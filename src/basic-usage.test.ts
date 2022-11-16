import { mixin, join } from './index'

describe( 'basic usage', () => {
    it('uses join to implement multiple inheritance', () => {
        class A {
            a = 1;
            
            f(){
                return 'a';
            }
        }
        
        class B {
            // b = 1;
            b;
            
            _constructor() {
                this.b = 1;
            }
        
            g(){
                return 'b';
            }
        }
        
        class C extends join( A, B ){
            g(){
                return 'c'
            }
        }
        
        const c = new C();
        
        expect( c.a ).toBe( 1 )
        expect( c.b ).toBe( 1 )
        expect( c.f() ).toBe( 'a' )
        expect( c.g() ).toBe( 'c' )
    })
    
    it( 'uses mixin.extend to implement multiple inheritance', () => {
        class A {
            // a = 1;
            a;
            
            _constructor() {
                this.a = 1;
            }
            
            f(){
                return 'a';
            }
        }
        
        class B {
            // b = 1;
            b;

            _constructor() {
                this.b = 1;
            }


            g(){
                return 'b';
            }
        }
        
        interface C extends A, B {}
        @mixin.extends( A, B )
        class C {
            constructor(){
                mixin.super( this );
            }
        
            g(){
                return 'c'
            }
        }
        
        const c = new C();
        
        expect( c.a ).toBe( 1 )
        expect( c.b ).toBe( 1 )
        expect( c.f() ).toBe( 'a' )
        expect( c.g() ).toBe( 'c' )
    });
});
