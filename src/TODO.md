# TODO

- analyze conditions when it's safe to use mixins together with classes.
- 

(?)
Consider the restriction that only the class with no-arguments-constructor can be a mixin.
It assumes that regular inheritance might still be needed.
(?)

## extends join( A, B, ... )

The features of this pattern:

- Automatic mixins members initialization, no way to make a mistake.
- TS type is automatically inferred, no need to do manual declaration mergeing.
- Impossible to mix classes with mixins.

When it doesn't work without class decorator?

- Method override won't merge combinations properly.

Options:

- Use it as a notation to define mixins. Forbid mixins to have regular base classes. Use `@mixin` decorator to make it explicit.

    @mixin class A extends B {
        
    }

    @mixin class A extends join( B, C, D ) {

    }

- Allow merging mixins to regular classes with a decorator. Disallow regular classes to be used as a mixin.

    @mixins( C, D )
    class A extends B 

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





