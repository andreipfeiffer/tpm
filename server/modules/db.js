module.exports = (() => {

    'use strict';

    var server   = require('../../server'),
        knex     = server.knex,
        config   = require('../../config'),
        schema   = require('../schema'),
        queries  = Object.keys(schema.structure);

    return {
        createDb(isOnServerStart) {
            return new Promise((resolve, reject) => {
                const queryList = [];
                
                if ( isOnServerStart && process.env.NODE_ENV === 'test' ) {
                    return resolve(false);
                }

                knex
                    .raw('CREATE DATABASE IF NOT EXISTS ' + config.mysql.database + ' DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci')
                    .then(() => {
                        queries.forEach(item => {
                            queryList.push(
                                knex
                                    .raw( schema.structure[item] )
                                    .then(() => knex(item).select())
                                    .then(data => {
                                        if ( data.length === 0 && schema.populate[item] ) {
                                            return knex.raw( schema.populate[item] );
                                        } else {
                                            // just to return a promise
                                            return knex(item).select();
                                        }
                                    })
                                    .catch(err => console.log('Error -> db.createDb() -> populate -> ' + err))
                            );
                        });

                        Promise
                            .all( queryList )
                            .then(() => resolve(true));
                    })
                    .catch(err => {
                        console.log('Error -> db.createDb() -> create db -> ' + err);
                        reject(err);
                    });
            });
        },

        dropDb() {
            return new Promise((resolve) => {
                const queryList = [];

                // prevent deleting in production
                if (process.env.NODE_ENV === 'production') {
                    return resolve(false);
                }
    
                queries.forEach(item => {
                    queryList.push( knex.raw('DROP TABLE ' + item) );
                });
    
                Promise
                    .all( queryList )
                    .then(() => resolve(true));
            });
        }
    };

})();
