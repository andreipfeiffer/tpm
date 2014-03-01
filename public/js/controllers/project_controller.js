(function() {

    'use strict';

    TPM.ProjectController = Ember.ObjectController.extend({
        isCompleted: function(key, value){
            var model = this.get('model');

            if (value === undefined) {
                // property being used as a getter
                return model.get('isCompleted');
            } else {
                // property being used as a setter
                model.set('isCompleted', value);
                model.save();
                return value;
            }
        }.property('model.isCompleted'),

        actions: {
            view: function() {
                var model = this.get('model');
                console.log(model);
                // this.transitionToToute('project/' + model.id);
            },
            edit: function() {
                var model = this.get('model');
                console.log(model);
            },
            remove: function() {
                var model = this.get('model');
                model.deleteRecord();
                model.save();
            }
        }
    });

})();