(function() {

    'use strict';

    Todos.Todo = DS.Model.extend({
        idUser: DS.attr('number'),
        title: DS.attr('string'),
        isCompleted: DS.attr('boolean')
    });

})();