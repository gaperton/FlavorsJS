# Flavors object model for JS (development preview)

Mixin engine for modern JS and TypeScript inspired by Howard I. Cannon work for MIT Lisp Machine as described in [Flavors: A non-hierarchical approach to object-oriented programming](http://www.softwarepreservation.org/projects/LISP/MIT/nnnfla1-20040122.pdf).

write something about origins of Flawors and problems it solves

## Design considerations

While admiring the awesome work done by Howard I. Cannon on Flavors for MIT LISP Machine and the LISP community in general during the design of CLOS, we don't have an intent to dramatically change the way how JS developer write his code.

- It must work with both JavaScript and TypeScript naturally, being felt like an evolutionary step forward from traditional JS classes and mixins.
- It must augment the standard JS class models, not substitute it.
- It must utilize TypeScript typeckecking to a maximum possible degree.

## API

### @mixins( A, B, ... )

Merge mixins in the given order.

### @mixins

When `@mixins` decorator is called without arguments, apply base class method combinations as if the inheritance would be the mixin

### @before method( a, b, ... ){ ... }

Execute the given function before the method will be called. Equivalent to `@doBefore( function( a, b, ... ){...} ) method(){}`

```javascript
class A {
    ...

    @before componentWillMount(){
        this.something = "Hi";
    }
}

@mixins( A )
class B {
    componentWillMount(){
        this.state = { text : this.something };
    }
    ...
}
```

### @doBefore( aspect ) method( a, b, ... ){ ... }

The general form of `@before` attaching the before aspect to the given primary method.

### @after method( a, b, ... ){ ... }

Execute the given function after the method will be called. Works similar to before.

```javascript
@mixins( Events )
class A {
    @after componentWillUnmount(){
        this.stopListening()
    }
}

@mixins( A )
class B {
    componentWillUnmount(){
        console.log( 'Unmounting' );
    }
}
```

### @doAfter( aspect ) method( a, b, ... ){ ... }

The general form of `@after`.

## Interaction with extended classes

That can create a mess when combined with inheritance. Possible options are:

- Don't work with inheritance at all. Throw exceptions if inheritance is detected. That would seriously restrict FlavorJS applications.
- Treat inheritance as a special case of mixins, preserving the FlavorsJS semantic.

We're going to explore the second option.

To do that, we need to inspect the target's prototype if it have another prototype different from `Object.prototype`. And if it does,
perform the merge in a same way we do with mixins.

(?!)
What if we will have a base class with a constructor performing the lazy application of the mixins across the prototype chain?
It would guarantee from errors.
(?!)

An open question is what to do with members visible across the prototype chain. The valid behavior would be to traverse them, as it seems to be the single correct option to work with traditional class hierarchies.

There's a special case where one of the base classes in a chain has mixins, was extended with a plain class, and then is extended with mixins.

### Test cases

#### Plain base class A

- A extended by B with aspects. (?) Should aspects decorators resolve base class methods immediately (?)
- B extends A, C extends B with aspects.
- A extended by B with mixins.

#### Base class with aspects

- A with aspects extended by plain class B
- A with aspects extended by class B with aspects
- A with aspects extended by class B with mixins

#### Base class with mixins

- A extended by B with mixins
- A extended by B with aspects

## Initialization

### superMixins( this, a, b, ... )

Call all the mixins constrtuctors with a given set of arguments. Similar to the standard `super()`.

## `around` method combination

### @around method( a, b, ... ){ ... }

Wrap the method call into the given function. The original method can be called with `applyNextMethod()` and `callNextMethod( a, b, ... )`.

```javascript
class A {
    ...

    @around(
        function( nextProps ){
            return applyNextMethod() && nextProps.a !== this.props.a;
        }
    )
    shouldComponentUpdate( nextProps ){
        return true;
    }
}

@mixins( A )
class B {
    ...

    shouldComponentUpdate( nextProps ){
        return nextProps.b !== this.props.b;
    }
}
```

### @doAround( aspect ) method( a, b, ... ){ ... }

The general form of `@around`.

### applyNextMethod()

Call the next method in chain with the original set of the arguments.

### callNextMethod( a, b, ... )

Call the next method in chain with a different set of arguments.

## TODO: Properties combinations

### @doAfterSet( fun ) prop

Execute the given function after the value has changed.

```javascript
class Observer {
    @doAfterSet( function(){
        console.log( `I see you, ${ this.value }!` );
    }) value;
}

@mixins( Observer )
class B {
    ...

    doSomething(){
        this.value = 5; // Will print "I see you, 5"
    }
}
```

### @doBeforeSet( fun ) prop

Execute the given function before the value has changed.

```javascript
class Observer {
    @doBeforeSet( function( x ){
        console.log( `I see you last time, ${ x }!` );
    }) value;
}

@mixins( Observer )
class B {
    ...

    doSomething(){
        this.value = 5; // Will print "I see you, 5"
    }
}
```

### @doAroundSet( fun ) prop

Tap into the property modification process.

```javascript
class Observer {
    @doAroundSet( function( x ){
        callNextFunction( Number( x ) );
    }) value;
}

@mixins( Observer )
class B {
    ...

    doSomething(){
        this.value = 5; // Will print "I see you, 5"
    }
}
```
