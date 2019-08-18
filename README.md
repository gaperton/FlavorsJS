# TODO

## API

### @mixins( A, B, ... )

Merge mixins in the given order.

### @mixins

When `@mixins` decorator is called without arguments, apply base class method combinations as if the inheritance would be the mixin

### @before method( a, b, ... ){ ... }

Execute the given function before the method will be called.
When called with argument `@before( fun )`, attaches the given function as before combination while treating the method as primary.

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

    shoulComponentUpdate( nextProps ){
        return nextProps.b !== this.props.b;
    }
}
```

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