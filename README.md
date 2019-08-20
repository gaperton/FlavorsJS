# Flavors object model for JS

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

### @afterSet( fun ) prop

Execute the given function after the value has changed.

```javascript
class Observer {
    @afterSet( function(){
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

### @beforeSet( fun ) prop

Execute the given function before the value has changed.

```javascript
class Observer {
    @beforeSet( function( x ){
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

### @aroundSet( fun ) prop

Tap into the property modification process.

```javascript
class Observer {
    @aroundSet( function( x ){
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
