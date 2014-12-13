module.exports = function(knex) {

    'use strict';

    return {
        logError: function(idUser, type, content) {
            return knex('error_log')
                .insert({
                    idUser: idUser,
                    type: type,
                    content: JSON.stringify(content)
                });
        }
    };

};