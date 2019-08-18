import { mixins, before, after, around, callNextMethod } from './index'

class SimpleMixin {
    a(){ return 'SimpleMixin'; }
    b(){ return 'SimpleMixin'; }
    c(){ return 'SimpleMixin'; }
}

class ComplexMixin {
    @before
    a(){ return 'ComplexMixin'; }

    @after
    b(){ return 'ComplexMixin'; }

    @around
    c(){
        callNextMethod();
        return 'ComplexMixin';
    }
}

function anotherComplexMixin(){
    return "AnotherComplexMixin";
}

class AnotherComplexMixin {
    @before( anotherComplexMixin )
    a(){ return 'ComplexMixin'; }

    @after
    b(){ return 'ComplexMixin'; }

    @around
    c(){
        callNextMethod();
        return 'ComplexMixin';
    }
}

interface SimpleTarget extends SimpleMixin, ComplexMixin {}
@mixins( SimpleMixin, ComplexMixin )
class SimpleTarget {
    a(){ return 'SimpleTarget'; }
}