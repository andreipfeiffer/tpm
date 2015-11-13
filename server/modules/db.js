module.exports = (function() {

    'use strict';

    var server   = require('../../server'),
        knex     = server.knex,
        config   = require('../../config'),
        schema   = require('../schema'),
        promise  = require('node-promise'),
        deferred = promise.defer,
        queries  = Object.keys(schema.structure);

    return {
        createDb: function(isOnServerStart) {
            var d = deferred(),
                queryList = [];

            if ( isOnServerStart && process.env.NODE_ENV === 'test' ) {
                d.resolve(false);
                return d.promise;
            }

            knex.raw('CREATE DATABASE IF NOT EXISTS ' + config.mysql.database + ' DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci').then(function() {

                queries.forEach(function(item) {
                    queryList.push(
                        knex.raw( schema.structure[item] ).then(function() {
                            return knex(item).select();
                        }).then(function(data) {
                            if ( data.length === 0 && schema.populate[item] ) {
                                return knex.raw( schema.populate[item] );
                            } else {
                                // just to return a promise
                                return knex(item).select();
                            }
                        }).catch(function(err) {
                            console.log('Error -> db.createDb() -> populate -> ' + err);
                        })
                    );
                });

                promise.all( queryList ).then(function() {
                    d.resolve(true);
                });

            }).catch(function(err) {
                console.log('Error -> db.createDb() -> create db -> ' + err);
                d.reject(err);
            });

            return d.promise;
        },

        dropDb: function() {
            var d = deferred(),
                queryList = [];

            // prevent deleting in production
            if (process.env.NODE_ENV === 'production') {
                d.resolve(false);
                return d.promise;
            }

            queries.forEach(function(item){
                queryList.push( knex.raw('DROP TABLE ' + item) );
            });

            promise.all( queryList ).then(function() {
                d.resolve(true);
            });

            return d.promise;
        }
    };

})();
