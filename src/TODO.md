# TODO

(?)
Consider the restriction that only the class with no-arguments-constructor can be a mixin.
It assumes that regular inheritance might be needed.
(?)

## extends join( A, B, ... )

### Definition

- Mixin merge operation produce the mixin class with all the mixins merged.
- It calls all the constructors with no arguments.
- (?) It inherits from the first mixin. All ctor arguments are passed to the first mixin, all others are called w/o arguments. (?)

    type Mixin<T> = ( new () => T ) | T
    function join<A, B>( a : Mixin<A>, b : Mixin<B> ) : () => A & B
    function join<A, B, C>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C> ) : new () => A & B & C
    function join<A, B, C, D>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D> ) : new () => A & B & C & D
    function join<A, B, C, D, E>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E> ) : new () => A & B & C & D & E
    function join<A, B, C, D, E, F>( a : Mixin<A>, b : Mixin<B>, c : Mixin<C>, d : Mixin<D>, e : Mixin<E>, f : Mixin<F> ) : new () => A & B & C & D & E & F
    function join( ...Mixins : any[] ) : any { ... }

### Relation to classic mixin

join


(1) `join( A, B, C )` is functional equivalent of `join( A, join( B, C ) )` and `join( join( A, B ), C )`, being an associative operation.

(2) `join( A, B )` is an equivalent of

    class A extends B





### Idea

```javascript
// Pattern A
@mixin class B extends A {}


@mixin class C extends join( A, B ){}


interface C extends B {}
@mixins( B )
class C extends A {
    constructor(){
        super();
        superMixins( this );
    }
}

interface C extends A, B {}
@mixins( A, B ) class C {
    constructor(){
    super();
    superMixins( this );
}
```