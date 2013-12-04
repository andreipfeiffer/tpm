(function() {

    'use strict';

    Todos.Todo = DS.Model.extend({
        // id: DS.attr('number'),
        idUser: DS.attr('number'),
        title: DS.attr('string'),
        isCompleted: DS.attr('boolean')
    });

})();